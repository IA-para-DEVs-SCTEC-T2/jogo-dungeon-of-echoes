# Plano: Fase 2 — Sistema de Turnos e Combate

## Contexto

O projeto **Dungeon of Echoes** tem a Fase 1 completa: geração de dungeon BSP, movimento grid-based, sistema de combate, IA de inimigos e HUD. Contudo, o "turn-based" atual é simulado via cooldown de 150ms em `GameScene.update()` — o jogo avança em tempo real com throttle, não puramente por ação do jogador. A Fase 2 exige arquitetura de turno real: o jogo só avança quando o jogador age, e inimigos só agem após o turno do jogador.

---

## Conflito entre fase_2.md e .kiro/specs/combat.spec.md

| Ponto | fase_2.md | .kiro/combat.spec.md |
|---|---|---|
| Chance de acerto | 80% (pode errar) | Sem aleatoriedade no MVP |

**Decisão:** Seguir `fase_2.md` (instrução corrente). Implementar 80% hit chance no `CombatSystem`.

---

## Arquivos a modificar / criar

| Arquivo | Ação |
|---|---|
| `src/systems/TurnManager.ts` | **CRIAR** — controla estado do turno |
| `src/entities/Enemy.ts` | **CRIAR** — entidade pura Enemy |
| `src/systems/CombatSystem.ts` | **ATUALIZAR** — adicionar 80% hit chance |
| `src/scenes/GameScene.ts` | **REFATORAR** — delegar ao TurnManager, remover cooldown real-time |
| `src/entities/Player.ts` | **ATUALIZAR** — ajustar hp=20, attack=5 base (se necessário) |

---

## Passo a Passo

### 1. Criar `src/entities/Enemy.ts`

Entidade pura, sem Phaser, sem sprite (sprite fica no GameScene):

```ts
export class Enemy {
  id: string
  gridX: number
  gridY: number
  hp: number
  maxHp: number
  attack: number
  alive: boolean

  constructor(gridX, gridY, hp = 10, attack = 3)
  takeDamage(amount: number): void  // seta alive=false se hp <= 0
  getPixelPos(): { x, y }           // gridX/Y * TILE_SIZE + offset
}
```

> `EnemySystem.ts` atual tem lógica de IA acoplada à entidade. O `Enemy.ts` é a entidade pura; a IA permanece em `EnemySystem.ts` (ou migra para `TurnManager`).

---

### 2. Criar `src/systems/TurnManager.ts`

Responsável pelo fluxo de turno. Não depende de Phaser.

```ts
type Action =
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'ATTACK'; targetId: string }
  | { type: 'WAIT' }

export class TurnManager {
  private playerTurn: boolean = true

  isPlayerTurn(): boolean

  processPlayerAction(
    action: Action,
    player: Player,
    enemies: Enemy[],
    dungeon: DungeonGenerator,
    combatSystem: CombatSystem,
    onEnemyTurn: (results: TurnResult[]) => void
  ): TurnResult
}
```

**Fluxo interno de `processPlayerAction`:**
1. Se `!playerTurn` → ignora
2. Resolve ação do player (MOVE, ATTACK ou WAIT)
3. `playerTurn = false`
4. Para cada inimigo vivo: executa turno (IA simples)
5. `playerTurn = true`
6. Retorna resultados agregados

---

### 3. Atualizar `src/systems/CombatSystem.ts`

Adicionar `attack(attacker, defender)` com 80% hit chance:

```ts
attack(attacker: { attack: number }, defender: { hp: number }): CombatResult {
  const hit = Math.random() < 0.80
  if (hit) {
    defender.hp -= attacker.attack
    return { hit: true, damage: attacker.attack }
  }
  return { hit: false, damage: 0 }
}
```

Manter `resolve(player, enemy)` existente para não quebrar testes.

---

### 4. IA dos Inimigos (dentro do TurnManager)

Para cada inimigo vivo durante o turno de inimigos:

```ts
const dx = Math.sign(player.gridX - enemy.gridX)
const dy = Math.sign(player.gridY - enemy.gridY)

const distX = Math.abs(player.gridX - enemy.gridX)
const distY = Math.abs(player.gridY - enemy.gridY)

// Adjacente ao player → ataca
if (distX + distY === 1) {
  combatSystem.attack(enemy, player)
} else {
  // Move em 1 eixo por turno (prioriza o de maior distância)
  if (distX >= distY && dungeon.isWalkable(enemy.gridX + dx, enemy.gridY)) {
    enemy.gridX += dx
  } else if (dungeon.isWalkable(enemy.gridX, enemy.gridY + dy)) {
    enemy.gridY += dy
  }
}
```

---

### 5. Refatorar `src/scenes/GameScene.ts`

- **Remover** cooldown de 150ms e `Date.now()` do movimento
- **Remover** loop de inimigos do `update()` (não mais em tempo real)
- **Adicionar** `TurnManager` como propriedade da cena
- No handler de input (teclado), chamar `turnManager.processPlayerAction(action, ...)`
- Callbacks para atualizar sprites, HP bars, message log após cada turno
- Morte do player: travar input (`playerTurn` fica false permanentemente), emitir `player-died`
- Morte de inimigo: remover sprite e da lista

---

### 6. Spawn de Inimigos

- Usar `createEnemies()` existente em `EnemySystem.ts` como referência
- Spawnar 3–5 inimigos com `hp=10`, `attack=3` (valores da Fase 2 conforme fase_2.md: player hp=20, attack=5)
- Posições aleatórias em `FLOOR` tiles, fora do spawn do player

---

### 7. Feedback Visual

Exibir no message log existente (UIScene já tem 5 linhas scrolláveis via EventBus):

- `"Você atacou e causou 5 de dano"`
- `"Você errou o ataque"`
- `"Inimigo atacou você por 3"`
- `"Você morreu"` / `"Inimigo morreu"`

---

## Verificação

1. `npm run dev` → iniciar o jogo
2. Mover o player com WASD/Arrows → confirmar que inimigos só se movem após ação
3. Colidir com inimigo → confirmar ATTACK (não MOVE)
4. Aguardar Game Over → confirmar tela exibida
5. Matar inimigo → confirmar remoção do mapa
6. `npm test` → todos os testes existentes devem continuar passando; adicionar testes para `TurnManager` e `Enemy`

---

## Ordem de Implementação

1. `Enemy.ts` (sem dependências)
2. `CombatSystem.ts` (adicionar `attack()`)
3. `TurnManager.ts` (usa Enemy, CombatSystem, Player, DungeonGenerator)
4. `GameScene.ts` (usa TurnManager, atualiza sprites)
5. Testes unitários para TurnManager e Enemy
