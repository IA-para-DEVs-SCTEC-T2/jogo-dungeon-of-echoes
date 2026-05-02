import * as Phaser from 'phaser';
import { DungeonGenerator } from '../generators/DungeonGenerator';
import { Player } from '../entities/Player';
import { EnemySystem, createEnemies } from '../systems/EnemySystem';
import { CombatSystem } from '../systems/CombatSystem';
import { XPSystem } from '../systems/XPSystem';
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

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;

  private hudHP!: Phaser.GameObjects.Text;
  private hudXP!: Phaser.GameObjects.Text;
  private hudLevel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameState = GAME_STATE.PLAYING;

    this._initSystems();
    this._renderDungeon();
    this._createEnemySprites();
    this._spawnPlatino();     // Easter egg obrigatório (CC-BY)
    this._setupCamera();
    this._setupInput();
    this._createHUD();
    this._registerEvents();
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

    this.xpSystem = new XPSystem(emitter);

    // Player é agora um Sprite diretamente
    this.player = new Player(this, this.dungeon.startPos.x, this.dungeon.startPos.y);

    this.enemies = createEnemies(this.dungeon, ENEMY.COUNT, this.dungeon.startPos);

    this.combatSystem = new CombatSystem(emitter, this.xpSystem);
  }

  // ─── Renderização: tiles Dawnlike ────────────────────────────────────────

  private _renderDungeon(): void {
    const { width, height, grid } = this.dungeon;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isFloor = grid[y][x] === TILE.FLOOR;
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;

        if (isFloor) {
          this.add
            .image(px, py, SPRITES.FLOOR, DAWNLIKE_FRAMES.FLOOR)
            .setDepth(0);
        } else {
          this.add
            .image(px, py, SPRITES.WALL, DAWNLIKE_FRAMES.WALL)
            .setDepth(0);
        }
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

      // Barra de HP
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
    // Platino aparece no último quarto da última sala — escondido mas descobrível
    const lastRoom = this.dungeon.rooms[this.dungeon.rooms.length - 1];
    const px = (lastRoom.x + lastRoom.width - 2) * TILE_SIZE + TILE_SIZE / 2;
    const py = (lastRoom.y + lastRoom.height - 2) * TILE_SIZE + TILE_SIZE / 2;

    // Sprite com alpha reduzido — oculto mas presente
    this.add
      .sprite(px, py, SPRITES.PLATINO, DAWNLIKE_FRAMES.PLATINO)
      .setDepth(4)
      .setAlpha(0.55);

    // Crédito mínimo exigido pela CC-BY 4.0
    this.add
      .text(px, py + TILE_SIZE + 2, '© DragonDePlatino\nCC-BY 4.0', {
        fontSize: '6px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
        align: 'center',
      })
      .setOrigin(0.5, 0)
      .setDepth(4)
      .setAlpha(0.55);
  }

  // ─── Câmera ──────────────────────────────────────────────────────────────

  private _setupCamera(): void {
    const mapWidth = this.dungeon.width * TILE_SIZE;
    const mapHeight = this.dungeon.height * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Zoom 2× para melhor visualização dos tiles 16×16
    this.cameras.main.setZoom(2);
  }

  // ─── Input ───────────────────────────────────────────────────────────────

  private _setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
  }

  private _handleInput(time: number): void {
    const JD = Phaser.Input.Keyboard.JustDown;
    let dx = 0;
    let dy = 0;

    if (JD(this.cursors.up) || JD(this.wasd.up))         dy = -1;
    else if (JD(this.cursors.down) || JD(this.wasd.down)) dy = 1;
    else if (JD(this.cursors.left) || JD(this.wasd.left)) dx = -1;
    else if (JD(this.cursors.right) || JD(this.wasd.right)) dx = 1;

    if (dx === 0 && dy === 0) return;

    const result = this.player.tryMove(dx, dy, this.dungeon, this.enemies, time);

    if (result.moved) {
      this._updateHUD();
    } else if (result.enemy) {
      this._resolveCombat(result.enemy as EnemySystem);
    }
  }

  // ─── Combate ─────────────────────────────────────────────────────────────

  private _resolveCombat(enemy: EnemySystem): void {
    const result = this.combatSystem.resolve(this.player, enemy);
    if (!result) return;

    if (result.playerDamage > 0) {
      this._showDamageText(enemy.getPixelPos(), result.playerDamage, COLORS.DAMAGE_TEXT);
    }
    if (result.enemyDamage > 0) {
      this._showDamageText(this.player.getPixelPos(), result.enemyDamage, '#ff8800');
    }
    if (result.enemyDied) {
      this._removeEnemySprite(enemy);
    }

    this._updateHUD();
  }

  private _removeEnemySprite(enemy: EnemySystem): void {
    enemy.sprite?.destroy();
    enemy.hpBarBg?.destroy();
    enemy.hpBar?.destroy();
  }

  private _syncEnemySprite(enemy: EnemySystem): void {
    if (!enemy.sprite || !enemy.alive) return;
    const pos = enemy.getPixelPos();
    enemy.sprite.setPosition(pos.x, pos.y);

    const hpRatio = enemy.hp / enemy.maxHp;
    const barWidth = TILE_SIZE * hpRatio;
    enemy.hpBar?.setSize(barWidth, 3).setPosition(pos.x - TILE_SIZE / 2 + barWidth / 2, pos.y - TILE_SIZE / 2 - 2);
    enemy.hpBarBg?.setPosition(pos.x, pos.y - TILE_SIZE / 2 - 2);
  }

  // ─── Feedback Visual ─────────────────────────────────────────────────────

  private _showDamageText(pos: { x: number; y: number }, damage: number | string, color: string): void {
    const text = this.add
      .text(pos.x, pos.y - 8, `-${damage}`, {
        fontSize: '8px',
        color,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setDepth(20)
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: pos.y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────

  private _createHUD(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '8px',
      color: COLORS.HUD_TEXT,
      fontFamily: 'monospace',
      backgroundColor: '#00000099',
      padding: { x: 4, y: 2 },
    };

    this.add
      .rectangle(0, 0, 130, 50, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.hudHP = this.add.text(4, 4, '', style).setScrollFactor(0).setDepth(101);
    this.hudXP = this.add.text(4, 18, '', style).setScrollFactor(0).setDepth(101);
    this.hudLevel = this.add.text(4, 32, '', style).setScrollFactor(0).setDepth(101);

    this._updateHUD();
  }

  private _updateHUD(): void {
    const p = this.player;
    const xpNext = this.xpSystem.getXPToNextLevel(p.level);
    this.hudHP.setText(`HP: ${p.hp}/${p.maxHp}`);
    this.hudXP.setText(`XP: ${p.xp}/${xpNext}`);
    this.hudLevel.setText(`Nv: ${p.level}  ATK: ${p.attack}`);
  }

  // ─── Eventos ─────────────────────────────────────────────────────────────

  private _registerEvents(): void {
    this.events.on(EVENTS.PLAYER_DIED, () => {
      this.gameState = GAME_STATE.GAME_OVER;
      this.cameras.main.flash(500, 255, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.start('GameOverScene', { level: this.player.level, xp: this.player.xp });
      });
    });

    this.events.on(EVENTS.PLAYER_LEVELED_UP, (data: { level: number }) => {
      this._showDamageText(this.player.getPixelPos(), `NÍVEL ${data.level}!`, COLORS.LEVEL_UP_TEXT);
      this._updateHUD();
    });
  }
}
