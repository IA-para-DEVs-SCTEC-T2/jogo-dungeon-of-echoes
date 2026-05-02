import * as Phaser from 'phaser';

interface GameOverData {
  level: number;
  xp: number;
}

export class GameOverScene extends Phaser.Scene {
  private playerData!: GameOverData;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.playerData = data ?? { level: 1, xp: 0 };
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.add.rectangle(cx, cy, width, height, 0x000000, 0.85);

    this.add.text(cx, cy - 80, 'GAME OVER', {
      fontSize: '36px', color: '#ff4444', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, `Nível atingido: ${this.playerData.level}`, {
      fontSize: '20px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 15, `XP total: ${this.playerData.xp}`, {
      fontSize: '20px', color: '#ffdd00', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const btn = this.add.text(cx, cy + 70, '[ Jogar Novamente ]', {
      fontSize: '22px', color: '#00ff88', fontFamily: 'monospace',
      backgroundColor: '#003322', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#00ff88'));
    btn.on('pointerdown', () => this._restart());

    this.input.keyboard!.once('keydown-ENTER', () => this._restart());
    this.input.keyboard!.once('keydown-SPACE', () => this._restart());
  }

  private _restart(): void {
    // scene.start() já para a cena atual automaticamente.
    // Chamar stop() antes causava double-stop e corrompia o estado do Phaser.
    this.scene.start('GameScene');
  }
}
