# Spec — Loot System (LootSystem)

## Descrição

O LootSystem gerencia o drop de itens quando inimigos morrem. A lógica de probabilidade
vive exclusivamente no sistema — a cena só registra o handler de `ITEM_DROPPED` para
criar o sprite correspondente.

---

## Tabela de Drop

| Resultado      | Probabilidade | ItemType       |
|----------------|---------------|----------------|
| Nada           | 40%           | —              |
| Poção de Cura  | 30%           | `potion_heal`  |
| Poção de Veneno| 20%           | `potion_poison`|
| Ouro           | 10%           | `gold`         |

Constantes em `LOOT` (`src/utils/constants.ts`):
```ts
LOOT = {
  CHANCE_NOTHING: 0.40,
  CHANCE_HEAL:    0.30,
  CHANCE_POISON:  0.20,
  CHANCE_GOLD:    0.10,
}
```

---

## API

```ts
class LootSystem {
  roll(gridX: number, gridY: number): Item | null
}
```

| Método  | Descrição                                                                          |
|---------|------------------------------------------------------------------------------------|
| `roll()`| Sorteia drop; se resultado ≠ nada, cria `Item` na posição e emite `ITEM_DROPPED`  |

---

## Fluxo

```
Inimigo morre (CombatSystem retorna enemiesDied)
  → GameScene itera enemiesDied
  → lootSystem.roll(enemy.gridX, enemy.gridY)
    → Math.random() determina tipo
    → se tipo != null: new Item(id, type, gridX, gridY)
    → EventBus.emit(EVENTS.ITEM_DROPPED, { item })
    → retorna Item (ou null)
  → GameScene._handleItemDropped(data)
    → _spawnDroppedItem(item) — cria sprite no mapa
    → item adicionado a this._items
```

---

## Regras

- R1: Toda lógica de probabilidade fica em `LootSystem` — cenas não calculam chances
- R2: `LootSystem` não importa nem referencia nenhuma Scene (apenas `EventBus` e `Item`)
- R3: IDs de itens gerados por loot são sequenciais: `loot_0`, `loot_1`, …
- R4: Drops só ocorrem na dungeon — `GameScene` só registra o handler enquanto em `dungeon`
- R5: Item dropado começa não-identificado (`identified: false`), igual a itens de dungeon

---

## Eventos

| Evento        | Payload      | Quem emite    | Quem escuta |
|---------------|--------------|---------------|-------------|
| `ITEM_DROPPED`| `{ item: Item }` | LootSystem | GameScene   |

---

## Cenários Testáveis

### Cenário 1 — Drop de poção de cura
- **Dado**: `Math.random()` retorna 0.15 (< CHANCE_HEAL 0.30)
- **Quando**: `lootSystem.roll(5, 5)` chamado
- **Então**: `Item` criado com `type = 'potion_heal'`, `gridX = 5`, `gridY = 5`; `ITEM_DROPPED` emitido

### Cenário 2 — Sem drop
- **Dado**: `Math.random()` retorna 0.05 (< CHANCE_NOTHING 0.40)
- **Quando**: `lootSystem.roll(3, 7)` chamado
- **Então**: retorna `null`, `ITEM_DROPPED` não emitido

### Cenário 3 — Drop de ouro
- **Dado**: `Math.random()` retorna 0.92 (>= 0.90, que é HEAL+POISON+GOLD threshold)
- **Quando**: `lootSystem.roll(2, 2)` chamado
- **Então**: `Item` criado com `type = 'gold'`; sprite usa `Money.png` frame 0
