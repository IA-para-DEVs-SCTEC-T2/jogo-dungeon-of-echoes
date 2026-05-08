# Spec — Input

## Descrição
O sistema de input captura e interpreta as teclas pressionadas pelo jogador, traduzindo-as em ações do jogo (mover, atacar, esperar). O input é processado pela `GameScene` via `Phaser.Input.Keyboard.JustDown` — apenas um disparo por keypress. A ação é delegada ao `TurnManager`, que processa o turno completo (player + inimigos) antes de aceitar novo input.

---

## Teclas Mapeadas

| Tecla(s)         | Ação              | Direção / Efeito                        | Consome turno? |
|------------------|-------------------|-----------------------------------------|----------------|
| W ou ↑           | Mover / Atacar    | Norte (gridY - 1)                       | Sim            |
| S ou ↓           | Mover / Atacar    | Sul (gridY + 1)                         | Sim            |
| A ou ←           | Mover / Atacar    | Oeste (gridX - 1)                       | Sim            |
| D ou →           | Mover / Atacar    | Leste (gridX + 1)                       | Sim            |
| Espaço           | Esperar           | Passa o turno sem mover                 | Sim            |
| I                | Log inventário    | Lista itens no console e no log de UI   | Não            |
| 1–9              | Usar item         | Usa item do slot correspondente (0–8)   | Sim            |

> Diagonais não são suportadas. Tecla `I` e as numéricas 1–9 são verificadas antes do movimento.

---

## Inputs

- Eventos de teclado do Phaser (`Phaser.Input.Keyboard.KeyCodes`)
- Estado atual do jogo (`PLAYING` ou `GAME_OVER`)

---

## Outputs

- Ação resolvida: `{ type: 'move' | 'attack' | 'wait', dx, dy }`
- Evento `player-moved` emitido após movimento válido
- Evento `player-attacked` emitido quando tile destino contém inimigo
- Nenhuma saída se o estado do jogo não for `PLAYING`

---

## Regras

- R1: Input só é processado quando o estado do jogo é `PLAYING`
- R2: Apenas um input por keypress (`JustDown`) — segurar a tecla não repete a ação
- R3: Input bloqueado enquanto `TurnManager.isPlayerTurn()` retornar `false`
- R4: Teclas W/↑, S/↓, A/←, D/→ são equivalentes (ambas mapeiam para a mesma direção)
- R5: Se o tile destino é `FLOOR` e está vazio → ação `MOVE`
- R6: Se o tile destino contém um inimigo vivo → ação `ATTACK` (player não move)
- R7: Se o tile destino é `WALL` ou fora dos limites → input ignorado silenciosamente
- R8: Espaço gera ação `WAIT` — passa o turno sem mover, inimigos ainda agem

---

## Casos de Erro

| Situação                                  | Comportamento Esperado                          |
|-------------------------------------------|-------------------------------------------------|
| Tecla pressionada no estado `GAME_OVER`   | Ignorada completamente                          |
| Tecla não mapeada pressionada             | Ignorada silenciosamente                        |
| Tile destino fora dos limites do grid     | Input ignorado, player permanece na posição     |
| Múltiplas teclas pressionadas no mesmo frame | Apenas a primeira detectada é processada     |

---

## Cenários Testáveis

### Cenário 1 — Movimento para tile livre
- **Dado**: Estado `PLAYING`, player em (5, 5), tile (5, 4) é FLOOR e vazio
- **Quando**: Tecla W pressionada
- **Então**: Ação `{ type: 'move', dx: 0, dy: -1 }` gerada, `player-moved` emitido

### Cenário 2 — Ataque ao pressionar direção com inimigo
- **Dado**: Estado `PLAYING`, player em (5, 5), inimigo vivo em (6, 5)
- **Quando**: Tecla D pressionada
- **Então**: Ação `{ type: 'attack', dx: 1, dy: 0 }` gerada, `player-attacked` emitido, player não move

### Cenário 3 — Movimento bloqueado por parede
- **Dado**: Estado `PLAYING`, player em (5, 5), tile (5, 4) é WALL
- **Quando**: Tecla W pressionada
- **Então**: Nenhuma ação gerada, player permanece em (5, 5)

### Cenário 4 — Input ignorado no Game Over
- **Dado**: Estado `GAME_OVER`
- **Quando**: Qualquer tecla de movimento pressionada
- **Então**: Nenhuma ação gerada, nenhum evento emitido

### Cenário 5 — Esperar com Espaço
- **Dado**: Estado `PLAYING`, player em qualquer posição
- **Quando**: Tecla Espaço pressionada
- **Então**: Ação `{ type: 'wait', dx: 0, dy: 0 }` gerada, turno avança sem mover player
