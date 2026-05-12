# Spec — Sistema de Magias (Spells)

## Descrição

O sistema de magias permite ao jogador desbloquear, equipar e disparar feitiços em projétil durante a exploração da dungeon. As magias são desbloqueadas automaticamente ao atingir certos níveis e equipadas em dois slots (`Q` e `E`).

---

## Entidades Envolvidas

| Entidade / Sistema | Responsabilidade |
|--------------------|-----------------|
| `SpellSystem` | Gerencia desbloqueio, equipamento e cooldown dos slots |
| `SpellCastingSystem` | Orquestra o disparo: valida mana, desconta custo, instancia `Projectile` |
| `Projectile` | Sprite autônomo que se move em linha reta e detecta colisões |
| `spells.db.ts` | Banco de dados data-driven das definições de magia |
| `spell-progression.ts` | Tabela de desbloqueio por nível |
| `SpellsPanel` | UI para equipar magias nos slots |
| `StatusPanel` | UI de atributos detalhados do player |

---

## Tipos de Magia Disponíveis

| ID | Nome | Elemento | Dano | Mana | Cooldown | Nível mínimo |
|----|------|----------|------|------|----------|-------------|
| `fire_bolt` | Fire Bolt | fire | 15 | 8 | 800ms | 1 |
| `ice_shard` | Ice Shard | ice | 20 | 12 | 1100ms | 5 |
| `wind_cyclone` | Wind Cyclone | wind | 18 | 10 | 950ms | 10 |
| `fire_explosion` | Fire Explosion | fire | 35 | 22 | 2000ms | 15 |
| `blizzard` | Blizzard | ice | 45 | 30 | 2500ms | 20 |

---

## Slots de Magia

- O player possui **dois slots** (`equippedSpells[0]` e `equippedSpells[1]`)
- Slot 0 → tecla `Q` | Slot 1 → tecla `E`
- Cada slot armazena o ID da magia equipada, timestamp do último cast e cooldown da magia
- Uma magia só pode ser equipada se estiver em `player.unlockedSpells`

---

## Fluxo de Desbloqueio

1. `XPSystem` chama `SpellSystem.unlockSpellsForLevel(player, novoNível)` ao subir de nível
2. `SpellSystem` consulta `SPELL_PROGRESSION[nível]` — retorna array de IDs
3. IDs não presentes em `player.unlockedSpells` são adicionados
4. `EventBus` emite `EVENTS.SPELL_UNLOCKED` para cada magia nova

---

## Fluxo de Disparo

1. Player pressiona `Q` (slot 0) ou `E` (slot 1)
2. `GameScene` chama `SpellCastingSystem.cast(slotIndex, player, spellSystem, scene, now)`
3. `SpellCastingSystem` verifica:
   - Slot tem magia equipada → senão retorna `null`
   - `spellSystem.canCast(slotIndex, now)` → cooldown zerado
   - `player.mana >= spell.manaCost` → mana suficiente
4. Se válido: desconta mana, registra `recordCast`, emite `EVENTS.SPELL_CAST`, instancia `Projectile`
5. `Projectile` é adicionado à cena e move-se na direção `player.facingDir`

---

## Projétil (`Projectile`)

- Velocidade definida por `spell.projectileSpeed` (em tiles/frame)
- A cada frame, `updateMovement(dungeon)` verifica:
  - Tile destino é WALL → destrói o projétil
  - Distância até inimigo vivo < `HIT_RADIUS` (0.7 × TILE_SIZE) → aplica dano e destrói
- Ao destruir: reproduz `spell.impactAnimKey` e emite `EVENTS.PROJECTILE_HIT`

---

## Atributos em `Player`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `facingDir` | `'up' \| 'down' \| 'left' \| 'right'` | Última direção de movimento |
| `unlockedSpells` | `string[]` | IDs de magias desbloqueadas |
| `equippedSpells` | `[string \| null, string \| null]` | IDs equipados nos dois slots |

---

## Regras

- R1: Magias só são equipadas se estiverem em `unlockedSpells`
- R2: Cooldown é por slot, não global — os dois slots podem estar em cooldown simultaneamente
- R3: `SpellCastingSystem` nunca acessa `spells.db.ts` diretamente para dados de dano — usa `Projectile.damage`
- R4: `Projectile` não conhece `SpellSystem` — recebe `SpellDef` completo no construtor
- R5: Se mana insuficiente, o cast é silenciosamente ignorado (sem erro no console)
- R6: `spells.db.ts` é a única fonte de verdade para atributos de magia

---

## Casos de Erro

| Situação | Comportamento Esperado |
|----------|----------------------|
| Slot sem magia equipada | `cast()` retorna `null` |
| Cooldown ativo | `cast()` retorna `null` |
| Mana insuficiente | `cast()` retorna `null` |
| ID de magia inválido em `equippedSpells` | `cast()` retorna `null` (magia não encontrada no DB) |
| Projétil sai dos limites do grid | Destruído ao atingir tile WALL da borda |

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

### Cenário 5 — Projétil colide com parede
- **Dado**: Tile à frente do projétil é WALL
- **Quando**: `updateMovement(dungeon)` chamado
- **Então**: Projétil destruído; `EVENTS.PROJECTILE_HIT` emitido
