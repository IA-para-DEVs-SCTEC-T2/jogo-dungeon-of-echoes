/**
 * main.js — Entry point do jogo
 * Inicializa o Phaser 3 com as cenas e configurações globais.
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { DUNGEON, TILE_SIZE } from './config/constants.js';

// Dimensões do canvas baseadas no tamanho da dungeon
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const config = {
  type: Phaser.AUTO,           // WebGL se disponível, Canvas como fallback
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: '#1a1a2e', // Fundo escuro fora do mapa
  parent: 'game-container',   // div no index.html

  // Escala responsiva
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Cenas registradas (ordem importa: primeira é iniciada automaticamente)
  scene: [BootScene, GameScene, GameOverScene],
};

// Inicializar o jogo
const game = new Phaser.Game(config);

// Exportar para debug no console do navegador (opcional)
export default game;
