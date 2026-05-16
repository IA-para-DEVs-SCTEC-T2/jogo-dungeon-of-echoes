import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.image(width / 2, height / 2, 'game_bg');
    bg.setDisplaySize(width, height);

    this.add.text(width / 2, height * 0.25, 'Dungeon of Echoes', {
      fontSize: '36px',
      color: '#ffd700',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this._makeButton(width / 2, height * 0.50, 'Novo Jogo', () => {
      this.scene.start('GameScene');
    });

    this._makeButton(width / 2, height * 0.62, 'Créditos', () => {
      this.scene.start('CreditsScene');
    });

    this.add.text(width - 12, height - 12, `Equipe 7\nv${__APP_VERSION__}`, {
      fontSize: '13px',
      color: '#cccccc',
      fontFamily: 'monospace',
      align: 'right',
    }).setOrigin(1, 1);
  }

  private _makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#333355',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#ffd700' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown', onClick);
  }
}
