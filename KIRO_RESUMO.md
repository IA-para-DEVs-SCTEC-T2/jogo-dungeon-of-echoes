# Resumo do Projeto — Dungeon of Echoes
> Gerado a partir dos arquivos em `.kiro/` para uso como contexto em ferramentas de IA.
> Versão do projeto: **0.3.0** — 2026-05-05

---

## Visão Geral

**Dungeon of Echoes** é um RPG roguelike tile-based jogado no browser, sem backend.
Inspirado em *Castle of the Winds*. Arquitetura modular em TypeScript + Phaser 4 + Vite.
Contexto acadêmico com estrutura preparada para integração futura de IA generativa (LLMs).

**Stack:** TypeScript · Phaser 4 · Vite · Vitest · Husky + Commitlint

---

## Princípios de Desenvolvimento (game-steering.md)

1. **Simplicidade primeiro** — se não está na spec, não implementa
2. **Modularidade** — cada sistema vive em seu módulo; comunicação via EventBus
3. **Spec-driven** — nenhuma feature existe sem spec em `.kiro/specs/`
4. **Iteração incremental** — cada entrega deve ser jogável

**Restrições:**
- Sem IA generativa no MVP (hooks preparados)
- Sem backend — 100% client-side
- Sem save — permadeath, cada sessão do zero
- Sistemas nunca importam cenas; cenas nunca calculam lógica de domínio

---

## Estrutura de Pastas

```
src/
  scenes/       → BootScene, GameScene, UIScene, GameOverScene
  systems/      → TurnManager, CombatSystem, EnemySystem, XPSystem, InventorySystem
  entities/     → Player, Enemy, Item
  generators/   → DungeonGenerator
  utils/        → constants.ts, EventBus.ts
tests/          → Vitest (108 testes)
.kiro/
  steering/     → game-steering.md (diretrizes gerais)
  specs/        → specs por sistema (ver abaixo)
docs/
  PRD.md
  prompts/      → um arquivo por membro da equipe
```

---

## Estado Atual (v0.3.0)

| Sistema | Status | Arquivo principal |
|---------|--------|-------------------|
| Dungeon (BSP) | ✅ | `src/generators/DungeonGenerator.ts` |
| Player | ✅ | `src/entities/Player.ts` |
| Movimento turn-based | ✅ | `src/systems/TurnManager.ts` |
| Combate (80% hit chance) | ✅ | `src/systems/CombatSystem.ts` |
| IA de inimigos | ✅ | `src/systems/EnemySystem.ts` |
| XP e level up | ✅ | `src/systems/XPSystem.ts` |
| HUD (UIScene overlay) | ✅ | `src/scenes/UIScene.ts` |
| **Inventário** | ✅ | `src/systems/InventorySystem.ts` |
| **Itens + Identificação** | ✅ | `src/entities/Item.ts` |
| **Action bar visual** | ✅ | `src/scenes/UIScene.ts` |
| FOG of War | 🔜 Spec pronta | `.kiro/specs/fog-of-war.spec.md` |
| Minimap | 🔜 Spec rascunho | `.kiro/specs/minimap.spec.md` |
| Múltiplos andares | ❌ Planejado | — |
| IA generativa | ❌ Planejado | — |

---

## Specs por Sistema

### Player (`player.spec.md`)
- Atributos: `hp`, `maxHp`, `xp`, `level`, `attack`, `gridX/Y`
- Atributos base RPG: `STR`, `INT`, `DEX`, `CON`, `WIS`, `CHA` (inicializados via `BASE_STATS`)
- `maxHp = CON × 5 + Nível × 3` | `maxMana = WIS × 4 + INT × 2`
- Inventário: `inventory: InventorySystem` (20 slots)
- Identificação: `identifiedItems: Record<string, boolean>` (reset ao reiniciar)
- Movimento: 4 direções (WASD/setas), apenas para FLOOR, 1 tile por turno
- HP: nunca < 0 nem > maxHp; ao chegar a 0 emite `player-died`
- XP: acumulativo; `xpToNextLevel = level × 100`; level up: `attack += 5`, recalcStats()

### Dungeon (`dungeon.spec.md`)
- Grid 2D: `WALL = 0`, `FLOOR = 1` — padrão 40×40 tiles
- Geração BSP: até 8 salas (4×4 a 10×8), corredores em L
- `startPos` sempre em FLOOR; borda sempre WALL
- Suporte a `seed` para reprodutibilidade
- `dungeon.isWalkable(x, y)` retorna false para WALL e fora dos bounds

### Combate (`combat.spec.md`)
- Acionado automaticamente ao mover para tile com inimigo vivo
- Fórmula: `hitChance = 80%`; miss → dano = 0
- Dano fixo = `attacker.attack` em caso de acerto
- Player ataca primeiro via TurnManager; inimigo age no turno seguinte
- Morte de inimigo → XP concedido imediatamente
- `CombatSystem.attack(attacker, defender): CombatResult`
- `CombatSystem.resolve(player, enemy)` mantido para compatibilidade com testes

### Inimigos (`enemy.spec.md`)
- `hp = 10`, `attack = 3`, `alive: boolean`
- Entidade pura: `Enemy.ts` (sem Phaser) — lógica de IA em `EnemySystem.ts`
- Estados: `IDLE → CHASING → ATTACKING`
- Detecção: player na mesma sala (bounds BSP) ou dentro de `detectionRadius = 8 tiles`
- Movimento: 1 tile/turno, eixo de maior distância primeiro, sem atravessar paredes
- Ataque: quando `distManhattan(enemy, player) === 1`, aplica `CombatSystem.attack()`
- Inimigos só agem após a ação do jogador (controlado pelo TurnManager)

### Sistema de Turnos (`TurnManager.ts`)
- Controla quem age: `isPlayerTurn(): boolean`
- Tipos de ação: `MOVE | ATTACK | USE_ITEM | WAIT`
- Fluxo: player age → `playerTurn = false` → todos inimigos agem → `playerTurn = true`
- Input ignorado fora do turno do player
- Morte do player: `playerTurn` fica `false` permanentemente

### XP (`xp.spec.md`)
- `xpToNextLevel = level × 100` (acumulativo)
- Level up: `attack += 5`, `recalcStats()` (recalcula maxHp/maxMana), HP restaurado
- Múltiplos level-ups encadeados em uma única concessão processados em sequência
- Valores ≤ 0 ou NaN ignorados

### Inventário (`InventorySystem.ts`)
- 20 slots (`MAX_SLOTS`); itens não stackam (1 por slot)
- `addItem(item)`: primeiro slot livre; seta `item.gridX/Y = null`
- `useItem(index, identifiedItems, hp, maxHp): UseItemResult`
- `isFull()`, `removeItem(index)`, `getInventoryLog(identifiedItems)`
- Slot cheio bloqueia coleta (emite "Inventário cheio!" no log)

### Itens e Identificação (`Item.ts`)
- Tipos: `potion_heal` (+10 HP) | `potion_poison` (-5 HP)
- `identified: boolean` por instância
- Nomes desconhecidos: "Poção Vermelha" (heal) / "Poção Azul" (poison)
- Nomes reais: "Poção de Cura" / "Poção de Veneno"
- `item.getDisplayName(identifiedItems)`: retorna nome real se `identified || identifiedItems[type]`
- Identificação ao usar: `identifiedItems[item.type] = true` → revela para todos do tipo na partida

### Game Loop (`gameloop.spec.md`)
- Estados: `PLAYING` | `GAME_OVER` | `PAUSED` (futuro)
- Cenas: `BootScene → GameScene` (+ `UIScene` em paralelo) → `GameOverScene`
- `GameScene.update()`: processa input → `TurnManager.processPlayerAction()` → atualiza sprites
- Input: `JustDown` (um keypress = um turno)

### Input (`input.spec.md`)
- W/↑ = Norte, S/↓ = Sul, A/← = Oeste, D/→ = Leste
- `SPACE` = WAIT (passa o turno)
- `I` = log do inventário (não consome turno)
- `1–9` = usa item do slot correspondente (consome turno)
- Input processado apenas em estado `PLAYING`

### EventBus (`utils/EventBus.ts`)
- Singleton sem dependência de Phaser — compatível com Node.js/Vitest
- `on<T>(event, fn, ctx)` / `off<T>(event, fn, ctx)` / `emit(event, data)`
- Eventos principais:
  - `PLAYER_HP_CHANGED` `{ hp, maxHp }`
  - `PLAYER_MANA_CHANGED` `{ mana, maxMana }`
  - `PLAYER_XP_CHANGED` `{ xp, xpNext }`
  - `PLAYER_LEVELED_UP` `{ level, maxHp, attack }`
  - `PLAYER_DIED`
  - `ENEMY_DIED` `{ enemy }`
  - `ITEM_PICKED_UP` `{ item, slotIndex }`
  - `ITEM_USED` `{ itemIndex }`
  - `UI_LOG` `message: string`

---

## Specs em Rascunho (não implementadas)

### FOG of War (`fog-of-war.spec.md`)
- Três estados por tile: `HIDDEN` (preto) | `REVEALED` (overlay escuro) | `VISIBLE` (normal)
- `visionRadius = 5` tiles, distância Chebyshev
- Revelação de sala inteira ao entrar
- Inimigos fora de `VISIBLE` não renderizados
- `FogSystem` puramente visual — não afeta movimento, combate ou IA

### Minimap (`minimap.spec.md`)
- Overlay fixo na UIScene, canto superior direito
- `tileSize = 2px`, `minimapSize = 80×80px` para grid 40×40
- Integra `visibilityGrid` do FogSystem: HIDDEN = preto, REVEALED = cinza, VISIBLE = branco
- Player = ponto azul; inimigos visíveis = ponto vermelho

---

## Roadmap

| Versão | Status | Entrega |
|--------|--------|---------|
| v0.1.0 | ✅ | MVP jogável (dungeon, player, combate, XP, HUD) |
| v0.1.1 | ✅ | TypeScript strict + tileset Dawnlike 16×16 |
| v0.1.2 | ✅ | Atributos RPG, UIScene, IA de inimigos, 48 testes |
| v0.2.0 | ✅ | TurnManager, Enemy puro, hit chance 80% |
| v0.3.0 | ✅ | Inventário, itens, identificação roguelike, action bar |
| v0.4.0 | 🔜 | FOG of War, múltiplos tipos de inimigo, escadas |
| v1.0.0 | ❌ | IA generativa (Claude Haiku), lore dinâmica |

---

## Convenções de Código

- Conventional Commits obrigatório (validado por Husky + Commitlint)
- Tipos: `feat` · `fix` · `refactor` · `docs` · `chore` · `test` · `perf`
- Escopos sugeridos: `player` · `dungeon` · `combat` · `xp` · `enemy` · `inventory` · `ui` · `input`
- Nenhuma feature sem spec em `.kiro/specs/`
- Sistemas não importam cenas; cenas não calculam lógica de domínio
- Feedback visual sempre via `EventBus.emit(EVENTS.UI_LOG, mensagem)`
