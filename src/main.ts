import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',

  // Pixel art: desativa anti-aliasing das texturas (obrigatório para Dawnlike)
  pixelArt: true,
  roundPixels: true,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Arcade Physics — habilitado conforme escopo da Fase 1
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },

  scene: [BootScene, GameScene, UIScene, GameOverScene],
};

const game = new Phaser.Game(config);

export default game;
