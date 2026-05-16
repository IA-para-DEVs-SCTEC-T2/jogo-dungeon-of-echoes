# Spec — Enemy

## Descrição
Inimigos são entidades hostis posicionadas na dungeon. No MVP, possuem comportamento simples: ficam parados ou se movem aleatoriamente. O combate ocorre quando o player colide com eles.

---

## Atributos

| Atributo    | Tipo          | Valor Padrão | Descrição                                                        |
|-------------|---------------|--------------|------------------------------------------------------------------|
| hp          | number        | —            | Pontos de vida atuais (derivado de `EnemyDef.hpBase` × escala)  |
| maxHp       | number        | —            | Pontos de vida máximos                                           |
| attack      | number        | —            | Dano base causado ao player (`EnemyDef.damageBase` × escala)    |
| xpReward    | number        | —            | XP concedido ao player ao morrer (`EnemyDef.xpBase` × escala)   |
| gridX       | number        | —            | Posição X no grid                                                |
| gridY       | number        | —            | Posição Y no grid                                                |
| alive       | boolean       | true         | Se o inimigo está vivo                                           |
| category    | EnemyCategory | `'undead'`   | Categoria DawnLike — determina o par de spritesheets (*0/*1)     |
| frameIndex  | number        | 0            | Índice do frame no spritesheet (mesmo em *0.png e *1.png)        |
| enemyDefId  | string        | `'skeleton'` | ID da definição em `enemies.config.ts`                           |
| enemyName   | string        | `'Inimigo'`  | Nome de exibição base (pode ser sobrescrito por `aiName`)        |
| animKey     | string        | `''`         | Chave da animação Phaser pré-calculada em spawn via `buildAnimKey()` |

---

## Spawn Procedural

Os atributos base de cada inimigo são definidos em `src/config/enemies.config.ts` via `EnemyDef[]`. A função `pickEnemyDef(floor)` escolhe aleatoriamente uma definição válida para o andar atual (filtrada pelo campo `minFloor`). HP, ATK e XP são então escalados pelos multiplicadores de `DifficultyScalingSystem`.

`EnemyCategory` determina o par de spritesheets DawnLike (`CATEGORY_TEXTURE_KEYS`):

| Categoria   | Spritesheet *0        | Spritesheet *1        |
|-------------|----------------------|-----------------------|
| `undead`    | `undead` (Undead0)   | `undead1` (Undead1)   |
| `humanoid`  | `humanoid0`          | `humanoid1`           |
| `pest`      | `pest0`              | `pest1`               |
| `misc`      | `misc0`              | `misc1`               |
| `reptile`   | `reptile0`           | `reptile1`            |
| `demon`     | `demon0`             | `demon1`              |

A chave de animação (`animKey`) é construída por `buildAnimKey(category, frameIndex)` no momento do spawn e pré-armazenada — nunca reconstruída por frame. Animações são registradas globalmente em `BootScene._registerEnemyAnims()` com ping-pong de 2 fps entre os dois frames da categoria.

## Inputs

- Posição inicial no grid (gridX, gridY) — deve ser tile FLOOR
- Referência ao grid da dungeon (para validar movimento futuro)

---

## Outputs

- Sprite renderizado na posição correta
- Evento `enemy-died` emitido quando HP chega a 0 (com referência ao inimigo)
- Evento `enemy-attacked` emitido quando ataca o player

---

## Regras

### Posicionamento
- R1: Inimigo só pode ser posicionado em tile FLOOR
- R2: Dois inimigos não podem ocupar o mesmo tile
- R3: Inimigo não pode ser posicionado no mesmo tile que o player

### Vida
- R4: HP nunca fica abaixo de 0
- R5: Quando HP = 0, `alive` = false, sprite removido, evento `enemy-died` emitido

### Comportamento (v0.2)
- R6: Inimigos possuem máquina de estados: `IDLE → CHASING → ATTACKING`
- R7: Detecção: entra em `CHASING` se player estiver na mesma sala BSP ou dentro do `detectionRadius` (8 tiles)
- R8: Movimento: 1 tile por turno em direção ao player, priorizando o eixo de maior distância; respeita paredes e colisão entre inimigos
- R9: Ataque: quando adjacente (distância Manhattan = 1), ataca com 80% de chance de acerto via `CombatSystem.attack()`
- R10: Inimigos só agem após a ação do jogador (controlado pelo `TurnManager`)

---

## Casos de Erro

| Situação                              | Comportamento Esperado                        |
|---------------------------------------|-----------------------------------------------|
| Posicionado em WALL                   | Reposicionar em FLOOR aleatório               |
| Dano recebido maior que HP atual      | HP vai para 0, emite `enemy-died`             |
| Tentativa de atacar inimigo morto     | Ignorado silenciosamente                      |

---

## Cenários Testáveis

### Cenário 1 — Inimigo recebe dano e morre
- **Dado**: Inimigo com HP = 10
- **Quando**: Recebe 15 de dano
- **Então**: HP = 0, `alive` = false, evento `enemy-died` emitido

### Cenário 2 — Inimigo recebe dano e sobrevive
- **Dado**: Inimigo com HP = 30
- **Quando**: Recebe 10 de dano
- **Então**: HP = 20, `alive` = true, nenhum evento de morte

### Cenário 3 — Inimigo morto não pode ser atacado
- **Dado**: Inimigo com `alive` = false
- **Quando**: Sistema de combate tenta aplicar dano
- **Então**: Nenhuma ação executada

### Cenário 4 — Spawn em posição válida
- **Dado**: Grid com salas geradas
- **Quando**: Inimigo é criado
- **Então**: `grid[gridY][gridX]` === FLOOR (1)
