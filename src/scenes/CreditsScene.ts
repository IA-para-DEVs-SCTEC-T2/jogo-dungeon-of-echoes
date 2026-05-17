import * as Phaser from 'phaser';

const CREDITS: Array<{ role: string; names: string[] }> = [
  { role: 'Bardo',     names: ['Vitor'] },
  { role: 'Magos',    names: ['Gianmarco', 'Paolo'] },
  { role: 'Paladinos', names: ['Andrea', 'Rafael'] },
];

export class CreditsScene extends Phaser.Scene {
  private _escKey!: Phaser.Input.Keyboard.Key;
  private _transitioning = false;

  constructor() {
    super({ key: 'CreditsScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.image(width / 2, height / 2, 'game_bg');
    bg.setDisplaySize(width, height).setAlpha(0.5);

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);

    this.add.text(width / 2, 60, 'Créditos', {
      fontSize: '32px',
      color: '#ffd700',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    let y = 160;
    for (const entry of CREDITS) {
      this.add.text(width / 2, y, entry.role, {
        fontSize: '16px',
        color: '#aaaaff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
      y += 28;

      for (const name of entry.names) {
        this.add.text(width / 2, y, name, {
          fontSize: '20px',
          color: '#ffffff',
          fontFamily: 'monospace',
        }).setOrigin(0.5);
        y += 30;
      }
      y += 10;
    }

    const btn = this.add.text(width / 2, height - 60, '← Voltar', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#333355',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#ffd700' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown', () => {
      if (!this._transitioning) {
        this._transitioning = true;
        this.scene.start('MainMenuScene');
      }
    });

    this._transitioning = false;
    this._escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.events.once('shutdown', () => {
      this.input.removeAllListeners();
      this.input.keyboard?.clearCaptures();
    });
  }

  update(): void {
    if (this._transitioning) return;
    if (Phaser.Input.Keyboard.JustDown(this._escKey)) {
      this._transitioning = true;
      this.scene.start('MainMenuScene');
    }
  }
}
