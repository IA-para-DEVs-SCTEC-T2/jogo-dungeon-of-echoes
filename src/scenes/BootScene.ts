import * as Phaser from 'phaser';
import { SPRITES } from '../utils/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const base = 'assets/dawnlike';

    // Tiles de terreno (16×16 por frame)
    this.load.spritesheet(SPRITES.FLOOR, `${base}/Objects/Ground0.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet(SPRITES.WALL, `${base}/Objects/Wall.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Sprites de personagens (16×16 por frame)
    this.load.spritesheet(SPRITES.PLAYER, `${base}/Characters/Player0.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet(SPRITES.ENEMY, `${base}/Characters/Undead0.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Itens — poções (Dawnlike Items/Potion.png, 8×5 frames de 16×16)
    this.load.spritesheet(SPRITES.POTION, `${base}/Items/Potion.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Itens — dinheiro (Dawnlike Items/Money.png, 8×8 frames de 16×16)
    this.load.spritesheet(SPRITES.MONEY, `${base}/Items/Money.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Easter egg — Platino (DragonDePlatino, CC-BY 4.0)
    this.load.spritesheet(SPRITES.PLATINO, `${base}/Characters/Reptile0.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Barra de progresso
    this._setupLoadingBar();
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'Dungeon of Echoes', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.time.delayedCall(200, () => {
      this.scene.start('GameScene');
    });
  }

  private _setupLoadingBar(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2 + 60;

    const bg = this.add.rectangle(cx, cy, 300, 16, 0x222222).setOrigin(0.5);
    const bar = this.add.rectangle(cx - 150, cy, 0, 14, 0x00aaff).setOrigin(0, 0.5);

    this.add
      .text(cx, cy - 24, 'Carregando assets...', {
        fontSize: '13px',
        color: '#888888',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.setSize(298 * value, 14);
    });

    this.load.on('complete', () => {
      bg.destroy();
      bar.destroy();
    });
  }
}
