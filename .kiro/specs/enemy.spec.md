# Spec — Enemy

## Descrição
Inimigos são entidades hostis posicionadas na dungeon. No MVP, possuem comportamento simples: ficam parados ou se movem aleatoriamente. O combate ocorre quando o player colide com eles.

---

## Atributos

| Atributo | Tipo   | Valor Padrão | Descrição                        |
|----------|--------|--------------|----------------------------------|
| hp       | number | 30           | Pontos de vida atuais            |
| maxHp    | number | 30           | Pontos de vida máximos           |
| attack   | number | 8            | Dano base causado ao player      |
| xpReward | number | 25           | XP concedido ao player ao morrer |
| gridX    | number | —            | Posição X no grid                |
| gridY    | number | —            | Posição Y no grid                |
| alive    | boolean| true         | Se o inimigo está vivo           |

---

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
