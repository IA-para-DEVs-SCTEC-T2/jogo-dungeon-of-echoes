# Spec — Loot System (LootSystem)

## Descrição

O `LootSystem` gerencia dois tipos de loot: drops de inimigos ao morrer e loot de baús na dungeon.
Toda lógica de probabilidade vive exclusivamente no sistema — a cena registra handlers de eventos
para criar sprites e processar resultados.

---

## Drop de Inimigos

### Tabela de Drop por Andar

| Andar | Nada  | Poção | Ouro  |
|-------|-------|-------|-------|
| 1     | 50%   | 8%    | 42%   |
| 2     | 47%   | 8%    | 45%   |
| 3     | 44%   | 7%    | 49%   |
| 4     | 41%   | 7%    | 52%   |
| 5+    | 38%   | 6%    | 56%   |

### Valor de Ouro

- Fórmula: `base = 5 + floor × 6`, variação ±30%
- Inimigos elite recebem multiplicador 1.8×
- Modificadores de classe (`luckMultiplier`, `extraDropChance`) do `ClassRulesEngine`

### Frame Visual de Ouro (`Money.png`)

| goldAmount    | Frame | Constante         |
|---------------|-------|-------------------|
| `< 20`        | 10    | `GOLD_SMALL`      |
| `20 – 49`     | 9     | `GOLD_MEDIUM`     |
| `≥ 50`        | 8     | `GOLD_LARGE`      |

---

## Loot de Baús (`rollChestLoot`)

### Interface

```ts
interface ChestLootResult {
  type: 'gold' | 'potion' | 'equipment' | 'mimic';
  item?: Item;
  mimicDamage?: number;
}
```

### Tabela por Profundidade

| Andar  | Gold  | Poção | Mímica | Equipamento |
|--------|-------|-------|--------|-------------|
| 1–2    | 60%   | 40%   | —      | —           |
| 3–5    | 50%   | 30%   | 20%    | —           |
| 6+     | 30%   | 20%   | —      | 50%         |

- **Ouro de baú**: sempre maior que drop de inimigo (`pickGoldAmount(floor + 1..+3)`)
- **Mímica**: dano direto ao player de 15–25; sprite do baú destruído, `metadata.opened = true`
- **Equipamento**: sorteia pool por tier (mid / advanced / elite) com raridade e bônus escalados pelo andar

### Pools de Equipamento

| Tier      | Andar mínimo | Exemplos                              |
|-----------|-------------|---------------------------------------|
| Mid       | 1–5         | Espada de Ferro, Capacete de Couro    |
| Advanced  | 6–9         | Espada de Aço, Capacete de Ferro      |
| Elite     | 10+         | Espada de Obsidiana, Capacete de Mithril |

---

## API

```ts
class LootSystem {
  roll(gridX, gridY, floor?, elite?, classDef?): Item | null
  rollChestLoot(floor: number): ChestLootResult
}
```

---

## Fluxo — Drop de Inimigo

```
Inimigo morre → GameScene.result.enemiesDied
  → lootSystem.roll(e.gridX, e.gridY, floor, e.isElite, player.classDef)
    → sorteia tipo baseado na tabela do andar
    → se gold: define goldAmount, Item criado, ITEM_DROPPED emitido
    → se poção: Item criado, ITEM_DROPPED emitido
    → retorna Item (ou null)
  → GameScene._handleItemDropped → _spawnDroppedItem → item em _items com sprite
```

## Fluxo — Baú

```
Player pisa em feature.type === 'chest' (metadata.opened === false)
  → GameScene._checkChestInteraction()
    → lootSystem.rollChestLoot(floor)
    → mimic  → player.hp -= mimicDamage; log; retorna
    → gold   → item.gridX/Y = player.gridX/Y; _spawnDroppedItem(); _checkItemPickup()
    → potion → idem gold
    → equip  → player.inventory.addItem(item); ITEM_PICKED_UP emitido
    → chest sprite destruído; _chestSprites.delete(key); feature.metadata.opened = true
```

---

## Regras

- R1: Toda lógica de probabilidade fica em `LootSystem` — cenas não calculam chances
- R2: `LootSystem` não importa nem referencia nenhuma Scene (apenas `EventBus` e `Item`)
- R3: IDs de itens gerados por loot são sequenciais: `loot_0`, `loot_1`, …
- R4: Drops de inimigos só ocorrem na dungeon — `GameScene` só registra o handler em `dungeon`
- R5: Item dropado começa não-identificado (`identified: false`), igual a itens de dungeon
- R6: Equipamentos de baú NÃO emitem `ITEM_DROPPED` — vão direto ao inventário
- R7: `goldAmount` é propriedade formal de `Item` (`goldAmount?: number`)

---

## Eventos

| Evento        | Payload              | Quem emite              | Quem escuta |
|---------------|----------------------|-------------------------|-------------|
| `ITEM_DROPPED`| `{ item: Item }`     | LootSystem (drop inimigo) | GameScene  |

---

## Cenários Testáveis

### Cenário 1 — Drop de poção de cura
- **Dado**: floor 1, `Math.random()` retorna 0.51 (> nothing 0.50, dentro de potion 0.08)
- **Quando**: `lootSystem.roll(5, 5, 1)` chamado
- **Então**: `Item` com `type = 'potion_heal_light'` criado; `ITEM_DROPPED` emitido

### Cenário 2 — Sem drop
- **Dado**: floor 1, `Math.random()` retorna 0.30 (< nothing 0.50)
- **Quando**: `lootSystem.roll(3, 7, 1)` chamado
- **Então**: retorna `null`, `ITEM_DROPPED` não emitido

### Cenário 3 — Drop de ouro, frame visual correto
- **Dado**: floor 3, `Math.random()` retorna 0.80 (> nothing+potion, gold), `goldAmount >= 50`
- **Quando**: `lootSystem.roll(2, 2, 3)` chamado; `_getItemVisual('gold', item.goldAmount)` chamado
- **Então**: frame retornado é `DAWNLIKE_FRAMES.GOLD_LARGE` (8)

### Cenário 4 — Baú em andar 5, retorno mímica
- **Dado**: floor 5, `Math.random()` retorna 0.85 (> 0.80)
- **Quando**: `lootSystem.rollChestLoot(5)` chamado
- **Então**: `{ type: 'mimic', mimicDamage: N }` retornado com `15 <= N <= 25`

### Cenário 5 — Baú em andar 8, retorno equipamento
- **Dado**: floor 8, `Math.random()` retorna 0.25 (< 0.50)
- **Quando**: `lootSystem.rollChestLoot(8)` chamado
- **Então**: `{ type: 'equipment', item }` com `item.slotId` definido e `item.bonuses` escalados para floor 8
