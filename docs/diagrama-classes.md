# Dungeon of Echoes — Diagrama de Classes

> Documento gerado a partir da leitura direta do código-fonte em `src/`. Versão 0.6.0.
> Todos os nomes de classes, métodos e campos são reais — sem inferência.

---

## 1. Visão Geral Arquitetural

### Camadas do Projeto

```
┌────────────────────────────────────────────────────────────────┐
│                     PHASER GAME (main.ts)                      │
│  Phaser.Game { config: 800×600, arcade physics, pixelArt }    │
└───────────────────────┬────────────────────────────────────────┘
                        │ scene pipeline
          ┌─────────────┼──────────────────────────┐
          │             │                          │
    BootScene   GameScene (+ UIScene paralela)  GameOverScene
    MainMenuScene  CharacterSelectScene  CreditsScene
          │
          │ instancia / usa
   ┌──────┴──────────────────────────────────────────────────┐
   │                      SYSTEMS                            │
   │  TurnManager  CombatSystem  XPSystem  LootSystem        │
   │  EquipmentSystem  SpellSystem  SpellCastingSystem       │
   │  ShopSystem  InventorySystem  InputModeManager          │
   │  MapTransitionSystem  DungeonFloorManager               │
   │  DifficultyManager  DifficultyScalingSystem             │
   │  PlayerMetrics  EnemySystem  NPCController              │
   │  InteractiveObjectSystem  LogSystem  EventMemory        │
   │  ClassRulesEngine  WorldSystem                          │
   └──────┬──────────────────────────────────────────────────┘
          │ opera sobre
   ┌──────┴──────────────────────────────────────────────────┐
   │                      ENTITIES                           │
   │  Player  EnemySystem  Item  Projectile                  │
   └──────┬──────────────────────────────────────────────────┘
          │ gerado por
   ┌──────┴──────────────────────────────────────────────────┐
   │                     GENERATORS                          │
   │  DungeonGenerator  DungeonFeatureGenerator              │
   │  TileVariantResolver  CityLayoutProcessor               │
   └──────┬──────────────────────────────────────────────────┘
          │ configuração em
   ┌──────┴──────────────────────────────────────────────────┐
   │                      CONFIG / DATA                      │
   │  PLAYER_CLASSES  SPELLS_DB  SPELL_PROGRESSION           │
   │  SHOP_CATALOG  ENEMY_DEFS  dungeon-themes               │
   │  difficulty.config  sprites-config  TownTMXData         │
   └──────┬──────────────────────────────────────────────────┘
          │ comunicação via
   ┌──────┴──────────────────────────────────────────────────┐
   │                      UTILS                              │
   │  EventBus  constants (EVENTS, TILE_SIZE, etc.)          │
   └─────────────────────────────────────────────────────────┘
```

### Módulos por Diretório

| Diretório | Papel |
|-----------|-------|
| `src/scenes/` | Cenas Phaser: orquestram lifecycle e composição de sistemas |
| `src/entities/` | Objetos de domínio com estado e comportamento mínimo |
| `src/systems/` | Lógica de negócio do jogo, stateful ou stateless |
| `src/generators/` | Geração procedural (dungeon, features, tiles) |
| `src/config/` | Dados de configuração (constantes complexas, catálogos) |
| `src/ui/` | Painéis de UI renderizados pela UIScene |
| `src/ai/` | Integração com LLM para narrativa emergente |
| `src/types/` | Interfaces e tipos TypeScript compartilhados |
| `src/utils/` | Utilitários globais: EventBus e constants |

---

## 2. Diagrama de Classes Completo (Mermaid)

```mermaid
classDiagram

  %% ─── ENTITIES ───────────────────────────────────────────────────

  class Player {
    +gridX: number
    +gridY: number
    +str: number
    +intel: number
    +dex: number
    +con: number
    +wis: number
    +cha: number
    +hp: number
    +maxHp: number
    +mana: number
    +maxMana: number
    +xp: number
    +level: number
    +attack: number
    +critChance: number
    +cdReduction: number
    +spellBonus: number
    +gold: number
    +freePoints: number
    +unlockedSpells: string[]
    +equippedSpells: [string|null, string|null]
    +facingDir: Direction
    +classDef: PlayerClassDef
    +arrows: number
    +inventory: InventorySystem
    +identifiedItems: Record~string, boolean~
    +applySkin(frame: number): void
    +recalcStats(): void
    +applyEquipmentBonuses(bonuses: StatBonuses): void
    +removeEquipmentBonuses(bonuses: StatBonuses): void
    +tryMove(dx, dy, dungeon, enemies, now): MoveResult
    +takeDamage(amount: number): void
    +applyClassBonus(classDef: PlayerClassDef): void
    +spendStatPoint(stat: string): boolean
    +useMana(amount: number): boolean
    +getPixelPos(): PixelPos
    +reset(gridX, gridY): void
  }

  class EnemySystem {
    +id: number
    +hp: number
    +maxHp: number
    +attack: number
    +xpReward: number
    +gridX: number
    +gridY: number
    +alive: boolean
    +state: EnemyState
    +detectionRadius: number
    +aggressionLevel: number
    +isElite: boolean
    +category: EnemyCategory
    +frameIndex: number
    +animKey: string
    +sprite: Phaser.GameObjects.Sprite|null
    +update(playerX, playerY, dungeon, allEnemies, classDef): EnemyAttackResult
    +takeDamage(amount, emitter): void
    +getPixelPos(): PixelPos
  }

  class Item {
    +id: string
    +type: ItemType
    +identified: boolean
    +gridX: number|null
    +gridY: number|null
    +name: string
    +slotId: EquipmentSlotId
    +bonuses: StatBonuses
    +price: number
    +rarity: ItemRarity
    +noSell: boolean
    +noUnequip: boolean
    +goldAmount: number
    +getDisplayName(identifiedItems): string
  }

  class Projectile {
    +damage: number
    +spell: SpellDef
    +updateMovement(dungeon: DungeonGenerator): void
    +checkEnemyHit(enemy: Enemy): boolean
    +isAlive(): boolean
  }

  %% ─── SYSTEMS ────────────────────────────────────────────────────

  class XPSystem {
    +addXP(player: PlayerLike, amount: number): boolean
    +getXPToNextLevel(level: number): number
  }

  class CombatSystem {
    +attack(attacker, defender): AttackResult
    +resolve(player, enemy): CombatResult|null
  }

  class TurnManager {
    +isPlayerTurn(): boolean
    +processPlayerAction(action, player, enemies, dungeon, combat, metrics): TurnResult
  }

  class LootSystem {
    +roll(gridX, gridY, floor, elite, classDef): Item|null
    +rollChestLoot(floor: number): ChestLootResult
  }

  class InventorySystem {
    +isFull(): boolean
    +count(): number
    +addItem(item: Item): boolean
    +removeItem(index: number): Item|null
    +useItem(index, identifiedItems, hp, maxHp, mana, maxMana): UseItemResult
    +reset(): void
  }

  class EquipmentSystem {
    +equip(itemId, slotId, classDef, item): EquipResult
    +unequip(slotId: EquipmentSlotId): string|null
    +getEquippedId(slotId): string|null
    +isEquipped(itemId): boolean
    +getAllEquipped(): Record~EquipmentSlotId, string|null~
    +reset(): void
  }

  class SpellSystem {
    +unlockSpellsForLevel(player, level): string[]
    +equipSpell(player, spellId, slotIndex): boolean
    +canCast(slotIndex, nowMs): boolean
    +recordCast(slotIndex, nowMs): void
    +getCooldownRatio(slotIndex, nowMs): number
    +syncFromPlayer(player): void
  }

  class SpellCastingSystem {
    +cast(slotIndex, player, spellSystem, enemies, nowMs): SpellCastResult|null
  }

  class ShopSystem {
    +buyItem(player, index, inventory): BuyResult
    +sellItem(player, itemIndex, inventory): SellResult
    +buildViewModel(player, selectedIndex, tab, inventory, equippedIds): ShopViewModel
  }

  class ClassRulesEngine {
    +canEquipSlot(classDef, slotId, itemType)$
    +canMelee(classDef)$
    +canAttack(classDef, arrows)$
    +physicalDamageMultiplier(classDef)$
    +luckMultiplier(classDef)$
    +effectiveManaCost(classDef, base)$
    +effectiveDetectionRadius(classDef, base)$
  }

  class DungeonFloorManager {
    +currentFloor: number
    +maxFloorReached: number
    +descend(): void
    +ascend(): void
    +saveFloorConnections(floor, data): void
    +getFloorConnections(floor): FloorConnectionData|null
    +reset(): void
  }

  class MapTransitionSystem {
    +registerSpawn(point): void
    +registerTransition(point): void
    +requestTransition(transitionId): TransitionResolution|null
    +completeTransition(resolution): void
  }

  class DifficultyManager {
    +currentLevel: DifficultyLevel
    +update(metrics: PlayerMetrics): boolean
    +getAdaptiveDifficulty(floor): AdaptiveDifficulty
    +reset(): void
  }

  class PlayerMetrics {
    +turnsSurvived: number
    +damageDealt: number
    +damageTaken: number
    +enemiesKilled: number
    +itemsUsed: number
    +deaths: number
    +recordTurn(): void
    +recordDamageDealt(amount): void
    +recordDamageTaken(amount): void
    +recordEnemyKilled(): void
    +recordItemUsed(): void
    +recordDeath(): void
    +getRecentPerformanceScore(): number
  }

  class InputModeManager {
    +push(mode): void
    +pop(): void
    +is(mode): boolean
    +current(): InputMode
  }

  class EventMemory {
    +addEvent(event: GameEvent): void
    +getRecentEvents(limit): GameEvent[]
    +getImportantEvents(limit): GameEvent[]
    +reset(): void
    +toPromptLines(limit): string[]
  }

  class LogSystem {
    +bindEventBus(): void
    +add(message): void
    +getVisible(count): string[]
  }

  %% ─── GENERATORS ─────────────────────────────────────────────────

  class DungeonGenerator {
    +width: number
    +height: number
    +grid: number[][]
    +rooms: Room[]
    +startPos: GridPos
    +generate(roomCount): this
    +isWalkable(x, y): boolean
    +getRandomFloorPosition(excludePos): GridPos
  }

  class DungeonFeatureGenerator {
    +generate(dungeon, floor, options): DungeonFeature[]
    +extractConnections(features): FloorConnectionData
  }

  %% ─── AI ─────────────────────────────────────────────────────────

  class AIService {
    +generateItemDescription(item): Promise~string~
    +generateEnemyVariant(context): Promise~EnemyVariant~
    +generateEvent(context): Promise~string~
  }

  class NarrativeService {
    +generateNarrative(events: GameEvent[]): Promise~string~
    +generateDeathStory(events: GameEvent[]): Promise~string~
  }

  %% ─── SCENES ─────────────────────────────────────────────────────

  class GameScene {
    -player: Player
    -xpSystem: XPSystem
    -combatSystem: CombatSystem
    -turnManager: TurnManager
    -lootSystem: LootSystem
    -playerMetrics: PlayerMetrics
    -difficultyManager: DifficultyManager
    -equipmentSystem: EquipmentSystem
    -_spellSystem: SpellSystem
    -_spellCastingSystem: SpellCastingSystem
    -_eventMemory: EventMemory
    -_narrativeService: NarrativeService
    -_dungeonCache: Map~number, DungeonState~
    -_enemies: EnemySystem[]
    -_items: Item[]
    +create(): void
    +update(time, delta): void
  }

  class UIScene {
    -_logSystem: LogSystem
    -_inventoryPanel: InventoryPanel
    -_statusPanel: StatusPanel
    -_spellsPanel: SpellsPanel
    -_shopPanel: ShopPanel
    -_dialogPanel: DialogPanel
    -_actionBar: ActionBarPanel
    +create(): void
  }

  class GameOverScene {
    -playerData: GameOverData
    -_storyText: Phaser.GameObjects.Text
    +init(data: GameOverData): void
    +create(): void
    +shutdown(): void
  }

  %% ─── RELAÇÕES ───────────────────────────────────────────────────

  GameScene --> Player : cria e controla
  GameScene --> EnemySystem : cria via createEnemies()
  GameScene --> XPSystem : usa
  GameScene --> CombatSystem : usa
  GameScene --> TurnManager : usa
  GameScene --> LootSystem : usa
  GameScene --> EquipmentSystem : usa
  GameScene --> SpellSystem : usa
  GameScene --> SpellCastingSystem : usa
  GameScene --> ShopSystem : usa
  GameScene --> DungeonFloorManager : usa
  GameScene --> MapTransitionSystem : usa
  GameScene --> DifficultyManager : usa
  GameScene --> PlayerMetrics : usa
  GameScene --> DungeonGenerator : instancia
  GameScene --> DungeonFeatureGenerator : usa
  GameScene --> EventMemory : usa
  GameScene --> NarrativeService : usa

  Player --> InventorySystem : possui
  TurnManager --> CombatSystem : usa
  TurnManager --> ClassRulesEngine : usa
  TurnManager --> PlayerMetrics : usa
  CombatSystem --> XPSystem : usa
  LootSystem --> ClassRulesEngine : usa
  EnemySystem --> ClassRulesEngine : usa
  EquipmentSystem --> ClassRulesEngine : usa
  SpellSystem --> ClassRulesEngine : usa
  DifficultyManager --> PlayerMetrics : lê
  NarrativeService --> AIService : usa
  GameOverScene --> NarrativeService : usa
```

---

## 3. Diagramas por Contexto

### 3.1 Player e Atributos

```mermaid
classDiagram

  class Player {
    +str, intel, dex, con, wis, cha: number
    +hp, maxHp, mana, maxMana: number
    +xp, level, attack: number
    +critChance, cdReduction, spellBonus: number
    +gold, arrows, freePoints: number
    +classDef: PlayerClassDef
    +inventory: InventorySystem
    +recalcStats(): void
    +applyClassBonus(classDef): void
    +spendStatPoint(stat): boolean
    +takeDamage(amount): void
    +useMana(amount): boolean
  }

  class PlayerClassDef {
    +id: PlayerClass
    +label: string
    +frame: number
    +attackType: string
    +attackRange: number
    +physicalDamageReceived: number
    +canMelee: boolean
    +forbiddenSlots: EquipmentSlotId[]
    +luckMultiplier: number
    +extraDropChance: number
    +usesArrows: boolean
    +manaCostMultiplier: number
    +manaRegenPerTurn: number
    +exclusiveSpells: string[]
    +enemyApproachBias: number
  }

  class ClassRulesEngine {
    +canEquipSlot(classDef, slotId, itemType)$
    +canMelee(classDef)$
    +canAttack(classDef, arrows)$
    +physicalDamageMultiplier(classDef)$
    +effectiveManaCost(classDef, base)$
  }

  Player --> PlayerClassDef : classDef
  ClassRulesEngine --> PlayerClassDef : lê regras

  note for PlayerClassDef "Aventureiro: luckMultiplier=1.4, extraDropChance=0.15
Guerreiro: physicalDamageReceived=0.70
Arqueiro: usesArrows=true, attackRange=4, canMelee=false
Mago: manaCostMultiplier=0.65, manaRegenPerTurn=3"
```

### 3.2 Combate

```mermaid
classDiagram

  class TurnManager {
    +processPlayerAction(action, player, enemies, dungeon, combat, metrics): TurnResult
  }

  class CombatSystem {
    +attack(attacker, defender): AttackResult
    +resolve(player, enemy): CombatResult
  }

  class EnemySystem {
    +hp, maxHp, attack, xpReward: number
    +alive: boolean
    +aggressionLevel: number
    +update(playerX, playerY, dungeon, allEnemies, classDef): EnemyAttackResult
  }

  class XPSystem {
    +addXP(player, amount): boolean
  }

  class PlayerMetrics {
    +recordTurn(): void
    +recordDamageDealt(amount): void
    +recordDamageTaken(amount): void
    +recordEnemyKilled(): void
    +getRecentPerformanceScore(): number
  }

  TurnManager --> CombatSystem : resolve ataques
  TurnManager --> EnemySystem : executa IA
  TurnManager --> PlayerMetrics : registra métricas
  CombatSystem --> XPSystem : addXP ao matar

  note for TurnManager "Ordem: player age → todos inimigos agem
80% chance de hit para ambos os lados
Break se player morrer durante turno dos inimigos"
```

### 3.3 Loot e Itens

```mermaid
classDiagram

  class LootSystem {
    +roll(gridX, gridY, floor, elite, classDef): Item|null
    +rollChestLoot(floor): ChestLootResult
  }

  class Item {
    +id: string
    +type: ItemType
    +identified: boolean
    +name, slotId, bonuses, price, rarity: optional
    +goldAmount: number
    +getDisplayName(identifiedItems): string
  }

  class InventorySystem {
    +MAX_SLOTS: 20
    +addItem(item): boolean
    +useItem(index, identifiedItems, hp, maxHp, mana, maxMana): UseItemResult
  }

  class EquipmentSystem {
    +equip(itemId, slotId, classDef, item): EquipResult
    +unequip(slotId): string|null
  }

  LootSystem --> Item : cria
  Item --> InventorySystem : gerenciado por
  EquipmentSystem --> Item : referencia por id

  note for LootSystem "floor1: nothing=50%, potion=8%, gold=42%
Elite: garante drop
Aventureiro: luck×1.4, +15% segundo drop"
```

### 3.4 Dungeon e Geração

```mermaid
classDiagram

  class DungeonGenerator {
    +width, height: number
    +grid: number[][]
    +rooms: Room[]
    +startPos: GridPos
    +generate(roomCount): this
    +isWalkable(x, y): boolean
    +getRandomFloorPosition(excludePos): GridPos
  }

  class DungeonFeatureGenerator {
    +generate(dungeon, floor, options): DungeonFeature[]
    +extractConnections(features): FloorConnectionData
  }

  class DungeonFloorManager {
    +currentFloor: number
    +maxFloorReached: number
    +descend(): void
    +ascend(): void
  }

  class DifficultyManager {
    +update(metrics): boolean
    +getAdaptiveDifficulty(floor): AdaptiveDifficulty
  }

  DungeonGenerator <-- DungeonFeatureGenerator : usa
  DifficultyManager --> PlayerMetrics : lê performance

  note for DungeonGenerator "Grid 40×40, 8 salas (4–10 × 4–8 tiles)
BSP: rooms sem overlap + corredores L-shaped"

  note for DifficultyManager "EASY: HP×0.80, ATK×0.80
NORMAL: sem modificação
HARD: HP×1.30, ATK×1.20, +2 inimigos"
```

### 3.5 IA Narrativa

```mermaid
classDiagram

  class AIService {
    -apiKey: string
    -cache: Map~string, string~
    -enabled: boolean
    +generateItemDescription(item): Promise~string~
    +generateEnemyVariant(context): Promise~EnemyVariant~
    +generateEvent(context): Promise~string~
  }

  class NarrativeService {
    +generateNarrative(events: GameEvent[]): Promise~string~
    +generateDeathStory(events: GameEvent[]): Promise~string~
  }

  class EventMemory {
    -MAX_EVENTS: 100
    +addEvent(event): void
    +getImportantEvents(limit): GameEvent[]
    +toPromptLines(limit): string[]
  }

  NarrativeService --> AIService : usa
  GameScene --> EventMemory : registra eventos
  GameScene --> NarrativeService : gera narrativa
  GameOverScene --> NarrativeService : gera história de morte

  note for AIService "Provider: OpenAI GPT-3.5-turbo
Cache por JSON do input. Fallbacks embutidos.
Timeout: 5000ms"
```

---

## 4. Diagramas de Sequência

### 4.1 Combate Completo

```mermaid
sequenceDiagram
  participant GS as GameScene
  participant TM as TurnManager
  participant CS as CombatSystem
  participant ES as EnemySystem
  participant XP as XPSystem
  participant LS as LootSystem
  participant EB as EventBus

  GS->>TM: processPlayerAction({type:'ATTACK', target: enemy})
  TM->>CS: attack(player, enemy)
  CS-->>TM: {hit: true, damage: 10}
  TM->>ES: enemy.hp -= 10
  alt enemy.hp <= 0
    TM->>ES: enemy.alive = false
    CS->>XP: addXP(player, xpReward)
    XP->>EB: emit(PLAYER_XP_CHANGED)
  else enemy sobrevive
    TM->>ES: enemy.update(playerPos, dungeon, ...)
    ES-->>TM: {attacked: true, damage: 8}
    TM->>EB: emit(PLAYER_HP_CHANGED)
  end
  TM-->>GS: TurnResult
  GS->>LS: roll(gridX, gridY, floor, isElite, classDef)
  LS->>EB: emit(ITEM_DROPPED, {item})
```

### 4.2 Level Up

```mermaid
sequenceDiagram
  participant XP as XPSystem
  participant P as Player
  participant EB as EventBus

  XP->>XP: addXP(player, amount)
  loop while xp >= xpToNext
    XP->>P: player.level++
    XP->>P: player.attack += 5
    XP->>P: player.freePoints += 3
    XP->>P: player.recalcStats()
    XP->>P: player.hp = player.maxHp
    XP->>EB: emit(PLAYER_LEVELED_UP)
    XP->>EB: emit(PLAYER_HP_CHANGED)
  end
  XP->>EB: emit(PLAYER_XP_CHANGED)
```

### 4.3 Troca de Andar (Descida)

```mermaid
sequenceDiagram
  participant GS as GameScene
  participant FM as DungeonFloorManager
  participant DG as DungeonGenerator
  participant DM as DifficultyManager
  participant NS as NarrativeService
  participant EB as EventBus

  GS->>GS: _cleanup()
  GS->>FM: descend()
  FM->>EB: emit(FLOOR_CHANGED, {floor})
  GS->>GS: _loadDungeonFloor(floor)
  GS->>DG: new DungeonGenerator().generate()
  GS->>DM: getAdaptiveDifficulty(floor)
  DM-->>GS: {enemyCount, hpMultiplier, atkMultiplier}
  GS->>GS: createEnemies(dungeon, playerPos, difficulty)
  GS->>EB: emit(AREA_CHANGED, {area:'dungeon', floor})
  GS->>NS: generateNarrative(recentEvents) [async]
```

---

## 5. Mapa de Dependências

### Classes Centrais (Alto Acoplamento)

| Classe | Depende de | Dependida por |
|--------|-----------|--------------|
| `GameScene` | Todos os sistemas | Nenhuma (raiz) |
| `ClassRulesEngine` | `PlayerClassDef` | `TurnManager`, `EnemySystem`, `LootSystem`, `EquipmentSystem`, `SpellSystem` |
| `EventBus` | Nenhuma | `Player`, `XPSystem`, `LootSystem`, `EquipmentSystem`, `SpellSystem`, `UIScene` |
| `Player` | `InventorySystem`, `EventBus`, `PlayerClassDef` | `GameScene`, `TurnManager`, `CombatSystem` |

### Classes Isoladas (Baixo Acoplamento)

| Classe | Motivo |
|--------|--------|
| `DungeonGenerator` | Sem dependências externas além de `constants.ts` |
| `InventorySystem` | Depende apenas de `Item` e `INVENTORY` constant |
| `EventMemory` | Sem dependências externas |
| `ClassRulesEngine` | Stateless, depende apenas de `PlayerClassDef` |

### Classes Críticas (Ponto de Falha)

| Classe | Risco |
|--------|-------|
| `EventBus` | Singleton global. Falha silenciosa em `off()` sem `fn`. |
| `GameScene` | Classe Deus (~1000 linhas). Falha afeta tudo. |
| `TurnManager` | `playerTurn` não é thread-safe. |
| `_dungeonCache` | Não serializa inimigos — ressurgimento ao revisitar. |

---

## 6. Guia de Evolução Arquitetural

### Problema 1: GameScene como Classe Deus

**Refatoração sugerida:**
```
GameScene (orquestrador)
  ├── AreaManager (town / dungeon / bonus)
  │     ├── TownAreaController
  │     ├── DungeonAreaController
  │     └── BonusAreaController
  ├── InputController
  ├── RenderBatch
  └── SessionState
```

### Problema 2: EventBus sem Contrato de Tipo

**Refatoração sugerida:**
```typescript
type EventPayloads = {
  'player-hp-changed': { hp: number; maxHp: number };
  'player-xp-changed': { xp: number; xpNext: number };
};

class TypedEventBus {
  emit<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]): void
  on<K extends keyof EventPayloads>(event: K, fn: (data: EventPayloads[K]) => void): void
}
```

### Problema 3: Serialização de Estado de Dungeon

Para corrigir o ressurgimento de inimigos:
1. Adicionar `enemies: EnemySystemSnapshot[]` ao `DungeonState`.
2. `EnemySystemSnapshot` = `{ id, hp, alive, gridX, gridY }`.
3. Em `_loadDungeonFloor`: se cache tem inimigos mortos, não criar sprite para eles.

### Problema 4: Reinício sem Classe

`GameOverScene._restart()` chama `scene.start('GameScene')` sem `{ playerClass }`.

**Fix:** Armazenar a classe escolhida em `GameOverData` e repassar no restart:
```typescript
private _restart(): void {
  this.scene.start('CharacterSelectScene'); // ou passar classe salva
}
```
