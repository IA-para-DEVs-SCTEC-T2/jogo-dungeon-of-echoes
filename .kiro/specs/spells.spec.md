# Spec — Sistema de Magias (Spells)

## Descrição

O sistema de magias permite ao jogador desbloquear, equipar e usar feitiços melee-range durante a exploração da dungeon. As magias atingem todos os inimigos adjacentes (4 tiles cardinais) ao custo de mana e respeitam cooldown por slot. São desbloqueadas automaticamente ao subir de nível e equipadas em dois slots (`J` e `K`).

---

## Entidades Envolvidas

| Entidade / Sistema | Responsabilidade |
|--------------------|-----------------|
| `SpellSystem` | Gerencia desbloqueio, equipamento e cooldown dos slots |
| `SpellCastingSystem` | Valida mana/cooldown, aplica dano em todos os inimigos adjacentes, retorna `SpellCastResult` |
| `spells.db.ts` | Banco de dados data-driven das definições de magia |
| `spell-progression.ts` | Tabela de desbloqueio por nível |
| `SpellsPanel` | UI integrada ao painel `I`; navegação por teclado |
| `StatusPanel` | UI de atributos detalhados do player |

---

## Tipos de Magia Disponíveis

| ID | Nome | Elemento | Dano | Mana | Cooldown | Área | Alcance | Nível mínimo |
|----|------|----------|------|------|----------|------|---------|-------------|
| `fire_bolt` | Fire Bolt | fire | 15 | 8 | 800ms | line | 2 | 1 |
| `ice_bolt` | Ice Bolt | ice | 18 | 8 | 900ms | line | 2 | 1 |
| `great_fire` | Great Fire | fire | 20 | 14 | 1500ms | radial | 3 | 1 (Mago) |
| `ice_shard` | Ice Shard | ice | 20 | 12 | 1100ms | adjacent | 1 | 5 |
| `wind_cyclone` | Wind Cyclone | wind | 18 | 10 | 950ms | adjacent | 1 | 10 |
| `fire_explosion` | Fire Explosion | fire | 35 | 22 | 2000ms | adjacent | 1 | 15 |
| `blizzard` | Blizzard | ice | 45 | 30 | 2500ms | adjacent | 1 | 20 |

---

## Slots de Magia

- O player possui **dois slots** (`equippedSpells[0]` e `equippedSpells[1]`)
- Slot 0 → tecla `J` | Slot 1 → tecla `K` (durante gameplay)
- Slots exibidos no footer (action bar), canto direito, tamanho 20×20, com barra de cooldown azul na base
- Uma magia só pode ser equipada se estiver em `player.unlockedSpells`

---

## Fluxo de Desbloqueio

1. `XPSystem` chama `SpellSystem.unlockSpellsForLevel(player, novoNível)` ao subir de nível
2. `SpellSystem` consulta `SPELL_PROGRESSION[nível]` — retorna array de IDs
3. IDs não presentes em `player.unlockedSpells` são adicionados
4. `EventBus` emite `EVENTS.SPELL_UNLOCKED` para cada magia nova

---

## Tipos de Área (`SpellAreaType`)

| Tipo | Comportamento |
|------|--------------|
| `adjacent` | 4 tiles cardinais imediatamente adjacentes ao player |
| `line` | Cada direção cardinal percorrida tile a tile até `range`; para ao atingir um inimigo ou o limite |
| `radial` | Todas as 8 direções (cardinais + diagonais) percorridas até `range`; pode acertar múltiplos alvos |

## Fluxo de Cast

1. Player pressiona `J` (slot 0) ou `K` (slot 1)
2. `GameScene` chama `SpellCastingSystem.cast(slotIndex, player, spellSystem, enemies, now)`
3. `SpellCastingSystem` verifica:
   - Slot tem magia equipada → senão retorna `null`
   - `spellSystem.canCast(slotIndex, now)` → cooldown zerado
   - `player.mana >= spell.manaCost` → mana suficiente
4. Se válido: desconta mana, registra `recordCast`, chama `findTargets(px, py, enemies, areaType, range)` para coletar alvos vivos
5. Retorna `SpellCastResult { success, damage, spellName, hitEnemies }`
6. `GameScene` itera `hitEnemies`: aplica dano, sincroniza barra de HP, concede XP se morreu
7. Se magia ofensiva (`hitEnemies` possível): chama `processEnemyTurns()` para disparar turno dos inimigos

---

## Navegação no Painel de Magias (tecla `I`)

- **←/→** — troca de aba (Status / Inventário / Magias)
- **↓** na aba Magias com foco nas abas → entra na lista, seleciona a primeira magia
- **↑** na primeira magia (índice 0) → volta o foco para as abas (deseleciona)
- **↑/↓** na lista → navega entre magias desbloqueadas
- **Enter / E** → equipa magia selecionada no slot J (0)
- **K** → equipa magia selecionada no slot K (1)
- `SPELLS_SELECTION_CHANGED` é emitido por `GameScene` e ouvido por `UIScene` para atualizar seleção visual

---

## Atributos em `Player`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `facingDir` | `'up' \| 'down' \| 'left' \| 'right'` | Última direção de movimento (reservado para uso futuro) |
| `unlockedSpells` | `string[]` | IDs de magias desbloqueadas |
| `equippedSpells` | `[string \| null, string \| null]` | IDs equipados nos dois slots |

---

## Regras

- R1: Magias só são equipadas se estiverem em `unlockedSpells`
- R2: Cooldown é por slot, não global — os dois slots podem estar em cooldown simultaneamente
- R3: `SpellCastingSystem` usa `EnemySystem` (não `Enemy`) — `takeDamage` exige o emitter da cena
- R4: Se nenhum inimigo adjacente, cast consome mana e cooldown e exibe mensagem no log
- R5: Se mana insuficiente ou cooldown ativo, `cast()` retorna `null` sem consumir recursos
- R6: `spells.db.ts` é a única fonte de verdade para atributos de magia

---

## Casos de Erro

| Situação | Comportamento Esperado |
|----------|----------------------|
| Slot sem magia equipada | `cast()` retorna `null` |
| Cooldown ativo | `cast()` retorna `null`; mana inalterada |
| Mana insuficiente | `cast()` retorna `null` |
| ID de magia inválido em `equippedSpells` | `cast()` retorna `null` |
| Nenhum inimigo adjacente | `hitEnemies = []`; log exibe "nenhum alvo adjacente" |

---

## Cenários Testáveis

### Cenário 1 — Desbloqueio automático ao subir de nível
- **Dado**: Player sobe para nível 5
- **Quando**: `XPSystem` processa o level-up
- **Então**: `player.unlockedSpells` contém `'ice_shard'`

### Cenário 2 — Equipar magia desbloqueada
- **Dado**: `'fire_bolt'` está em `unlockedSpells`
- **Quando**: `spellSystem.equipSpell(player, 'fire_bolt', 0)` chamado
- **Então**: `player.equippedSpells[0] === 'fire_bolt'` e retorna `true`

### Cenário 3 — Equipar magia não desbloqueada
- **Dado**: `'blizzard'` não está em `unlockedSpells`
- **Quando**: `spellSystem.equipSpell(player, 'blizzard', 0)` chamado
- **Então**: Retorna `false`; `equippedSpells[0]` inalterado

### Cenário 4 — Cast com cooldown ativo
- **Dado**: Slot 0 acabou de disparar; cooldown = 800ms; `now = lastCast + 400`
- **Quando**: `cast(0, ...)` chamado
- **Então**: Retorna `null`; mana do player inalterada

### Cenário 5 — Dano em múltiplos inimigos adjacentes
- **Dado**: Dois inimigos vivos nos tiles Norte e Leste do player; magia equipada com dano 15
- **Quando**: `cast(0, ...)` chamado com mana e cooldown válidos
- **Então**: `hitEnemies.length === 2`; ambos recebem 15 de dano
