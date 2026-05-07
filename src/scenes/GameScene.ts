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
import { InputModeManager } from '../systems/InputModeManager';
import { MapTransitionSystem } from '../systems/MapTransitionSystem';
import { DungeonFloorManager } from '../systems/DungeonFloorManager';
import { DifficultyScalingSystem } from '../systems/DifficultyScalingSystem';
import { DungeonFeatureGenerator, type DungeonFeature } from '../generators/DungeonFeatureGenerator';
import { EquipmentSystem } from '../systems/EquipmentSystem';
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
} from '../utils/constants';

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
  private featureGenerator!: DungeonFeatureGenerator;
  private _dungeonFeatures: DungeonFeature[] = [];
  private equipmentSystem!: EquipmentSystem;
  private gameState!: string;

  // Cache de andares visitados (runtime — não serializado ainda)
  private _dungeonCache = new Map<number, {
    dungeon:    DungeonGenerator;
    items:      Item[];
    floorFrame: number;
    features:   DungeonFeature[];
  }>();

  // ─── Estado da área atual ─────────────────────────────────────────────────
  private _currentArea: 'town' | 'dungeon' = 'town';
  private _currentMap!: DungeonGenerator;
  private _dungeon: DungeonGenerator | null = null;
  private _enemies: EnemySystem[] = [];
  private _items: Item[] = [];
  private _floorFrame = 0;

  // ─── GameObjects rastreados por área (destruídos no cleanup) ─────────────
  private _tileObjects: Phaser.GameObjects.Image[] = [];
  private _decorObjects: Phaser.GameObjects.GameObject[] = [];

  // ─── Input ────────────────────────────────────────────────────────────────
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private iKey!: Phaser.Input.Keyboard.Key;
  private numKeys!: Phaser.Input.Keyboard.Key[];

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
    this.featureGenerator   = new DungeonFeatureGenerator();
    this.floorManager.reset();
    this.equipmentSystem = new EquipmentSystem();
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
  }

  update(_time: number, _delta: number): void {
    if (this.gameState !== GAME_STATE.PLAYING) return;
    this._handleInput(_time);
  }

  // ─── Transições ──────────────────────────────────────────────────────────

  private _registerTransitions(): void {
    // SpawnPoints
    this.mapTransitionSystem.registerSpawn({ id: 'town-main',          mapId: 'town',    gridX: TOWN.START_X, gridY: TOWN.START_Y });
    this.mapTransitionSystem.registerSpawn({ id: 'town-near-exit',     mapId: 'town',    gridX: TOWN.EXIT_X,  gridY: TOWN.EXIT_Y - 1 });
    this.mapTransitionSystem.registerSpawn({ id: 'dungeon-floor1-entry', mapId: 'dungeon', gridX: 0, gridY: 0 });

    // TransitionPoints
    this.mapTransitionSystem.registerTransition({
      id: 'town-to-dungeon',
      fromMapId: 'town', toMapId: 'dungeon',
      fromGridX: TOWN.EXIT_X, fromGridY: TOWN.EXIT_Y,
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

    this._items.forEach(i => { i.sprite?.destroy(); i.sprite = null; });
    this._items = [];

    this._enemies.forEach(e => this._removeEnemySprite(e));
    this._enemies = [];
  }

  private _loadTown(spawnX = TOWN.START_X, spawnY = TOWN.START_Y): void {
    const townMap = new TownMap();
    this._currentMap = townMap;

    for (let y = 0; y < TOWN.HEIGHT; y++) {
      for (let x = 0; x < TOWN.WIDTH; x++) {
        const isFloor = townMap.grid[y][x] === TILE.FLOOR;
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;
        this._tileObjects.push(
          this.add.image(px, py, isFloor ? SPRITES.FLOOR : SPRITES.WALL,
            isFloor ? TOWN.FLOOR_FRAME : DAWNLIKE_FRAMES.WALL).setDepth(0),
        );
      }
    }

    // Marcador de saída para dungeon
    const ex = TOWN.EXIT_X * TILE_SIZE + TILE_SIZE / 2;
    const ey = TOWN.EXIT_Y * TILE_SIZE + TILE_SIZE / 2;
    this._decorObjects.push(
      this.add.rectangle(ex, ey, TILE_SIZE, TILE_SIZE, 0xff8800, 0.85).setDepth(2),
      this.add.text(ex, ey - TILE_SIZE - 2, '[ DUNGEON ]', {
        fontSize: '6px', color: '#ffdd00', fontFamily: 'monospace',
      }).setOrigin(0.5, 1).setDepth(3),
    );

    // Reposicionar player na posição de spawn
    this.player.gridX = spawnX;
    this.player.gridY = spawnY;
    this.player.setPosition(spawnX * TILE_SIZE + TILE_SIZE / 2, spawnY * TILE_SIZE + TILE_SIZE / 2);

    this.cameras.main.setBounds(0, 0, TOWN.WIDTH * TILE_SIZE, TOWN.HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    const isReturn = spawnX === TOWN.EXIT_X && spawnY === TOWN.EXIT_Y - 1;
    EventBus.emit(EVENTS.UI_LOG, isReturn
      ? 'Você retornou à cidade.'
      : 'Bem-vindo à cidade. Vá para o sul para entrar na dungeon.',
    );
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

    // Gerar inimigos com scaling de dificuldade
    const difficulty = this.difficultySystem.getFloorDifficulty(floor);
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
      if (this.player.gridX === TOWN.EXIT_X && this.player.gridY === TOWN.EXIT_Y) {
        const resolution = this.mapTransitionSystem.requestTransition('town-to-dungeon');
        if (resolution) this._executeTransition(resolution);
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
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.iKey     = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I);
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

    // Tecla I: toggle inventário (não consome turno, funciona em qualquer modo)
    if (JD(this.iKey)) {
      if (this.inputMode.is('INVENTORY')) {
        this.inputMode.set('GAMEPLAY');
        EventBus.emit(EVENTS.INVENTORY_CLOSED, { timestamp: Date.now() });
      } else {
        this.inputMode.push('INVENTORY');
        EventBus.emit(EVENTS.INVENTORY_OPENED, { timestamp: Date.now() });
        EventBus.emit(EVENTS.INVENTORY_STATE_REQUESTED, { timestamp: Date.now() });
      }
      return;
    }

    // Bloqueia todo o resto quando fora do modo GAMEPLAY
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

    if (result.playerDied) {
      this.events.emit(EVENTS.PLAYER_DIED);
    }
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
      EventBus.emit(EVENTS.INVENTORY_STATE_RESPONSE, {
        items:           this.player.inventory.items,
        equipped:        this.equipmentSystem.getAllEquipped(),
        identifiedItems: this.player.identifiedItems,
        timestamp:       Date.now(),
      });
    }, this);
  }
}
