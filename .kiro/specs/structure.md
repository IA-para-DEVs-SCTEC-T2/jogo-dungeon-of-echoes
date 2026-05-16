# Structure — Dungeon of Echoes

## Organização de Diretórios

```
dungeon-of-echoes/
├── index.html
├── vite.config.js
├── package.json
├── commitlint.config.js
│
├── .kiro/
│   ├── product.md, structure.md, tech.md
│   ├── steering/game-steering.md
│   └── specs/                  ← Uma spec por sistema
│
├── src/
│   ├── main.ts
│   │
│   ├── config/
│   │   ├── constants.ts        ← EVENTS, SHOP, TAVERN, TILE, COLORS, UI, INVENTORY…; DEV_CONFIG (godMode, devMode)
│   │   ├── town.config.ts      ← TownNPCDef[], TownBuildingDef[], TownConfig
│   │   ├── sprites-config.ts   ← FLOOR_ATLAS, LAYER_*, DAWNLIKE_FRAMES
│   │   ├── shop.catalog.ts     ← SHOP_CATALOG[], createItemFromCatalogEntry(), buildBonusText()
│   │   └── enemies.config.ts   ← EnemyDef[], EnemyCategory, CATEGORY_TEXTURE_KEYS, pickEnemyDef(), buildAnimKey()
│   │
│   ├── types/
│   │   ├── town.ts             ← NPCInstanceDef, ProcessedTownLayout, DialogMenuOption
│   │   ├── equipment.ts        ← EquipmentSlotId, StatBonuses, EQUIPMENT_SLOT_ORDER/LABELS
│   │   ├── viewmodels.ts       ← InventoryViewModel, ShopViewModel, SellItemViewModel…
│   │   └── input.ts            ← InputMode ('GAMEPLAY'|'INVENTORY'|'SHOP'|'DIALOG'|…)
│   │
│   ├── generators/
│   │   ├── DungeonGenerator.ts
│   │   ├── TileVariantResolver.ts
│   │   └── CityLayoutProcessor.ts
│   │
│   ├── scenes/
│   │   ├── BootScene.ts        ← Pré-carregamento de assets; transita para MainMenuScene (ou GameScene se devMode)
│   │   ├── MainMenuScene.ts    ← Menu principal: fundo game_bg.png, botões Novo Jogo / Créditos, rodapé Equipe 7 + versão
│   │   ├── CreditsScene.ts     ← Tela de créditos com roles e nomes da equipe; botão voltar ao menu
│   │   ├── GameScene.ts        ← Orquestra sistemas; sem lógica de domínio
│   │   ├── UIScene.ts          ← HUD e painéis via dirty flag; sem lógica de domínio
│   │   └── GameOverScene.ts
│   │
│   ├── entities/
│   │   ├── Player.ts           ← gold, _equipmentBonuses, recalcStats(), applyEquipmentBonuses()
│   │   └── Item.ts             ← ItemType, slotId?, bonuses?, price?, rarity?
│   │
│   ├── systems/
│   │   ├── TurnManager.ts
│   │   ├── CombatSystem.ts
│   │   ├── EnemySystem.ts
│   │   ├── XPSystem.ts
│   │   ├── LootSystem.ts
│   │   ├── WorldSystem.ts
│   │   ├── InventorySystem.ts
│   │   ├── EquipmentSystem.ts  ← equip/unequip, 6 slots, emite ITEM_EQUIPPED/UNEQUIPPED
│   │   ├── ShopSystem.ts       ← buyItem(), sellItem(), buildViewModel(), buildSellItems()
│   │   ├── InputModeManager.ts ← stack: push()/pop()/is(); emite INPUT_MODE_CHANGED
│   │   ├── LogSystem.ts
│   │   ├── NPCController.ts    ← spawn, wander FSM, customWanderBounds, isTileOccupied()
│   │   ├── InteractiveObjectSystem.ts
│   │   ├── CityDecorationSystem.ts
│   │   ├── MapTransitionSystem.ts
│   │   ├── DungeonFloorManager.ts
│   │   └── DifficultyScalingSystem.ts
│   │
│   └── ui/
│       ├── InventoryPanel.ts   ← 3 colunas: slots / itens / detalhes; dirty flag
│       ├── ShopPanel.ts        ← 2 abas buy/sell, mouse interativo, pool de linhas
│       ├── DialogPanel.ts      ← menu de opções genérico (Guard, Taberneiro)
│       ├── LogPanel.ts         ← renderização bottom-up por text.height real
│       └── ActionBarPanel.ts
│
├── tests/
│   ├── combat.test.js
│   ├── dungeon.test.js
│   ├── xp.test.js
│   └── shop.test.js            ← 17 testes: catalog, buy, sell, bonuses, viewmodel
│
└── docs/
```

## Separação de Responsabilidades

### Camada de Apresentação — `/src/scenes/`
Cenas Phaser que gerenciam o ciclo de vida visual do jogo. Não contêm lógica de domínio.

| Arquivo | Responsabilidade |
|---------|-----------------|
| `BootScene.ts` | Pré-carregamento de assets, registro de animações; transita para `MainMenuScene` (ou `GameScene` se `DEV_CONFIG.devMode`) |
| `MainMenuScene.ts` | Menu principal: fundo `game_bg.png`, botões "Novo Jogo" / "Créditos", rodapé "Equipe 7 + versão" |
| `CreditsScene.ts` | Exibe roles e nomes da equipe; botão voltar ao `MainMenuScene` |
| `GameScene.ts` | Loop principal; captura input via `InputModeManager`; delega para sistemas; sem lógica de domínio |
| `UIScene.ts` | HUD persistente + painéis (inventory, shop, dialog, log, action bar); dirty flag por painel |
| `GameOverScene.ts` | Exibe resumo da partida (andar, XP, nível) |

**Regra:** Cenas orquestram, sistemas executam. Uma cena nunca calcula dano ou gera dungeon.  
**Regra de estado:** `INVENTORY_OPENED` é o único evento que mostra o painel de inventário — nunca `INVENTORY_STATE_RESPONSE` diretamente.

### Camada de Domínio — `/src/systems/`

| Arquivo | Responsabilidade |
|---------|-----------------|
| `TurnManager.ts` | Controle de turno; processa ações MOVE/ATTACK/WAIT/USE_ITEM |
| `CombatSystem.ts` | Fórmula de ataque (80% hit), cálculo de dano, morte |
| `EnemySystem.ts` | Criação de inimigos, IA (IDLE/CHASING/ATTACKING), turno |
| `XPSystem.ts` | Acúmulo de XP, fórmula de nível, level up |
| `InventorySystem.ts` | 20 slots, roguelike identification, `useItem()`, `addItem()`, `removeItem()` |
| `EquipmentSystem.ts` | 6 slots; `equip()`, `unequip()`, `getEquippedId()`, `isEquipped()` |
| `ShopSystem.ts` | `buyItem()`, `sellItem()`, `buildViewModel()`, `buildSellItems()` — sem acoplamento à UI |
| `InputModeManager.ts` | Stack-based mode: `push()` / `pop()` / `is()` / `set()`; emite `INPUT_MODE_CHANGED` |
| `LootSystem.ts` | Drop de itens na morte de inimigos |
| `WorldSystem.ts` | Persiste estado da dungeon entre transições na sessão |
| `NPCController.ts` | Spawn, FSM idle→wander, `customWanderBounds`, `isTileOccupied()` |
| `InteractiveObjectSystem.ts` | Adjacência player↔NPC; `houseBounds` para check de posição; emite SHOP_OPENED ou DIALOG_OPENED |
| `CityDecorationSystem.ts` | Renderiza `WorldObjectDef[]` com Y-sort (`LAYER_WORLD_BASE + gridY*10`) |

**Regra:** Sistemas comunicam via EventBus (`src/utils/EventBus.ts`) — nunca importam cenas. Cenas passam dados como parâmetros ou ouvem eventos.

### Geração e Processamento — `/src/generators/`

| Arquivo | Responsabilidade |
|---------|-----------------|
| `DungeonGenerator.ts` | Geração BSP de dungeon; base para `TownMap` |
| `TileVariantResolver.ts` | Hash xorshift determinístico por posição (seed de sessão); seleciona frame ponderado por bioma |
| `CityLayoutProcessor.ts` | Lê `TOWN_CONFIG`, atribui biomas, resolve visuais, produz `ProcessedTownLayout` |

### Configuração — `/src/config/`

| Arquivo | Conteúdo |
|---------|---------|
| `constants.ts` | `TILE_SIZE`, `GRID_W`, `GRID_H`, `VISION_RADIUS`, `XP_BASE`, etc.; `DEV_CONFIG` com `godMode` e `devMode` |
| `town.config.ts` | `TownConfig` com layout fixo da cidade e `biomeOverrides?` por tile key |
| `sprites-config.ts` | `FLOOR_ATLAS` (bioma→frames+pesos), `OBJECT_ATLAS`, `NPC_ATLAS`; constantes `LAYER_GROUND`, `LAYER_WORLD_BASE`, `LAYER_OVERHEAD`, `LAYER_UI_LABELS` |
| `enemies.config.ts` | `EnemyDef[]` com atributos base, `EnemyCategory`, `CATEGORY_TEXTURE_KEYS` (par DawnLike *0/*1), `pickEnemyDef(floor)`, `buildAnimKey()` |

### Configuração — `/src/config/`
Constantes globais que evitam magic numbers espalhados pelo código.

```javascript
// constants.js — exemplos
export const TILE_SIZE = 32;
export const GRID_W = 50;
export const GRID_H = 50;
export const VISION_RADIUS = 5;
export const XP_BASE = 100;
```

### Especificações — `.kiro/specs/`
Cada sistema possui uma spec correspondente em Markdown. A spec define o comportamento esperado antes da implementação. Nenhuma feature é implementada sem spec.

### Testes — `/tests/`
Testes unitários com Vitest. Validam o comportamento descrito nas specs, não os detalhes de implementação. Atualmente cobrem: `CombatSystem`, `DungeonSystem`, `XPSystem`.

## Padrões de Organização de Código

### Um sistema, um arquivo
Cada sistema vive em um único arquivo dentro de `/src/systems/`. Não criar subpastas dentro de `systems/` no MVP.

### Exportação nomeada
Preferir exportações nomeadas a `export default` para facilitar tree-shaking e clareza de imports:
```javascript
// ✅ preferido
export function resolveAttack(attacker, defender) { ... }

// ❌ evitar no MVP
export default class CombatSystem { ... }
```

### Sem dependências circulares
Sistemas não se importam mutuamente. Se dois sistemas precisam se comunicar, a cena intermediária passa os dados necessários como parâmetros.

### Constantes centralizadas
Qualquer valor numérico ou string que apareça em mais de um lugar vai para `constants.js`.

### Specs antes do código
O fluxo obrigatório é:
1. Escrever/revisar spec em `.kiro/specs/<sistema>.spec.md`
2. Implementar em `/src/systems/<Sistema>System.js`
3. Integrar em `GameScene.js`
4. Validar manualmente

## Convenções

### Nomenclatura
| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos de sistema | PascalCase + sufixo `System` | `CombatSystem.js` |
| Arquivos de cena | PascalCase + sufixo `Scene` | `GameScene.js` |
| Funções exportadas | camelCase | `resolveAttack()` |
| Constantes | UPPER_SNAKE_CASE | `TILE_SIZE` |
| Specs | kebab-case + `.spec.md` | `combat.spec.md` |
| Testes | kebab-case + `.test.js` | `combat.test.js` |

### Commits
Seguir Conventional Commits (enforçado via Husky + Commitlint):
```
feat(combat): add critical hit calculation
fix(dungeon): correct BSP corridor overlap
docs(specs): update xp spec with level cap
```

### Comentários
- Comentar o **porquê**, não o **o quê**
- Funções públicas de sistemas devem ter JSDoc mínimo (parâmetros e retorno)
- Evitar comentários óbvios que apenas repetem o código
