import * as Phaser from 'phaser';
import { DungeonGenerator } from '../generators/DungeonGenerator';
import { Player } from '../entities/Player';
import { EnemySystem, createEnemies } from '../systems/EnemySystem';
import { CombatSystem } from '../systems/CombatSystem';
import { XPSystem } from '../systems/XPSystem';
import { TurnManager } from '../systems/TurnManager';
import { EventBus } from '../utils/EventBus';
import {
  TILE_SIZE,
  TILE,
  SPRITES,
  DAWNLIKE_FRAMES,
  COLORS,
  ENEMY,
  EVENTS,
  GAME_STATE,
} from '../utils/constants';

export class GameScene extends Phaser.Scene {
  private dungeon!: DungeonGenerator;
  private player!: Player;
  private enemies!: EnemySystem[];
  private xpSystem!: XPSystem;
  private combatSystem!: CombatSystem;
  private gameState!: string;
  private turnManager!: TurnManager;

  // Frame de chão sorteado para esta sessão
  private floorFrame!: number;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameState = GAME_STATE.PLAYING;

    // Sortear frame de chão aleatório para esta sessão
    const variants = DAWNLIKE_FRAMES.FLOOR_VARIANTS;
    this.floorFrame = variants[Math.floor(Math.random() * variants.length)];

    this._initSystems();
    this._renderDungeon();
    this._createEnemySprites();
    this._spawnPlatino();
    this._setupCamera();
    this._setupInput();
    this._registerEvents();

    this.scene.launch('UIScene');
    this._emitInitialUIState();
  }

  update(_time: number, _delta: number): void {
    if (this.gameState !== GAME_STATE.PLAYING) return;
    this._handleInput(_time);
  }

  // ─── Inicialização ───────────────────────────────────────────────────────

  private _initSystems(): void {
    const emitter = this.events;

    this.dungeon = new DungeonGenerator();
    this.dungeon.generate();

    this.xpSystem     = new XPSystem(emitter);
    this.player       = new Player(this, this.dungeon.startPos.x, this.dungeon.startPos.y);
    this.enemies      = createEnemies(this.dungeon, ENEMY.COUNT, this.dungeon.startPos);
    this.combatSystem = new CombatSystem(emitter, this.xpSystem);
    this.turnManager  = new TurnManager();
  }

  private _emitInitialUIState(): void {
    const p = this.player;
    EventBus.emit(EVENTS.PLAYER_HP_CHANGED,   { hp: p.hp,   maxHp: p.maxHp });
    EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: p.mana, maxMana: p.maxMana });
    EventBus.emit(EVENTS.PLAYER_XP_CHANGED,   { xp: p.xp, xpNext: this.xpSystem.getXPToNextLevel(p.level) });
    EventBus.emit(EVENTS.PLAYER_LEVELED_UP,   { level: p.level, maxHp: p.maxHp, attack: p.attack });
  }

  // ─── Renderização: tiles Dawnlike ────────────────────────────────────────

  private _renderDungeon(): void {
    const { width, height, grid } = this.dungeon;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isFloor = grid[y][x] === TILE.FLOOR;
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;

        this.add
          .image(px, py, isFloor ? SPRITES.FLOOR : SPRITES.WALL, isFloor ? this.floorFrame : DAWNLIKE_FRAMES.WALL)
          .setDepth(0);
      }
    }
  }

  // ─── Sprites de Inimigos ─────────────────────────────────────────────────

  private _createEnemySprites(): void {
    this.enemies.forEach((enemy) => {
      const pos = enemy.getPixelPos();

      enemy.sprite = this.add
        .sprite(pos.x, pos.y, SPRITES.ENEMY, DAWNLIKE_FRAMES.ENEMY)
        .setDepth(5);

      enemy.hpBarBg = this.add
        .rectangle(pos.x, pos.y - TILE_SIZE / 2 - 2, TILE_SIZE, 3, 0x330000)
        .setDepth(6);

      enemy.hpBar = this.add
        .rectangle(pos.x, pos.y - TILE_SIZE / 2 - 2, TILE_SIZE, 3, 0xff2222)
        .setDepth(6);
    });
  }

  // ─── Easter Egg: Platino (DragonDePlatino, CC-BY 4.0) ───────────────────

  private _spawnPlatino(): void {
    const lastRoom = this.dungeon.rooms[this.dungeon.rooms.length - 1];
    const px = (lastRoom.x + lastRoom.width - 2) * TILE_SIZE + TILE_SIZE / 2;
    const py = (lastRoom.y + lastRoom.height - 2) * TILE_SIZE + TILE_SIZE / 2;

    this.add.sprite(px, py, SPRITES.PLATINO, DAWNLIKE_FRAMES.PLATINO).setDepth(4).setAlpha(0.55);
    this.add
      .text(px, py + TILE_SIZE + 2, '© DragonDePlatino\nCC-BY 4.0', {
        fontSize: '6px', color: '#aaaaaa', fontFamily: 'monospace', align: 'center',
      })
      .setOrigin(0.5, 0).setDepth(4).setAlpha(0.55);
  }

  // ─── Câmera ──────────────────────────────────────────────────────────────

  private _setupCamera(): void {
    const mapW = this.dungeon.width  * TILE_SIZE;
    const mapH = this.dungeon.height * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
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
  }

  private _handleInput(_time: number): void {
    if (!this.turnManager.isPlayerTurn()) return;

    const JD = Phaser.Input.Keyboard.JustDown;
    let dx = 0;
    let dy = 0;

    if      (JD(this.cursors.up)    || JD(this.wasd.up))    dy = -1;
    else if (JD(this.cursors.down)  || JD(this.wasd.down))  dy =  1;
    else if (JD(this.cursors.left)  || JD(this.wasd.left))  dx = -1;
    else if (JD(this.cursors.right) || JD(this.wasd.right)) dx =  1;

    const isWait = JD(this.spaceKey);
    if (dx === 0 && dy === 0 && !isWait) return;

    const tx = this.player.gridX + dx;
    const ty = this.player.gridY + dy;
    const targetEnemy = !isWait && this.enemies.find(
      (e) => e.alive && e.gridX === tx && e.gridY === ty,
    );

    const action = isWait
      ? { type: 'WAIT' as const }
      : targetEnemy
        ? { type: 'ATTACK' as const, target: targetEnemy }
        : { type: 'MOVE' as const, dx, dy };

    const result = this.turnManager.processPlayerAction(
      action,
      this.player,
      this.enemies,
      this.dungeon,
      this.combatSystem,
    );

    result.messages.forEach((msg) => EventBus.emit(EVENTS.UI_LOG, msg));

    // Sincronizar sprites após o turno completo
    this.enemies.forEach((e) => this._syncEnemySprite(e));

    result.enemiesDied.forEach((e) => {
      EventBus.emit(EVENTS.UI_LOG, `+${e.xpReward} XP`);
      this._removeEnemySprite(e);
    });

    if (result.playerDied) {
      this.events.emit(EVENTS.PLAYER_DIED);
    }
  }

  private _removeEnemySprite(enemy: EnemySystem): void {
    enemy.sprite?.destroy();
    enemy.hpBarBg?.destroy();
    enemy.hpBar?.destroy();
    enemy.sprite   = null;
    enemy.hpBar    = null;
    enemy.hpBarBg  = null;
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
      .setDepth(20)
      .setOrigin(0.5);

    this.tweens.add({
      targets: text, y: pos.y - 30, alpha: 0, duration: 800, ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  // ─── Eventos ─────────────────────────────────────────────────────────────

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
  }
}
