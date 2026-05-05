# Spec — Combat

## Descrição
O sistema de combate resolve interações de ataque entre o player e os inimigos. No MVP, o combate é acionado automaticamente quando o player tenta se mover para o tile ocupado por um inimigo.

---

## Inputs

| Parâmetro | Tipo   | Descrição                          |
|-----------|--------|------------------------------------|
| attacker  | object | Entidade que ataca (player ou enemy)|
| defender  | object | Entidade que recebe o ataque       |

---

## Outputs

- HP do defensor reduzido
- Evento `combat-hit` emitido com `{ attacker, defender, damage }`
- Se defensor morrer: evento `enemy-died` ou `player-died` emitido
- Feedback visual: texto de dano flutuante na tela (simples)

---

## Fórmula de Dano

```
hitChance = 80%
if random < hitChance:
  damage = attacker.attack
else:
  miss (damage = 0)
```

> Dano fixo em caso de acerto. Crítico e defesa são expansão futura.

---

## Regras

- R1: Combate é iniciado quando player tenta mover para tile com inimigo
- R2: Player ataca primeiro via `TurnManager`; inimigo age no turno seguinte
- R3: Cada ataque tem 80% de chance de acerto — miss não aplica dano
- R4: Inimigo morto não age no turno de inimigos
- R5: Combate não consome o "turno de movimento" — player fica no tile atual
- R6: Após combate, se inimigo morreu: conceder XP ao player via sistema de XP
- R7: Feedback visual de dano deve aparecer por 800ms e desaparecer

---

## Casos de Erro

| Situação                              | Comportamento Esperado                        |
|---------------------------------------|-----------------------------------------------|
| Atacante com attack = 0               | Dano = 0, nenhum HP removido                  |
| Defensor já morto                     | Combate não ocorre                            |
| Referência nula para attacker/defender| Log de erro, combate cancelado                |

---

## Cenários Testáveis

### Cenário 1 — Player ataca inimigo e mata
- **Dado**: Player com attack=10, Inimigo com HP=10
- **Quando**: Player move para tile do inimigo
- **Então**: Inimigo HP=0, `enemy-died` emitido, player ganha XP

### Cenário 2 — Player ataca inimigo, inimigo sobrevive e contra-ataca
- **Dado**: Player com attack=10, HP=100; Inimigo com attack=8, HP=30
- **Quando**: Player move para tile do inimigo
- **Então**: Inimigo HP=20, Player HP=92, ambos vivos

### Cenário 3 — Inimigo mata player no contra-ataque
- **Dado**: Player com attack=5, HP=5; Inimigo com attack=10, HP=30
- **Quando**: Player move para tile do inimigo
- **Então**: Inimigo HP=25, Player HP=0, `player-died` emitido

### Cenário 4 — Combate com inimigo morto ignorado
- **Dado**: Inimigo com `alive` = false
- **Quando**: Player tenta mover para tile do inimigo
- **Então**: Player move normalmente, sem combate
