# Spec — Player

## Descrição
O Player é o personagem controlado pelo usuário. Ele se move em um grid tile-based, possui pontos de vida (HP), e acumula experiência (XP) ao derrotar inimigos.

---

## Atributos

| Atributo | Tipo   | Valor Inicial | Descrição                        |
|----------|--------|---------------|----------------------------------|
| hp       | number | 100           | Pontos de vida atuais            |
| maxHp    | number | 100           | Pontos de vida máximos           |
| xp       | number | 0             | Experiência acumulada            |
| level    | number | 1             | Nível atual do jogador           |
| attack   | number | 10            | Dano base causado por ataque     |
| gridX    | number | —             | Posição X no grid da dungeon     |
| gridY    | number | —             | Posição Y no grid da dungeon     |

---

## Inputs

- **Teclado**: teclas W/A/S/D ou setas direcionais (↑ ↓ ← →)
- **Contexto**: referência ao grid da dungeon para validar movimento

---

## Outputs

- Posição atualizada no grid (gridX, gridY)
- Sprite renderizado na posição correta em pixels
- Eventos emitidos: `player-moved`, `player-attacked`, `player-died`, `player-leveled-up`

---

## Regras

### Movimento
- R1: O player só pode se mover para tiles do tipo `FLOOR`
- R2: Movimento é bloqueado por tiles do tipo `WALL`
- R3: Apenas um movimento por tecla pressionada (sem deslizamento contínuo)
- R4: Movimento é bloqueado se houver um inimigo na célula destino — inicia combate
- R5: O player não pode sair dos limites do grid

### Vida
- R6: HP nunca ultrapassa `maxHp`
- R7: HP nunca fica abaixo de 0
- R8: Quando HP chega a 0, emite evento `player-died`

### XP e Level
- R9: XP necessário para subir de nível: `level * 100`
- R10: Ao subir de nível: `maxHp += 20`, `attack += 5`, HP é restaurado ao máximo
- R11: XP não é resetado ao subir de nível (acumulativo)

---

## Casos de Erro

| Situação                          | Comportamento Esperado                  |
|-----------------------------------|-----------------------------------------|
| Tecla pressionada para WALL       | Movimento ignorado, sem erro            |
| HP recebe dano maior que HP atual | HP vai para 0, emite `player-died`      |
| XP recebe valor negativo          | Ignorado, XP permanece inalterado       |
| Movimento fora dos limites        | Bloqueado silenciosamente               |

---

## Cenários Testáveis

### Cenário 1 — Movimento válido
- **Dado**: Player em (5, 5), tile (5, 4) é FLOOR
- **Quando**: Tecla W pressionada
- **Então**: Player move para (5, 4), evento `player-moved` emitido

### Cenário 2 — Movimento bloqueado por parede
- **Dado**: Player em (5, 5), tile (5, 4) é WALL
- **Quando**: Tecla W pressionada
- **Então**: Player permanece em (5, 5), nenhum evento emitido

### Cenário 3 — Ganho de XP e level up
- **Dado**: Player nível 1, XP = 90
- **Quando**: Recebe 10 XP
- **Então**: XP = 100, level = 2, maxHp = 120, attack = 15, HP restaurado

### Cenário 4 — Morte do player
- **Dado**: Player com HP = 5
- **Quando**: Recebe 10 de dano
- **Então**: HP = 0, evento `player-died` emitido
