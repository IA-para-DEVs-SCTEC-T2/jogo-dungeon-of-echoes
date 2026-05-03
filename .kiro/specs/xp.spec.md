# Spec — XP (Experience System)

## Descrição
O sistema de XP gerencia a experiência acumulada pelo player e controla a progressão de nível. É acionado pelo sistema de combate após a morte de um inimigo.

---

## Atributos Gerenciados

| Atributo    | Tipo   | Descrição                              |
|-------------|--------|----------------------------------------|
| xp          | number | XP total acumulado                     |
| level       | number | Nível atual                            |
| xpToNextLevel | number | XP necessário para o próximo nível  |

---

## Fórmula de Progressão

```
xpToNextLevel = level * 100
```

| Nível | XP necessário (acumulado) |
|-------|--------------------------|
| 1→2   | 100                      |
| 2→3   | 200                      |
| 3→4   | 300                      |

---

## Inputs

- `amount`: quantidade de XP a adicionar (number, positivo)
- Referência ao objeto player para atualizar atributos

---

## Outputs

- `player.xp` atualizado
- `player.level` atualizado (se houve level up)
- `player.maxHp` e `player.attack` atualizados (se houve level up)
- Evento `player-leveled-up` emitido com `{ level, maxHp, attack }`

---

## Regras

- R1: XP adicionado deve ser > 0; valores ≤ 0 são ignorados
- R2: XP é acumulativo — nunca resetado ao subir de nível
- R3: Múltiplos level ups em sequência são processados (ex: ganhar 500 XP de uma vez)
- R4: A cada level up: `maxHp += 20`, `attack += 5`
- R5: A cada level up: HP do player é restaurado ao novo `maxHp`
- R6: Evento `player-leveled-up` é emitido uma vez por nível ganho

---

## Casos de Erro

| Situação                    | Comportamento Esperado              |
|-----------------------------|-------------------------------------|
| `amount` = 0                | Ignorado, sem alteração             |
| `amount` negativo           | Ignorado, sem alteração             |
| `amount` = NaN              | Ignorado, sem alteração             |
| Player referência nula      | Log de erro, sem alteração          |

---

## Cenários Testáveis

### Cenário 1 — Ganho de XP sem level up
- **Dado**: Player nível 1, XP = 50
- **Quando**: `addXP(30)` chamado
- **Então**: XP = 80, level = 1, sem evento de level up

### Cenário 2 — Ganho de XP com level up exato
- **Dado**: Player nível 1, XP = 0
- **Quando**: `addXP(100)` chamado
- **Então**: XP = 100, level = 2, maxHp = 120, attack = 15, HP restaurado

### Cenário 3 — Múltiplos level ups de uma vez
- **Dado**: Player nível 1, XP = 0
- **Quando**: `addXP(350)` chamado
- **Então**: XP = 350, level = 3 (100 + 200 = 300 < 350), evento emitido 2x

### Cenário 4 — XP inválido ignorado
- **Dado**: Player nível 1, XP = 50
- **Quando**: `addXP(-10)` chamado
- **Então**: XP = 50, nenhuma alteração
