/**
 * GameScene.js — Cena principal do jogo
 * Spec: specs/gameloop.spec.md
 *
 * Integra todos os sistemas: Dungeon, Player, Enemy, Combat, XP.
 * Gerencia renderização, input, HUD e transições de estado.
 */

import { DungeonSystem } from '../systems/DungeonSystem.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import { EnemySystem, createEnemies } from '../systems/EnemySystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { XPSystem } from '../systems/XPSystem.js';
import {
  TILE_SIZE,
  TILE,
  COLORS,
  ENEMY,
  EVENTS,
  GAME_STATE,
} from '../config/constants.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ─── Ciclo de Vida Phaser ────────────────────────────────────────────────

  create() {
    // Estado do jogo
    this.gameState = GAME_STATE.PLAYING;

    // Inicializar sistemas
    this._initSystems();

    // Renderizar dungeon
    this._renderDungeon();

    // Criar sprites de inimigos
    this._createEnemySprites();

    // Criar sprite do player
    this._createPlayerSprite();

    // Configurar câmera (Spec R7: câmera segue o player)
    this._setupCamera();

    // Configurar input de teclado
    this._setupInput();

    // Criar HUD (fixo na câmera)
    this._createHUD();

    // Registrar listeners de eventos
    this._registerEvents();
  }

  update(time) {
    // Spec R1: input só processado no estado PLAYING
    if (this.gameState !== GAME_STATE.PLAYING) return;

    this._handleInput(time);
  }

  // ─── Inicialização ───────────────────────────────────────────────────────

  _initSystems() {
    // EventEmitter compartilhado (usa o da própria cena)
    const emitter = this.events;

    // Dungeon
    this.dungeon = new DungeonSystem();
    this.dungeon.generate();

    // XP (precisa existir antes do Combat)
    this.xpSystem = new XPSystem(emitter);

    // Player
    this.player = new PlayerSystem(emitter);
    this.player.reset(this.dungeon.startPos.x, this.dungeon.startPos.y);

    // Inimigos
    this.enemies = createEnemies(this.dungeon, ENEMY.COUNT, this.dungeon.startPos);

    // Combat
    this.combatSystem = new CombatSystem(emitter, this.xpSystem);
  }

  // ─── Renderização da Dungeon ─────────────────────────────────────────────

  _renderDungeon() {
    // Grupo de tiles para organização
    this.tileGroup = this.add.group();

    const { width, height, grid } = this.dungeon;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isFloor = grid[y][x] === TILE.FLOOR;
        const color = isFloor ? COLORS.FLOOR : COLORS.WALL;

        const rect = this.add.rectangle(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE - 1, // -1 cria borda visual entre tiles
          TILE_SIZE - 1,
          color
        );

        this.tileGroup.add(rect);
      }
    }
  }

  // ─── Sprites de Inimigos ─────────────────────────────────────────────────

  _createEnemySprites() {
    this.enemies.forEach((enemy) => {
      const pos = enemy.getPixelPos();

      // Sprite do inimigo (círculo vermelho)
      enemy.sprite = this.add.rectangle(
        pos.x, pos.y,
        TILE_SIZE - 6, TILE_SIZE - 6,
        COLORS.ENEMY
      );

      // Barra de HP do inimigo (pequena, acima do sprite)
      enemy.hpBarBg = this.add.rectangle(
        pos.x, pos.y - TILE_SIZE / 2 + 3,
        TILE_SIZE - 4, 4,
        0x330000
      );
      enemy.hpBar = this.add.rectangle(
        pos.x, pos.y - TILE_SIZE / 2 + 3,
        TILE_SIZE - 4, 4,
        0xff0000
      );
    });
  }

  // ─── Sprite do Player ────────────────────────────────────────────────────

  _createPlayerSprite() {
    const pos = this.player.getPixelPos();

    // Sprite do player (quadrado azul)
    this.playerSprite = this.add.rectangle(
      pos.x, pos.y,
      TILE_SIZE - 4, TILE_SIZE - 4,
      COLORS.PLAYER
    );

    // Profundidade maior para ficar sobre os tiles
    this.playerSprite.setDepth(10);
  }

  // ─── Câmera ──────────────────────────────────────────────────────────────

  _setupCamera() {
    const mapWidth = this.dungeon.width * TILE_SIZE;
    const mapHeight = this.dungeon.height * TILE_SIZE;

    // Define os limites do mundo
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Câmera segue o sprite do player
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
  }

  // ─── Input ───────────────────────────────────────────────────────────────

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  _handleInput(time) {
    let dx = 0;
    let dy = 0;

    // Detectar direção pressionada (Spec: WASD ou setas)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
      dy = -1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
      dy = 1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
      dx = -1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
      dx = 1;
    }

    if (dx === 0 && dy === 0) return;

    // Tentar mover o player
    const result = this.player.tryMove(dx, dy, this.dungeon, this.enemies, time);

    if (result.moved) {
      // Atualizar posição do sprite
      this._syncPlayerSprite();
      this._updateHUD();
    } else if (result.enemy) {
      // Combate!
      this._resolveCombat(result.enemy);
    }
  }

  // ─── Combate ─────────────────────────────────────────────────────────────

  _resolveCombat(enemy) {
    const result = this.combatSystem.resolve(this.player, enemy);
    if (!result) return;

    // Feedback visual de dano no inimigo
    if (result.playerDamage > 0) {
      this._showDamageText(enemy.getPixelPos(), result.playerDamage, COLORS.DAMAGE_TEXT);
    }

    // Feedback visual de dano no player
    if (result.enemyDamage > 0) {
      this._showDamageText(this.player.getPixelPos(), result.enemyDamage, '#ff8800');
    }

    // Inimigo morreu
    if (result.enemyDied) {
      this._removeEnemySprite(enemy);
    }

    // Atualizar HUD após combate
    this._updateHUD();
  }

  _removeEnemySprite(enemy) {
    if (enemy.sprite) enemy.sprite.destroy();
    if (enemy.hpBarBg) enemy.hpBarBg.destroy();
    if (enemy.hpBar) enemy.hpBar.destroy();
  }

  // ─── Feedback Visual ─────────────────────────────────────────────────────

  /**
   * Exibe texto de dano flutuante.
   * Spec combat.spec.md R7: visível por 800ms
   */
  _showDamageText(pos, damage, color = '#ff4444') {
    const text = this.add
      .text(pos.x, pos.y - 10, `-${damage}`, {
        fontSize: '14px',
        color: color,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setDepth(20)
      .setOrigin(0.5);

    // Animação: sobe e desaparece em 800ms
    this.tweens.add({
      targets: text,
      y: pos.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  // ─── Sincronização de Sprites ────────────────────────────────────────────

  _syncPlayerSprite() {
    const pos = this.player.getPixelPos();
    this.playerSprite.setPosition(pos.x, pos.y);
  }

  _syncEnemySprite(enemy) {
    if (!enemy.sprite) return;
    const pos = enemy.getPixelPos();
    enemy.sprite.setPosition(pos.x, pos.y);

    // Atualizar barra de HP
    const hpRatio = enemy.hp / enemy.maxHp;
    const barWidth = (TILE_SIZE - 4) * hpRatio;
    enemy.hpBar.setPosition(pos.x - (TILE_SIZE - 4) / 2 + barWidth / 2, pos.y - TILE_SIZE / 2 + 3);
    enemy.hpBar.setSize(barWidth, 4);
    enemy.hpBarBg.setPosition(pos.x, pos.y - TILE_SIZE / 2 + 3);
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────

  _createHUD() {
    // HUD fixo na câmera (setScrollFactor(0))
    const style = {
      fontSize: '14px',
      color: COLORS.HUD_TEXT,
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 4 },
    };

    // Fundo do HUD
    this.hudBg = this.add
      .rectangle(0, 0, 220, 80, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100);

    // Textos do HUD
    this.hudHP = this.add
      .text(8, 8, '', style)
      .setScrollFactor(0)
      .setDepth(101);

    this.hudXP = this.add
      .text(8, 30, '', style)
      .setScrollFactor(0)
      .setDepth(101);

    this.hudLevel = this.add
      .text(8, 52, '', style)
      .setScrollFactor(0)
      .setDepth(101);

    // Instrução de controles
    this.add
      .text(8, this.scale.height - 24, 'WASD / Setas: mover  |  Combate: automático ao colidir', {
        fontSize: '11px',
        color: '#888888',
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(101);

    this._updateHUD();
  }

  _updateHUD() {
    const p = this.player;
    const xpNext = this.xpSystem.getXPToNextLevel(p.level);

    this.hudHP.setText(`❤ HP: ${p.hp} / ${p.maxHp}`);
    this.hudXP.setText(`✦ XP: ${p.xp} / ${xpNext}`);
    this.hudLevel.setText(`★ Nível: ${p.level}  ⚔ ATK: ${p.attack}`);
  }

  // ─── Eventos ─────────────────────────────────────────────────────────────

  _registerEvents() {
    // Player morreu → Game Over
    this.events.on(EVENTS.PLAYER_DIED, () => {
      this.gameState = GAME_STATE.GAME_OVER;
      this._triggerGameOver();
    });

    // Level up → feedback visual
    this.events.on(EVENTS.PLAYER_LEVELED_UP, (data) => {
      const pos = this.player.getPixelPos();
      this._showDamageText(pos, `NÍVEL ${data.level}!`, COLORS.LEVEL_UP_TEXT);
      this._updateHUD();
    });

    // Inimigo morreu → atualizar barra HP (já removida, mas garantia)
    this.events.on(EVENTS.ENEMY_DIED, (enemy) => {
      this._syncEnemySprite(enemy);
    });
  }

  _triggerGameOver() {
    // Flash vermelho na tela
    this.cameras.main.flash(500, 255, 0, 0);

    this.time.delayedCall(600, () => {
      this.scene.start('GameOverScene', {
        level: this.player.level,
        xp: this.player.xp,
      });
    });
  }
}
