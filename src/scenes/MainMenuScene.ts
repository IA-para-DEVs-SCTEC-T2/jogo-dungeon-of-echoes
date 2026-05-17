import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  private _selectedIndex = 0;
  private _buttons: { text: Phaser.GameObjects.Text; action: () => void }[] = [];
  private _upKey!:        Phaser.Input.Keyboard.Key;
  private _downKey!:      Phaser.Input.Keyboard.Key;
  private _enterKey!:     Phaser.Input.Keyboard.Key;
  private _spaceKey!:     Phaser.Input.Keyboard.Key;
  private _transitioning = false;

  create(): void {
    const { width, height } = this.scale;
    this._selectedIndex = 0;
    this._buttons = [];

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
      this.scene.start('CharacterSelectScene');
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

    this._upKey    = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this._downKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this._enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this._spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this._transitioning = false;
    this._updateSelection();

    this.events.once('shutdown', () => {
      this.input.removeAllListeners();
      this.input.keyboard?.clearCaptures();
    });
  }

  update(): void {
    if (this._transitioning) return;
    const JD = Phaser.Input.Keyboard.JustDown;
    if (JD(this._upKey)) {
      this._selectedIndex = (this._selectedIndex - 1 + this._buttons.length) % this._buttons.length;
      this._updateSelection();
    } else if (JD(this._downKey)) {
      this._selectedIndex = (this._selectedIndex + 1) % this._buttons.length;
      this._updateSelection();
    } else if (JD(this._enterKey) || JD(this._spaceKey)) {
      this._buttons[this._selectedIndex]?.action();
    }
  }

  private _updateSelection(): void {
    this._buttons.forEach(({ text }, i) => {
      text.setStyle({ color: i === this._selectedIndex ? '#ffd700' : '#ffffff' });
    });
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

    btn.on('pointerover', () => {
      this._selectedIndex = this._buttons.findIndex(b => b.text === btn);
      this._updateSelection();
    });
    btn.on('pointerout', () => this._updateSelection());
    btn.on('pointerdown', () => {
      if (!this._transitioning) {
        this._transitioning = true;
        onClick();
      }
    });

    this._buttons.push({ text: btn, action: onClick });
  }
}
