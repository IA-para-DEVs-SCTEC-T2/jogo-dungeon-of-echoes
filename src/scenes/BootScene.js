/**
 * BootScene.js — Cena de inicialização
 * Spec: specs/gameloop.spec.md — Cenas Phaser
 *
 * Responsabilidade: exibir tela de loading e iniciar a GameScene.
 * No MVP sem assets externos, apenas exibe texto e avança.
 */

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // No MVP usamos formas geométricas — sem assets para carregar.
    // Aqui entrariam: this.load.image(), this.load.tilemapTiledJSON(), etc.
  }

  create() {
    const { width, height } = this.scale;

    // Tela de loading simples
    this.add
      .text(width / 2, height / 2 - 20, 'Dungeon of Echoes', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, 'Carregando...', {
        fontSize: '16px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Avança para a GameScene após breve delay
    this.time.delayedCall(800, () => {
      this.scene.start('GameScene');
    });
  }
}
