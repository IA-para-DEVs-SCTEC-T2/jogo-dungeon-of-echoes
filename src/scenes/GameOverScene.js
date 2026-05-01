import * as Phaser from 'phaser';

/**
 * GameOverScene.js — Tela de Game Over
 * Spec: specs/gameloop.spec.md — Cenário 2 e 3
 *
 * Exibe XP total e nível atingido.
 * Botão "Jogar Novamente" reinicia a GameScene.
 */

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  /**
   * Recebe dados do player via scene.start('GameOverScene', data)
   */
  init(data) {
    this.playerData = data || { level: 1, xp: 0 };
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Fundo escuro semi-transparente
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.85);

    // Título
    this.add
      .text(cx, cy - 80, '☠ GAME OVER ☠', {
        fontSize: '36px',
        color: '#ff4444',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Stats do player
    this.add
      .text(cx, cy - 20, `Nível atingido: ${this.playerData.level}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 15, `XP total: ${this.playerData.xp}`, {
        fontSize: '20px',
        color: '#ffdd00',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Botão "Jogar Novamente"
    const btn = this.add
      .text(cx, cy + 70, '[ Jogar Novamente ]', {
        fontSize: '22px',
        color: '#00ff88',
        fontFamily: 'monospace',
        backgroundColor: '#003322',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover visual
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#00ff88'));

    // Reiniciar jogo — Spec R6: nova dungeon, player resetado
    btn.on('pointerdown', () => {
      this.scene.stop('GameOverScene');
      this.scene.start('GameScene');
    });

    // Também aceita tecla Enter/Espaço para reiniciar
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.stop('GameOverScene');
      this.scene.start('GameScene');
    });
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.stop('GameOverScene');
      this.scene.start('GameScene');
    });
  }
}
