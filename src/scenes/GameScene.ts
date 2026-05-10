import * as Phaser from 'phaser';
import { DungeonGenerator } from '../generators/DungeonGenerator';
import { Player } from '../entities/Player';
import { Item, ItemType } from '../entities/Item';
import { EnemySystem, createEnemies } from '../systems/EnemySystem';
import { CombatSystem } from '../systems/CombatSystem';
import { XPSystem } from '../systems/XPSystem';
import { TurnManager } from '../systems/TurnManager';
import { LootSystem } from '../systems/LootSystem';
import { EventBus } from '../utils/EventBus';
import { TownMap } from '../systems/WorldSystem';
import { NPCController } from '../systems/NPCController';
import { InteractiveObjectSystem } from '../systems/InteractiveObjectSystem';
import { TownTMXRenderer } from '../systems/TownTMXRenderer';
import { BonusAreaRenderer } from '../systems/BonusAreaRenderer';
import { LAYER_GROUND } from '../config/sprites-config';
import { InputModeManager } from '../systems/InputModeManager';
import { MapTransitionSystem } from '../systems/MapTransitionSystem';
import { DungeonFloorManager } from '../systems/DungeonFloorManager';
import { DifficultyScalingSystem } from '../systems/DifficultyScalingSystem';
import { PlayerMetrics } from '../systems/PlayerMetrics';
import { DifficultyManager } from '../systems/DifficultyManager';
import { DungeonFeatureGenerator, type DungeonFeature } from '../generators/DungeonFeatureGenerator';
import { EquipmentSystem } from '../systems/EquipmentSystem';
import { ShopSystem } from '../systems/ShopSystem';
import { SHOP_CATALOG } from '../config/shop.catalog';
import type { TransitionResolution } from '../types/transitions';
import type { GridPos } from '../generators/DungeonGenerator';
import {
  TILE_SIZE,
  TILE,
  SPRITES,
  DAWNLIKE_FRAMES,
  COLORS,
  ENEMY,
  EVENTS,
  GAME_STATE,
  INVENTORY,
  TOWN,
  TAVERN,
} from '../utils/constants';
import { MANUAL_MAP_OVERRIDES } from '../config/TileProperties';
import { TMX_PAD_X, TMX_PAD_Y, TMX_TILESETS } from '../config/TownTMXData';
import { BONUS_W, BONUS_H, BONUS_PLAYER_START_X, BONUS_PLAYER_START_Y } from '../config/BonusAreaData';
import type { DialogMenuOption } from '../types/town';
import type { EquipmentSlotId } from '../types/equipment';

export class GameScene extends Phaser.Scene {
  // ─── Sistemas persistentes (vivem durante toda a sessão) ─────────────────
  private player!: Player;
  private xpSystem!: XPSystem;
  private combatSystem!: CombatSystem;
  private turnManager!: TurnManager;
  private lootSystem!: LootSystem;
  private inputMode!: InputModeManager;
  private mapTransitionSystem!: MapTransitionSystem;
  private floorManager!: DungeonFloorManager;
  private difficultySystem!: DifficultyScalingSystem;
  private playerMetrics!: PlayerMetrics;
  private difficultyManager!: DifficultyManager;
  private featureGenerator!: DungeonFeatureGenerator;
  private _dungeonFeatures: DungeonFeature[] = [];
  private equipmentSystem!: EquipmentSystem;
  private _shopSystem!: ShopSystem;
  private gameState!: string;

  // Cache de andares visitados (runtime — não serializado ainda)
  private _dungeonCache = new Map<number, {
    dungeon:    DungeonGenerator;
    items:      Item[];
    floorFrame: number;
    features:   DungeonFeature[];
  }>();

  // ─── Estado da área atual ─────────────────────────────────────────────────
  private _currentArea: 'town' | 'dungeon' | 'bonus' = 'town';
  private _currentMap!: DungeonGenerator;
  private _dungeon: DungeonGenerator | null = null;
  private _enemies: EnemySystem[] = [];
  private _items: Item[] = [];
  private _floorFrame = 0;

  // ─── GameObjects rastreados por área (destruídos no cleanup) ─────────────
  private _tileObjects: Phaser.GameObjects.Image[] = [];
  private _decorObjects: Phaser.GameObjects.GameObject[] = [];

  // ─── Sistemas de cidade (recriados em cada _loadTown) ────────────────────
  private _npcController: NPCController | null = null;
  private _interactiveSystem: InteractiveObjectSystem | null = null;
  private _debugDispose: (() => void) | null = null;
  private _dungeonEntryTiles: { x: number; y: number }[] = [];

  // ─── Input ────────────────────────────────────────────────────────────────
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private iKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private uKey!: Phaser.Input.Keyboard.Key;
  private dKey!: Phaser.Input.Keyboard.Key;
  private vKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private numKeys!: Phaser.Input.Keyboard.Key[];

  // ─── Keyboard focus reset handler ────────────────────────────────────────
  private _onWindowFocusReset!: () => void;

  // ─── Estado de seleção de inventário / loja ───────────────────────────────
  private _inventorySelectedIndex = 0;
  private _shopSelectedIndex = 0;
  private _shopTab: 'buy' | 'sell' = 'buy';

  // ─── Estado de diálogo ────────────────────────────────────────────────────
  private _dialogOptions: DialogMenuOption[] = [];
  private _dialogSelectedIndex = 0;
  private _dialogNpcId = '';
  private _dialogTitle = '';

  // Handler estável para off() no shutdown
  private readonly _handleItemDropped = (data: { item: Item }) => {
    if (this.gameState === GAME_STATE.PLAYING && this._currentArea === 'dungeon') {
      this._spawnDroppedItem(data.item);
    }
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameState = GAME_STATE.PLAYING;
    this._dungeonCache.clear();

    // Sistemas criados uma vez — stats persistem entre áreas
    this.xpSystem     = new XPSystem(this.events);
    this.combatSystem = new CombatSystem(this.events, this.xpSystem);
    this.turnManager  = new TurnManager();
    this.lootSystem   = new LootSystem();
    this.inputMode          = new InputModeManager();
    this.mapTransitionSystem = new MapTransitionSystem();
    this.floorManager       = new DungeonFloorManager();
    this.difficultySystem   = new DifficultyScalingSystem();
    this.playerMetrics      = new PlayerMetrics();
    this.difficultyManager  = new DifficultyManager();
    this.featureGenerator   = new DungeonFeatureGenerator();
    this.floorManager.reset();
    this.equipmentSystem = new EquipmentSystem();
    this._shopSystem     = new ShopSystem(SHOP_CATALOG);
    this._registerTransitions();

    // Player criado uma vez — moves between areas
    this.player = new Player(this, TOWN.START_X, TOWN.START_Y);

    this._setupInput();
    this._registerEvents();
    this.scene.launch('UIScene');
    this._emitInitialUIState();

    this._loadArea('town');
  }

  shutdown(): void {
    EventBus.off(EVENTS.ITEM_DROPPED, this._handleItemDropped, this);
    EventBus.off(EVENTS.INVENTORY_STATE_REQUESTED, undefined, this);
    EventBus.off(EVENTS.SHOP_OPENED, undefined, this);
    EventBus.off(EVENTS.DIALOG_OPENED, undefined, this);
    this.game.events.off(Phaser.Core.Events.BLUR,  this._onWindowFocusReset, this);
    this.game.events.off(Phaser.Core.Events.FOCUS, this._onWindowFocusReset, this);
  }

  update(_time: number, delta: number): void {
    if (this.gameState !== GAME_STATE.PLAYING) return;
    this._handleInput(_time);

    // Atualizar NPCs com wandering (cidade e área bônus)
    if ((this._currentArea === 'town' || this._currentArea === 'bonus') && this._npcController) {
      this._npcController.update(delta, this._currentMap.grid);
    }

    // Atualizar prompt de interação baseado na posição do player
    if ((this._currentArea === 'town' || this._currentArea === 'bonus') && this._interactiveSystem) {
      this._interactiveSystem.update(this.player.gridX, this.player.gridY);
    }
  }

  // ─── Transições ──────────────────────────────────────────────────────────

  private _registerTransitions(): void {
    // SpawnPoints
    this.mapTransitionSystem.registerSpawn({ id: 'town-main',          mapId: 'town',    gridX: TOWN.START_X,            gridY: TOWN.START_Y });
    // Retorno da dungeon: spawn placeholder — será sobrescrito em _loadTown() após escanear entrarDungeon
    this.mapTransitionSystem.registerSpawn({ id: 'town-near-exit',     mapId: 'town',    gridX: TOWN.START_X, gridY: TOWN.START_Y });
    this.mapTransitionSystem.registerSpawn({ id: 'dungeon-floor1-entry', mapId: 'dungeon', gridX: 0, gridY: 0 });

    // TransitionPoints
    this.mapTransitionSystem.registerTransition({
      id: 'town-to-dungeon',
      fromMapId: 'town', toMapId: 'dungeon',
      fromGridX: 0, fromGridY: 0,  // posição verificada em _checkAreaTransition via _dungeonEntryTiles
      targetSpawnId: 'dungeon-floor1-entry',
    });
    this.mapTransitionSystem.registerTransition({
      id: 'dungeon-to-town',
      fromMapId: 'dungeon', toMapId: 'town',
      fromGridX: 0, fromGridY: 0,  // atualizado dinamicamente
      targetSpawnId: 'town-near-exit',
    });
  }

  private _executeTransition(resolution: TransitionResolution): void {
    this._cleanup();
    this.mapTransitionSystem.completeTransition(resolution);
    if (resolution.targetMapId === 'town') {
      this._currentArea = 'town';
      this._loadTown(resolution.targetSpawn.gridX, resolution.targetSpawn.gridY);
    } else {
      this._currentArea = 'dungeon';
      this._loadDungeonFloor(this.floorManager.currentFloor);
    }
    EventBus.emit(EVENTS.AREA_CHANGED, { area: this._currentArea, timestamp: Date.now() });
  }

  // ─── Gestão de Áreas ─────────────────────────────────────────────────────

  private _loadArea(area: 'town' | 'dungeon'): void {
    this._cleanup();
    this._currentArea = area;

    if (area === 'town') {
      this._loadTown(TOWN.START_X, TOWN.START_Y);
    } else {
      this._loadDungeonFloor(this.floorManager.currentFloor);
    }

    EventBus.emit(EVENTS.AREA_CHANGED, { area });
  }

  private _cleanup(): void {
    this._tileObjects.forEach(o => o.destroy());
    this._tileObjects = [];

    this._decorObjects.forEach(o => o.destroy());
    this._decorObjects = [];

    this._npcController?.destroy();
    this._npcController = null;

    this._interactiveSystem?.destroy();
    this._interactiveSystem = null;

    this._debugDispose?.();
    this._debugDispose = null;

    this._items.forEach(i => { i.sprite?.destroy(); i.sprite = null; });
    this._items = [];

    this._enemies.forEach(e => this._removeEnemySprite(e));
    this._enemies = [];
  }

  private _loadTown(spawnX = TOWN.START_X, spawnY = TOWN.START_Y): void {
    const renderer = new TownTMXRenderer();
    const { collisionGrid, npcSpawns, tileObjects, debugDispose } = renderer.render(this);
    this._debugDispose = debugDispose;

    // Construir TownMap com o grid de colisão do TMX
    const townMap = new TownMap();
    townMap.grid  = collisionGrid;
    this._currentMap = townMap;

    this._tileObjects.push(...tileObjects);

    // Escanear MANUAL_MAP_OVERRIDES por tiles com entrarDungeon:true
    this._dungeonEntryTiles = Object.entries(MANUAL_MAP_OVERRIDES)
      .filter(([, v]) => v.entrarDungeon === true)
      .map(([k]) => {
        const [tx, ty] = k.split(',').map(Number);
        return { x: tx + TMX_PAD_X, y: ty + TMX_PAD_Y };
      });
    console.log('[entrarDungeon] tiles registrados:', this._dungeonEntryTiles);

    for (const tile of this._dungeonEntryTiles) {
      const tmxKey = `${tile.x - TMX_PAD_X},${tile.y - TMX_PAD_Y}`;
      const override = MANUAL_MAP_OVERRIDES[tmxKey];
      // pit0 só é adicionado se o tile não tem forceGid próprio (forceGid é absoluto)
      if (!override?.forceGid) {
        this._tileObjects.push(
          this.add.image(tile.x * TILE_SIZE + TILE_SIZE / 2, tile.y * TILE_SIZE + TILE_SIZE / 2, 'pit0', 0).setDepth(LAYER_GROUND + 0.5),
        );
      }
    }

    // Atualiza spawn de retorno para o tile ao norte do mais alto
    if (this._dungeonEntryTiles.length > 0) {
      const north = this._dungeonEntryTiles.reduce((a, b) => b.y < a.y ? b : a);
      this.mapTransitionSystem.registerSpawn({ id: 'town-near-exit', mapId: 'town', gridX: north.x, gridY: north.y - 1 });
    }

    // NPCs vindos do TMX
    this._npcController = new NPCController();
    this._npcController.spawn(this, npcSpawns);

    // Sistema de objetos interativos (sem layout procedural — lista vazia)
    this._interactiveSystem = new InteractiveObjectSystem();
    this._interactiveSystem.load(this, [], this._npcController);

    // Reposicionar player
    this.player.gridX = spawnX;
    this.player.gridY = spawnY;
    this.player.setPosition(spawnX * TILE_SIZE + TILE_SIZE / 2, spawnY * TILE_SIZE + TILE_SIZE / 2);

    this.cameras.main.setBounds(0, 0, TOWN.WIDTH * TILE_SIZE, TOWN.HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    const isReturn = spawnX !== TOWN.START_X || spawnY !== TOWN.START_Y;
    EventBus.emit(EVENTS.UI_LOG, isReturn
      ? 'Você retornou à cidade.'
      : 'Bem-vindo à cidade. Siga o caminho ao sul para entrar na dungeon.',
    );
  }

  private _loadBonusArea(): void {
    this._cleanup();
    this._currentArea = 'bonus';

    const renderer = new BonusAreaRenderer();
    const { collisionGrid, npcSpawns, tileObjects, debugDispose } = renderer.render(this);
    this._debugDispose = debugDispose;
    this._tileObjects.push(...tileObjects);

    const bonusMap = new TownMap();
    bonusMap.grid = collisionGrid;
    this._currentMap = bonusMap;

    this._npcController = new NPCController();
    this._npcController.spawn(this, npcSpawns);

    this._interactiveSystem = new InteractiveObjectSystem();
    this._interactiveSystem.load(this, [], this._npcController);

    this.player.gridX = BONUS_PLAYER_START_X;
    this.player.gridY = BONUS_PLAYER_START_Y;
    this.player.setPosition(
      BONUS_PLAYER_START_X * TILE_SIZE + TILE_SIZE / 2,
      BONUS_PLAYER_START_Y * TILE_SIZE + TILE_SIZE / 2,
    );

    this.cameras.main.setBounds(0, 0, BONUS_W * TILE_SIZE, BONUS_H * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    EventBus.emit(EVENTS.AREA_CHANGED, { area: 'bonus', timestamp: Date.now() });
    EventBus.emit(EVENTS.UI_LOG, 'Uma área especial...');
  }

  /**
   * Carrega (ou gera) um andar de dungeon.
   * spawnPos: posição onde o player nasce; omitir = usar startPos da dungeon (entrada da cidade).
   */
  private _loadDungeonFloor(floor: number, spawnPos?: GridPos): void {
    const cached = this._dungeonCache.get(floor);

    if (cached) {
      this._dungeon    = cached.dungeon;
      this._floorFrame = cached.floorFrame;
      this._items      = cached.items;
      this._dungeonFeatures = cached.features;
    } else {
      this._dungeon = new DungeonGenerator();
      this._dungeon.generate();
      const variants   = DAWNLIKE_FRAMES.FLOOR_VARIANTS;
      this._floorFrame = variants[Math.floor(Math.random() * variants.length)];
      this._items      = [];
      this._generateInitialItems();
      // Gerar features e salvar conexões apenas uma vez (Math.random implica não-determinismo)
      this._dungeonFeatures = this.featureGenerator.generate(this._dungeon, floor);
      const connections = this.featureGenerator.extractConnections(this._dungeonFeatures);
      this.floorManager.saveFloorConnections(floor, connections);
    }

    this._currentMap  = this._dungeon;
    this._currentArea = 'dungeon';

    // Renderizar tiles
    const { width: W, height: H, grid } = this._dungeon;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const isFloor = grid[y][x] === TILE.FLOOR;
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;
        this._tileObjects.push(
          this.add.image(px, py, isFloor ? SPRITES.FLOOR : SPRITES.WALL,
            isFloor ? this._floorFrame : DAWNLIKE_FRAMES.WALL).setDepth(0),
        );
      }
    }

    // Recriar sprites dos itens no chão
    for (const item of this._items) {
      if (item.gridX === null || item.gridY === null) continue;
      const px = item.gridX * TILE_SIZE + TILE_SIZE / 2;
      const py = item.gridY * TILE_SIZE + TILE_SIZE / 2;
      const { texture, frame } = this._getItemVisual(item.type);
      item.sprite = this.add.sprite(px, py, texture, frame).setDepth(3);
    }

    this._renderDungeonFeatures(floor);

    // Gerar inimigos com scaling adaptativo (andar + performance do jogador)
    const difficulty = this.difficultyManager.getAdaptiveDifficulty(floor);
    this._enemies = createEnemies(this._dungeon, this._dungeon.startPos, difficulty);
    this._createEnemySprites();

    // Easter egg Platino
    this._spawnPlatino();

    // Persistir cache deste andar
    this._dungeonCache.set(floor, {
      dungeon:    this._dungeon,
      items:      this._items,
      floorFrame: this._floorFrame,
      features:   this._dungeonFeatures,
    });

    // Posicionar player
    const finalSpawn = spawnPos ?? this._dungeon.startPos;
    this.player.gridX = finalSpawn.x;
    this.player.gridY = finalSpawn.y;
    this.player.setPosition(finalSpawn.x * TILE_SIZE + TILE_SIZE / 2, finalSpawn.y * TILE_SIZE + TILE_SIZE / 2);

    this.cameras.main.setBounds(0, 0, W * TILE_SIZE, H * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    EventBus.emit(EVENTS.AREA_CHANGED, { area: 'dungeon', floor, timestamp: Date.now() });
    EventBus.emit(EVENTS.UI_LOG, cached ? `Você está no andar ${floor}.` : `Você desce para o andar ${floor}. Cuidado!`);
  }

  private _generateInitialItems(): void {
    const types: Array<'potion_heal' | 'potion_poison'> = ['potion_heal', 'potion_poison'];
    const count = INVENTORY.ITEM_SPAWN_MIN +
      Math.floor(Math.random() * (INVENTORY.ITEM_SPAWN_MAX - INVENTORY.ITEM_SPAWN_MIN + 1));
    const occupied = new Set<string>();
    occupied.add(`${this._dungeon!.startPos.x},${this._dungeon!.startPos.y}`);

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let pos = this._dungeon!.getRandomFloorPosition(this._dungeon!.startPos);
      let attempts = 0;
      while (occupied.has(`${pos.x},${pos.y}`) && attempts < 50) {
        pos = this._dungeon!.getRandomFloorPosition(this._dungeon!.startPos);
        attempts++;
      }
      if (occupied.has(`${pos.x},${pos.y}`)) continue;
      occupied.add(`${pos.x},${pos.y}`);
      this._items.push(new Item(`item_${i}`, type, pos.x, pos.y));
    }
  }

  private _getItemVisual(type: ItemType): { texture: string; frame: number } {
    switch (type) {
      case 'potion_heal':   return { texture: SPRITES.POTION, frame: DAWNLIKE_FRAMES.POTION_HEAL };
      case 'potion_poison': return { texture: SPRITES.POTION, frame: DAWNLIKE_FRAMES.POTION_POISON };
      case 'gold':          return { texture: SPRITES.MONEY,  frame: DAWNLIKE_FRAMES.GOLD };
    }
  }

  private _spawnDroppedItem(item: Item): void {
    if (item.gridX === null || item.gridY === null) return;
    const px = item.gridX * TILE_SIZE + TILE_SIZE / 2;
    const py = item.gridY * TILE_SIZE + TILE_SIZE / 2;
    const { texture, frame } = this._getItemVisual(item.type);
    item.sprite = this.add.sprite(px, py, texture, frame).setDepth(3);
    this._items.push(item);
  }

  private _renderDungeonFeatures(floor: number): void {
    for (const feature of this._dungeonFeatures) {
      const px = feature.gridX * TILE_SIZE + TILE_SIZE / 2;
      const py = feature.gridY * TILE_SIZE + TILE_SIZE / 2;
      if (feature.type === 'stairDown') {
        this._decorObjects.push(
          this.add.rectangle(px, py, TILE_SIZE, TILE_SIZE, 0xaa4400, 0.85).setDepth(2),
          this.add.text(px, py - TILE_SIZE - 2, '▼ DESCER', {
            fontSize: '5px', color: '#ffaa44', fontFamily: 'monospace',
          }).setOrigin(0.5, 1).setDepth(3),
        );
      } else if (feature.type === 'stairUp') {
        const label = floor === 1 ? '▲ CIDADE' : '▲ SUBIR';
        this._decorObjects.push(
          this.add.rectangle(px, py, TILE_SIZE, TILE_SIZE, 0x004488, 0.85).setDepth(2),
          this.add.text(px, py - TILE_SIZE - 2, label, {
            fontSize: '5px', color: '#44aaff', fontFamily: 'monospace',
          }).setOrigin(0.5, 1).setDepth(3),
        );
      }
    }
  }

  private _checkAreaTransition(): void {
    if (this._currentArea === 'town') {
      const px = this.player.gridX;
      const py = this.player.gridY;
      // Entrar na dungeon ao pisar em tile com entrarDungeon:true
      console.log(`[town move] player game(${px},${py}) | entries:`, this._dungeonEntryTiles.map(e => `(${e.x},${e.y})`).join(' '));
      if (this._dungeonEntryTiles.some(e => e.x === px && e.y === py)) {
        const resolution = this.mapTransitionSystem.requestTransition('town-to-dungeon');
        if (resolution) this._executeTransition(resolution);
        return;
      }
      // Entrar na área bônus (TMX 7,5 = game 12,10)
      if (px === TOWN.BONUS_ENTRY_X && py === TOWN.BONUS_ENTRY_Y) {
        this._loadBonusArea();
        return;
      }
      return;
    }

    if (this._currentArea === 'bonus') {
      // Sair da área bônus pela borda sul → retornar à cidade um tile abaixo do gatilho
      if (this.player.gridY >= BONUS_H - 1) {
        this._cleanup();
        this._currentArea = 'town';
        this._loadTown(TOWN.BONUS_ENTRY_X, TOWN.BONUS_ENTRY_Y + 1);
        EventBus.emit(EVENTS.AREA_CHANGED, { area: 'town', timestamp: Date.now() });
      }
      return;
    }

    const px = this.player.gridX;
    const py = this.player.gridY;

    const stairDown = this._dungeonFeatures.find(f => f.type === 'stairDown' && f.gridX === px && f.gridY === py);
    if (stairDown) {
      this._cleanup();
      this.floorManager.descend();
      const nextFloor = this.floorManager.currentFloor;
      this._loadDungeonFloor(nextFloor);
      // Reposicionar no stairUp do novo andar (gerado por _loadDungeonFloor)
      const conn = this.floorManager.getFloorConnections(nextFloor);
      if (conn?.stairsUp) {
        const s = conn.stairsUp.sourcePosition;
        this.player.gridX = s.x;
        this.player.gridY = s.y;
        this.player.setPosition(s.x * TILE_SIZE + TILE_SIZE / 2, s.y * TILE_SIZE + TILE_SIZE / 2);
      }
      return;
    }

    const stairUp = this._dungeonFeatures.find(f => f.type === 'stairUp' && f.gridX === px && f.gridY === py);
    if (stairUp?.connection) {
      if (stairUp.connection.targetFloor === 'town') {
        const resolution = this.mapTransitionSystem.requestTransition('dungeon-to-town');
        if (resolution) this._executeTransition(resolution);
      } else {
        this._cleanup();
        this.floorManager.ascend();
        const prevFloor = this.floorManager.currentFloor;
        const conn = this.floorManager.getFloorConnections(prevFloor);
        const spawnPos = conn?.stairsDown?.sourcePosition;
        this._loadDungeonFloor(prevFloor, spawnPos);
      }
    }
  }

  // ─── Sprites de Inimigos ─────────────────────────────────────────────────

  private _createEnemySprites(): void {
    this._enemies.forEach((enemy) => {
      const pos = enemy.getPixelPos();
      enemy.sprite  = this.add.sprite(pos.x, pos.y, SPRITES.ENEMY, DAWNLIKE_FRAMES.ENEMY).setDepth(5);
      enemy.hpBarBg = this.add.rectangle(pos.x, pos.y - TILE_SIZE / 2 - 2, TILE_SIZE, 3, 0x330000).setDepth(6);
      enemy.hpBar   = this.add.rectangle(pos.x, pos.y - TILE_SIZE / 2 - 2, TILE_SIZE, 3, 0xff2222).setDepth(6);
    });
  }

  // ─── Easter Egg: Platino (DragonDePlatino, CC-BY 4.0) ───────────────────

  private _spawnPlatino(): void {
    if (!this._dungeon || this._dungeon.rooms.length === 0) return;
    const lastRoom = this._dungeon.rooms[this._dungeon.rooms.length - 1];
    const px = (lastRoom.x + lastRoom.width  - 2) * TILE_SIZE + TILE_SIZE / 2;
    const py = (lastRoom.y + lastRoom.height - 2) * TILE_SIZE + TILE_SIZE / 2;
    this._decorObjects.push(
      this.add.sprite(px, py, SPRITES.PLATINO, DAWNLIKE_FRAMES.PLATINO).setDepth(4).setAlpha(0.55),
      this.add.text(px, py + TILE_SIZE + 2, '© DragonDePlatino\nCC-BY 4.0', {
        fontSize: '6px', color: '#aaaaaa', fontFamily: 'monospace', align: 'center',
      }).setOrigin(0.5, 0).setDepth(4).setAlpha(0.55),
    );
  }

  // ─── Coleta de Itens ─────────────────────────────────────────────────────

  private _checkItemPickup(): void {
    const px = this.player.gridX;
    const py = this.player.gridY;

    for (const item of this._items) {
      if (item.gridX !== px || item.gridY !== py) continue;

      if (this.player.inventory.isFull()) {
        EventBus.emit(EVENTS.UI_LOG, 'Inventário cheio! Não foi possível coletar.');
        continue;
      }

      const displayName = item.getDisplayName(this.player.identifiedItems);
      this.player.inventory.addItem(item);
      const slotIndex = this.player.inventory.items.findIndex(i => i === item);

      const s = item.sprite;
      item.sprite = null;
      s?.setVisible(false);
      this.time.delayedCall(0, () => s?.destroy());

      EventBus.emit(EVENTS.UI_LOG, `Você pegou ${displayName}`);
      EventBus.emit(EVENTS.ITEM_PICKED_UP, { item, slotIndex });
    }

    this._items = this._items.filter(i => i.gridX !== null);
  }

  // ─── Input ───────────────────────────────────────────────────────────────

  private _setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd    = this.input.keyboard!.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
    this.spaceKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.iKey      = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.escKey    = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.eKey      = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.uKey      = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    this.dKey      = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.vKey      = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.V);
    this.enterKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this._onWindowFocusReset = () => { this.input.keyboard?.resetKeys(); };
    this.game.events.on(Phaser.Core.Events.BLUR,  this._onWindowFocusReset, this);
    this.game.events.on(Phaser.Core.Events.FOCUS, this._onWindowFocusReset, this);
    this.numKeys  = [
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE,
      Phaser.Input.Keyboard.KeyCodes.FOUR,
      Phaser.Input.Keyboard.KeyCodes.FIVE,
      Phaser.Input.Keyboard.KeyCodes.SIX,
      Phaser.Input.Keyboard.KeyCodes.SEVEN,
      Phaser.Input.Keyboard.KeyCodes.EIGHT,
      Phaser.Input.Keyboard.KeyCodes.NINE,
    ].map(code => this.input.keyboard!.addKey(code));
  }

  private _handleInput(_time: number): void {
    const JD = Phaser.Input.Keyboard.JustDown;

    // 1. ESC — maior prioridade: fecha qualquer overlay
    if (JD(this.escKey)) {
      if (this.inputMode.is('DIALOG')) {
        this.inputMode.pop();
        EventBus.emit(EVENTS.DIALOG_CLOSED, {});
      } else if (this.inputMode.is('INVENTORY')) {
        this.inputMode.pop();
        EventBus.emit(EVENTS.INVENTORY_CLOSED, { timestamp: Date.now() });
      } else if (this.inputMode.is('SHOP')) {
        this.inputMode.pop();
        EventBus.emit(EVENTS.SHOP_CLOSED, { timestamp: Date.now() });
      }
      return;
    }

    // 1b. Modo DIALOG
    if (this.inputMode.is('DIALOG')) {
      this._handleDialogInput();
      return;
    }

    // 2. I — toggle inventário (não consome turno)
    if (JD(this.iKey)) {
      if (this.inputMode.is('INVENTORY')) {
        this.inputMode.pop();
        EventBus.emit(EVENTS.INVENTORY_CLOSED, { timestamp: Date.now() });
      } else if (this.inputMode.is('GAMEPLAY')) {
        this.inputMode.push('INVENTORY');
        this._inventorySelectedIndex = 0;
        EventBus.emit(EVENTS.INVENTORY_OPENED, { timestamp: Date.now() });
        this._emitInventoryState();
      }
      return;
    }

    // 3. Modo SHOP
    if (this.inputMode.is('SHOP')) {
      this._handleShopInput();
      return;
    }

    // 4. Modo INVENTORY
    if (this.inputMode.is('INVENTORY')) {
      this._handleInventoryInput();
      return;
    }

    // 5. GAMEPLAY
    if (!this.inputMode.is('GAMEPLAY')) return;
    if (!this.turnManager.isPlayerTurn()) return;

    // Teclas 1–9: usar item do slot
    for (let i = 0; i < this.numKeys.length; i++) {
      if (JD(this.numKeys[i])) {
        const result = this.turnManager.processPlayerAction(
          { type: 'USE_ITEM', itemIndex: i },
          this.player,
          this._enemies,
          this._currentMap,
          this.combatSystem,
        );
        result.messages.forEach(msg => EventBus.emit(EVENTS.UI_LOG, msg));
        if (result.playerDied) this.events.emit(EVENTS.PLAYER_DIED);
        return;
      }
    }

    // Movimento / Ataque / Espera
    let dx = 0, dy = 0;
    if      (JD(this.cursors.up)    || JD(this.wasd.up))    dy = -1;
    else if (JD(this.cursors.down)  || JD(this.wasd.down))  dy =  1;
    else if (JD(this.cursors.left)  || JD(this.wasd.left))  dx = -1;
    else if (JD(this.cursors.right) || JD(this.wasd.right)) dx =  1;

    const isWait = JD(this.spaceKey);
    if (dx === 0 && dy === 0 && !isWait) return;

    const tx = this.player.gridX + dx;
    const ty = this.player.gridY + dy;
    const targetEnemy = !isWait && this._enemies.find(e => e.alive && e.gridX === tx && e.gridY === ty);

    // Bloqueia movimento quando o tile de destino está ocupado por um NPC
    if (!isWait && !targetEnemy && this._npcController?.isTileOccupied(tx, ty)) return;

    const action = isWait
      ? { type: 'WAIT' as const }
      : targetEnemy
        ? { type: 'ATTACK' as const, target: targetEnemy }
        : { type: 'MOVE' as const, dx, dy };

    const result = this.turnManager.processPlayerAction(
      action,
      this.player,
      this._enemies,
      this._currentMap,
      this.combatSystem,
      this.playerMetrics,
    );

    result.messages.forEach(msg => EventBus.emit(EVENTS.UI_LOG, msg));

    if (result.playerMoved) {
      this._checkItemPickup();
      this._checkAreaTransition();
    }

    this._enemies.forEach(e => this._syncEnemySprite(e));

    result.enemiesDied.forEach(e => {
      EventBus.emit(EVENTS.UI_LOG, `+${e.xpReward} XP`);
      this._removeEnemySprite(e);
      this.lootSystem.roll(e.gridX, e.gridY);
    });

    // Atualizar dificuldade adaptativa e emitir hint narrativo se mudou
    const levelChanged = this.difficultyManager.update(this.playerMetrics);
    if (levelChanged) {
      const hint = this.difficultyManager.getAdaptiveDifficulty(this.floorManager.currentFloor).narrativeHint;
      if (hint) EventBus.emit(EVENTS.UI_LOG, hint);
    }

    if (result.playerDied) {
      this.events.emit(EVENTS.PLAYER_DIED);
    }
  }

  private _handleInventoryInput(): void {
    const JD = Phaser.Input.Keyboard.JustDown;
    const inv = this.player.inventory;
    const total = inv.items.filter(i => i !== null).length;

    if (JD(this.cursors.up) || JD(this.wasd.up)) {
      this._inventorySelectedIndex = Math.max(0, this._inventorySelectedIndex - 1);
      this._emitInventorySelectionChanged();
      return;
    }
    if (JD(this.cursors.down) || JD(this.wasd.down)) {
      this._inventorySelectedIndex = Math.min(total - 1, this._inventorySelectedIndex + 1);
      this._emitInventorySelectionChanged();
      return;
    }

    const item = inv.getItem(this._inventorySelectedIndex);

    if (JD(this.eKey)) {
      if (!item) { EventBus.emit(EVENTS.UI_LOG, 'Nenhum item selecionado.'); return; }
      if (!item.slotId) { EventBus.emit(EVENTS.UI_LOG, 'Este item não pode ser equipado.'); return; }
      if (this.equipmentSystem.getEquippedId(item.slotId as EquipmentSlotId) === item.id) {
        this._unequipSelectedItem();
      } else {
        this._equipSelectedItem();
      }
      return;
    }

    if (JD(this.uKey)) {
      if (!item) { EventBus.emit(EVENTS.UI_LOG, 'Nenhum item selecionado.'); return; }
      this._useSelectedItem();
      return;
    }

    if (JD(this.dKey)) {
      if (!item) { EventBus.emit(EVENTS.UI_LOG, 'Nenhum item selecionado.'); return; }
      this._dropSelectedItem();
      return;
    }
  }

  private _handleShopInput(): void {
    const JD = Phaser.Input.Keyboard.JustDown;

    // Tab switch: left/right arrows
    if (JD(this.cursors.left) || JD(this.wasd.left)) {
      this._shopTab = 'buy';
      this._shopSelectedIndex = 0;
      this._clampShopSelection();
      this._emitShopState();
      return;
    }
    if (JD(this.cursors.right) || JD(this.wasd.right)) {
      this._shopTab = 'sell';
      this._shopSelectedIndex = 0;
      this._emitShopState();
      return;
    }

    if (this._shopTab === 'buy') {
      const total = this._shopSystem.catalog.length;

      if (JD(this.cursors.up) || JD(this.wasd.up)) {
        this._shopSelectedIndex = Math.max(0, this._shopSelectedIndex - 1);
        this._emitShopState();
        return;
      }
      if (JD(this.cursors.down) || JD(this.wasd.down)) {
        this._shopSelectedIndex = Math.min(total - 1, this._shopSelectedIndex + 1);
        this._emitShopState();
        return;
      }

      if (JD(this.eKey) || JD(this.enterKey)) {
        const result = this._shopSystem.buyItem(this.player, this._shopSelectedIndex, this.player.inventory);
        EventBus.emit(EVENTS.UI_LOG, result.message);
        if (result.success) {
          this._emitShopState();
        }
        return;
      }
    } else {
      // sell tab
      const equippedIds = new Set(Object.values(this.equipmentSystem.getAllEquipped()).filter(Boolean) as string[]);
      const sellItems = this._shopSystem.buildSellItems({ inventory: this.player.inventory }, equippedIds, this._shopSelectedIndex);
      const total = sellItems.length;

      if (JD(this.cursors.up) || JD(this.wasd.up)) {
        this._shopSelectedIndex = Math.max(0, this._shopSelectedIndex - 1);
        this._emitShopState();
        return;
      }
      if (JD(this.cursors.down) || JD(this.wasd.down)) {
        this._shopSelectedIndex = Math.min(Math.max(0, total - 1), this._shopSelectedIndex + 1);
        this._emitShopState();
        return;
      }

      if (JD(this.vKey)) {
        const entry = sellItems[this._shopSelectedIndex];
        if (entry && entry.canSell) {
          const result = this._shopSystem.sellItem(this.player, entry.inventoryIndex, this.player.inventory);
          EventBus.emit(EVENTS.UI_LOG, result.message);
          if (result.success) {
            this._shopSelectedIndex = Math.max(0, this._shopSelectedIndex - 1);
            this._emitShopState();
          }
        }
        return;
      }
    }
  }

  private _equipSelectedItem(): void {
    const item = this.player.inventory.getItem(this._inventorySelectedIndex);
    if (!item?.slotId) return;

    // Remover bônus do item anterior no mesmo slot
    const prevId = this.equipmentSystem.getEquippedId(item.slotId);
    if (prevId) {
      const prevItem = this.player.inventory.items.find(i => i?.id === prevId);
      if (prevItem?.bonuses) this.player.removeEquipmentBonuses(prevItem.bonuses);
    }

    this.equipmentSystem.equip(item.id, item.slotId);
    if (item.bonuses) this.player.applyEquipmentBonuses(item.bonuses);

    EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: this.player.hp, maxHp: this.player.maxHp });
    EventBus.emit(EVENTS.UI_LOG, `Equipou ${item.name ?? item.type}.`);
    this._emitInventoryState();
  }

  private _unequipSelectedItem(): void {
    const item = this.player.inventory.getItem(this._inventorySelectedIndex);
    if (!item?.slotId) return;
    this.equipmentSystem.unequip(item.slotId as EquipmentSlotId);
    if (item.bonuses) this.player.removeEquipmentBonuses(item.bonuses);
    EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: this.player.hp, maxHp: this.player.maxHp });
    EventBus.emit(EVENTS.UI_LOG, `Desequipou ${item.name ?? item.type}.`);
    this._emitInventoryState();
  }

  private _useSelectedItem(): void {
    const result = this.player.inventory.useItem(
      this._inventorySelectedIndex,
      this.player.identifiedItems,
      this.player.hp,
      this.player.maxHp,
    );
    result.messages.forEach(msg => EventBus.emit(EVENTS.UI_LOG, msg));

    if (result.success && result.hpDelta !== 0) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + result.hpDelta);
      EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: this.player.hp, maxHp: this.player.maxHp });
    }

    EventBus.emit(EVENTS.ITEM_USED, { itemIndex: this._inventorySelectedIndex });
    this._clampInventorySelection();
    this._emitInventoryState();
  }

  private _dropSelectedItem(): void {
    if (this._currentArea !== 'dungeon') {
      EventBus.emit(EVENTS.UI_LOG, 'Não é possível dropar itens na cidade.');
      return;
    }
    const item = this.player.inventory.removeItem(this._inventorySelectedIndex);
    if (!item) return;

    const pos = this._findNearestFreeTile(this.player.gridX, this.player.gridY);
    item.gridX = pos.x;
    item.gridY = pos.y;

    EventBus.emit(EVENTS.ITEM_DROPPED, { item });
    EventBus.emit(EVENTS.UI_LOG, `Dropou ${item.name ?? item.getDisplayName(this.player.identifiedItems)}.`);
    this._clampInventorySelection();
    this._emitInventoryState();
  }

  private _findNearestFreeTile(fromX: number, fromY: number): { x: number; y: number } {
    const dirs = [
      { dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
      { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 },
    ];
    for (const d of dirs) {
      const tx = fromX + d.dx;
      const ty = fromY + d.dy;
      if (!this._currentMap.isWalkable(tx, ty)) continue;
      if (this._enemies.some(e => e.alive && e.gridX === tx && e.gridY === ty)) continue;
      if (this._items.some(i => i.gridX === tx && i.gridY === ty)) continue;
      return { x: tx, y: ty };
    }
    return { x: fromX, y: fromY };
  }

  private _clampInventorySelection(): void {
    const total = this.player.inventory.items.filter(i => i !== null).length;
    this._inventorySelectedIndex = total > 0
      ? Math.min(this._inventorySelectedIndex, total - 1)
      : 0;
  }

  private _clampShopSelection(): void {
    const total = this._shopSystem.catalog.length;
    this._shopSelectedIndex = Math.min(this._shopSelectedIndex, Math.max(0, total - 1));
  }

  private _emitInventoryState(): void {
    EventBus.emit(EVENTS.INVENTORY_STATE_RESPONSE, {
      items:           this.player.inventory.items,
      equipped:        this.equipmentSystem.getAllEquipped(),
      identifiedItems: this.player.identifiedItems,
      selectedIndex:   this._inventorySelectedIndex,
      timestamp:       Date.now(),
    });
  }

  private _emitInventorySelectionChanged(): void {
    const item = this.player.inventory.getItem(this._inventorySelectedIndex);
    EventBus.emit(EVENTS.INVENTORY_SELECTION_CHANGED, {
      selectedIndex: this._inventorySelectedIndex,
      item,
    });
  }

  private _emitShopState(): void {
    const equippedIds = new Set(Object.values(this.equipmentSystem.getAllEquipped()).filter(Boolean) as string[]);
    const vm = this._shopSystem.buildViewModel(
      this.player,
      this._shopSelectedIndex,
      this._shopTab,
      this.player.inventory,
      equippedIds,
    );
    EventBus.emit(EVENTS.SHOP_UPDATED, vm);
  }

  private _removeEnemySprite(enemy: EnemySystem): void {
    enemy.sprite?.destroy();
    enemy.hpBarBg?.destroy();
    enemy.hpBar?.destroy();
    enemy.sprite  = null;
    enemy.hpBar   = null;
    enemy.hpBarBg = null;
  }

  private _syncEnemySprite(enemy: EnemySystem): void {
    if (!enemy.alive || !enemy.sprite || !enemy.sprite.active) return;
    const pos = enemy.getPixelPos();
    enemy.sprite.setPosition(pos.x, pos.y);
    if (enemy.hpBar?.active) {
      const hpRatio  = enemy.hp / enemy.maxHp;
      const barWidth = Math.max(0.1, TILE_SIZE * hpRatio);
      enemy.hpBar.setSize(barWidth, 3)
        .setPosition(pos.x - TILE_SIZE / 2 + barWidth / 2, pos.y - TILE_SIZE / 2 - 2);
      enemy.hpBarBg?.setPosition(pos.x, pos.y - TILE_SIZE / 2 - 2);
    }
  }

  // ─── Feedback Visual ─────────────────────────────────────────────────────

  private _showDamageText(pos: { x: number; y: number }, damage: number | string, color: string): void {
    const text = this.add
      .text(pos.x, pos.y - 8, `-${damage}`, {
        fontSize: '8px', color, fontFamily: 'monospace', fontStyle: 'bold',
      })
      .setDepth(20).setOrigin(0.5);
    this.tweens.add({
      targets: text, y: pos.y - 30, alpha: 0, duration: 800, ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /** Flash vermelho no sprite atingido (pisca uma vez). */
  private _flashSprite(sprite: Phaser.GameObjects.Sprite): void {
    this.tweens.add({
      targets: sprite,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 1,
      onComplete: () => { sprite.setAlpha(1); },
    });
    sprite.setTint(0xff4444);
    this.time.delayedCall(160, () => { if (sprite.active) sprite.clearTint(); });
  }

  // ─── Eventos ─────────────────────────────────────────────────────────────

  private _emitInitialUIState(): void {
    const p = this.player;
    EventBus.emit(EVENTS.PLAYER_HP_CHANGED,   { hp: p.hp,   maxHp: p.maxHp });
    EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: p.mana, maxMana: p.maxMana });
    EventBus.emit(EVENTS.PLAYER_XP_CHANGED,   { xp: p.xp, xpNext: this.xpSystem.getXPToNextLevel(p.level) });
    EventBus.emit(EVENTS.PLAYER_LEVELED_UP,   { level: p.level, maxHp: p.maxHp, attack: p.attack });
    EventBus.emit(EVENTS.PLAYER_GOLD_CHANGED, { gold: p.gold });
  }

  private _registerEvents(): void {
    this.events.on(EVENTS.PLAYER_DIED, () => {
      this.gameState = GAME_STATE.GAME_OVER;
      EventBus.emit(EVENTS.UI_LOG, 'Você morreu.');
      this.cameras.main.flash(500, 255, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', { level: this.player.level, xp: this.player.xp });
      });
    });

    this.events.on(EVENTS.PLAYER_LEVELED_UP, (data: { level: number; maxHp: number; attack: number }) => {
      this._showDamageText(this.player.getPixelPos(), `NÍVEL ${data.level}!`, COLORS.LEVEL_UP_TEXT);
      EventBus.emit(EVENTS.UI_LOG, `Subiu para o Nível ${data.level}!`);
    });

    // Feedback visual: dano no inimigo (número amarelo + flash)
    this.events.on(EVENTS.DAMAGE_ENEMY, (data: { pos: { x: number; y: number }; damage: number }) => {
      this._showDamageText(data.pos, data.damage, COLORS.XP_TEXT);
      const enemy = this._enemies.find(
        e => e.alive && e.sprite?.active &&
          Math.abs(e.getPixelPos().x - data.pos.x) < 1 &&
          Math.abs(e.getPixelPos().y - data.pos.y) < 1,
      );
      if (enemy?.sprite) this._flashSprite(enemy.sprite);
    });

    // Feedback visual: dano no player (número vermelho + flash)
    this.events.on(EVENTS.DAMAGE_PLAYER, (data: { pos: { x: number; y: number }; damage: number }) => {
      this._showDamageText(data.pos, data.damage, COLORS.DAMAGE_TEXT);
      this._flashSprite(this.player);
    });

    EventBus.on(EVENTS.ITEM_DROPPED, this._handleItemDropped, this);

    // Responde com estado do inventário quando UIScene solicitar
    EventBus.on(EVENTS.INVENTORY_STATE_REQUESTED, () => {
      this._emitInventoryState();
    }, this);

    // Abre a loja quando o mercador é interagido
    EventBus.on(EVENTS.SHOP_OPENED, () => {
      if (!this.inputMode.is('GAMEPLAY')) return;
      this.inputMode.push('SHOP');
      this._shopTab = 'buy';
      this._shopSelectedIndex = 0;
      this._emitShopState();
    }, this);

    // Abre diálogo com NPC de menu
    EventBus.on(EVENTS.DIALOG_OPENED, (data: { npcId: string; title: string; options: DialogMenuOption[] }) => {
      if (!this.inputMode.is('GAMEPLAY')) return;
      this._dialogNpcId = data.npcId;
      this._dialogTitle = data.title;
      this._dialogOptions = data.options;
      this._dialogSelectedIndex = 0;
      this.inputMode.push('DIALOG');
      if (data.options.length > 0) {
        EventBus.emit(EVENTS.DIALOG_OPTION_SELECTED, { index: 0, option: data.options[0] });
      }
    }, this);

    // Mouse: selecionar item na loja
    EventBus.on(EVENTS.SHOP_ITEM_SELECTED, (data: { index: number }) => {
      if (!this.inputMode.is('SHOP')) return;
      this._shopSelectedIndex = data.index;
      this._emitShopState();
    }, this);
  }

  private _handleDialogInput(): void {
    const JD = Phaser.Input.Keyboard.JustDown;
    const total = this._dialogOptions.length;

    if (JD(this.cursors.up) || JD(this.wasd.up)) {
      this._dialogSelectedIndex = Math.max(0, this._dialogSelectedIndex - 1);
      EventBus.emit(EVENTS.DIALOG_OPTION_SELECTED, {
        index: this._dialogSelectedIndex,
        option: this._dialogOptions[this._dialogSelectedIndex],
      });
      return;
    }
    if (JD(this.cursors.down) || JD(this.wasd.down)) {
      this._dialogSelectedIndex = Math.min(total - 1, this._dialogSelectedIndex + 1);
      EventBus.emit(EVENTS.DIALOG_OPTION_SELECTED, {
        index: this._dialogSelectedIndex,
        option: this._dialogOptions[this._dialogSelectedIndex],
      });
      return;
    }

    if (JD(this.enterKey) || JD(this.eKey)) {
      const option = this._dialogOptions[this._dialogSelectedIndex];
      if (!option) return;

      if (option.action === 'rest') {
        const cost = option.goldCost ?? TAVERN.REST_COST;
        if (this.player.gold < cost) {
          EventBus.emit(EVENTS.UI_LOG, `Ouro insuficiente. Precisa de ${cost} moedas para descansar.`);
        } else {
          this.player.gold -= cost;
          this.player.hp   = this.player.maxHp;
          this.player.mana = this.player.maxMana;
          EventBus.emit(EVENTS.PLAYER_GOLD_CHANGED, { gold: this.player.gold });
          EventBus.emit(EVENTS.PLAYER_HP_CHANGED,   { hp: this.player.hp, maxHp: this.player.maxHp });
          EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: this.player.mana, maxMana: this.player.maxMana });
          EventBus.emit(EVENTS.UI_LOG, `Descansou e recuperou toda a vida e mana por ${cost} ouros.`);
          this.inputMode.pop();
          EventBus.emit(EVENTS.DIALOG_CLOSED, {});
        }
      } else {
        // No special action — just close
        this.inputMode.pop();
        EventBus.emit(EVENTS.DIALOG_CLOSED, {});
      }
      return;
    }
  }
}
