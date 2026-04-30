/**
 * constants.js — Configurações globais do jogo
 * Todas as "magic numbers" ficam aqui para fácil ajuste.
 */

// --- Tile ---
export const TILE_SIZE = 32; // pixels por tile

// --- Tipos de Tile ---
export const TILE = {
  WALL: 0,
  FLOOR: 1,
};

// --- Dungeon ---
export const DUNGEON = {
  WIDTH: 40,        // tiles horizontais
  HEIGHT: 30,       // tiles verticais
  ROOM_COUNT: 8,    // tentativas de salas
  ROOM_MIN_W: 4,
  ROOM_MIN_H: 4,
  ROOM_MAX_W: 10,
  ROOM_MAX_H: 8,
};

// --- Player ---
export const PLAYER = {
  HP: 100,
  ATTACK: 10,
  MOVE_COOLDOWN: 150, // ms entre movimentos (evita movimento muito rápido)
};

// --- Enemy ---
export const ENEMY = {
  HP: 30,
  ATTACK: 8,
  XP_REWARD: 25,
  COUNT: 6, // quantidade de inimigos por dungeon
};

// --- XP ---
export const XP = {
  PER_LEVEL: 100,   // xpToNextLevel = level * XP_PER_LEVEL
  HP_BONUS: 20,     // maxHp ganho por level up
  ATTACK_BONUS: 5,  // attack ganho por level up
};

// --- Cores (para renderização sem sprites) ---
export const COLORS = {
  WALL: 0x444444,
  FLOOR: 0x888888,
  PLAYER: 0x00aaff,
  ENEMY: 0xff4444,
  HUD_BG: 0x000000,
  HUD_TEXT: '#ffffff',
  DAMAGE_TEXT: '#ff4444',
  XP_TEXT: '#ffdd00',
  LEVEL_UP_TEXT: '#00ff88',
};

// --- Estados do Jogo ---
export const GAME_STATE = {
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

// --- Eventos (nomes centralizados para evitar typos) ---
export const EVENTS = {
  PLAYER_MOVED: 'player-moved',
  PLAYER_ATTACKED: 'player-attacked',
  PLAYER_DIED: 'player-died',
  PLAYER_LEVELED_UP: 'player-leveled-up',
  ENEMY_DIED: 'enemy-died',
  ENEMY_ATTACKED: 'enemy-attacked',
  COMBAT_HIT: 'combat-hit',
};
