// --- Tile ---
export const TILE_SIZE = 16; // pixels por tile (Dawnlike 16×16)

// --- Tipos de Tile ---
export const TILE = {
  WALL: 0,
  FLOOR: 1,
} as const;

// --- Dungeon ---
export const DUNGEON = {
  WIDTH: 40,
  HEIGHT: 40,
  ROOM_COUNT: 8,
  ROOM_MIN_W: 4,
  ROOM_MIN_H: 4,
  ROOM_MAX_W: 10,
  ROOM_MAX_H: 8,
};

// --- Player ---
export const PLAYER = {
  HP: 100,
  ATTACK: 10,
  MOVE_COOLDOWN: 150,
};

// --- Enemy ---
export const ENEMY = {
  HP: 30,
  ATTACK: 8,
  XP_REWARD: 25,
  COUNT: 6,
  DETECTION_RADIUS: 8,
};

// --- XP ---
export const XP = {
  PER_LEVEL: 100,
  HP_BONUS: 20,
  ATTACK_BONUS: 5,
};

// --- Dawnlike frame indices ---
// Ajuste os valores abaixo conforme o layout real dos spritesheets
export const DAWNLIKE_FRAMES = {
  FLOOR: 3,    // Ground0.png — pedra cinza
  WALL: 3,     // Wall0.png   — parede de pedra
  PLAYER: 24,  // Player0.png — personagem de frente (idle)
  ENEMY: 0,    // Undead0.png — esqueleto (frame 0)
  PLATINO: 0,  // Reptiles0.png — lagartixa do DragonDePlatino (easter egg)
};

// --- Chaves dos spritesheets carregados na BootScene ---
export const SPRITES = {
  FLOOR: 'ground',
  WALL: 'wall',
  PLAYER: 'player',
  ENEMY: 'undead',
  PLATINO: 'reptiles',
} as const;

// --- Cores de fallback (usadas se assets não carregarem) ---
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

// --- Atributos Base do Player ---
export const BASE_STATS = {
  STR: 10,
  INT: 10,
  DEX: 10,
  CON: 18,  // CON=18 → maxHp inicial = 18×5 + 1×3 = 93 (próximo do balanço original)
  WIS: 10,
  CHA: 10,
};

// --- Estados do Jogo ---
export const GAME_STATE = {
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
} as const;

// --- Eventos ---
export const EVENTS = {
  PLAYER_MOVED: 'player-moved',
  PLAYER_ATTACKED: 'player-attacked',
  PLAYER_DIED: 'player-died',
  PLAYER_LEVELED_UP: 'player-leveled-up',
  PLAYER_HP_CHANGED: 'player-hp-changed',
  PLAYER_MANA_CHANGED: 'player-mana-changed',
  PLAYER_XP_CHANGED: 'player-xp-changed',
  ENEMY_DIED: 'enemy-died',
  ENEMY_ATTACKED: 'enemy-attacked',
  COMBAT_HIT: 'combat-hit',
  UI_LOG: 'ui-log',
} as const;
