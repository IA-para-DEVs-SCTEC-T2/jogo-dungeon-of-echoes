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
export const DAWNLIKE_FRAMES = {
  // Grupos de frames de chão do Ground0.png (8 colunas × 7 linhas = 56 frames)
  // Cada grupo representa um tipo de terreno visualmente distinto.
  // Layout: linha 0 = pedra, linha 1 = terra, linha 2 = grama, etc.
  FLOOR_VARIANTS: [
    0,   // pedra cinza clara
    1,   // pedra cinza média
    2,   // pedra escura
    3,   // pedra azulada
    8,   // terra marrom clara
    9,   // terra marrom média
    10,  // terra avermelhada
    16,  // grama verde
    17,  // grama escura
    24,  // areia / deserto
    25,  // areia escura
    32,  // lama / pântano
    40,  // neve / gelo
    48,  // rocha vulcânica
  ],
  FLOOR: 3,           // fallback — pedra cinza
  WALL: 3,            // Wall.png — parede de pedra
  PLAYER: 24,         // Player0.png — personagem de frente (frame fixo)
  ENEMY: 0,           // Undead0.png — esqueleto (frame fixo)
  PLATINO: 0,         // Reptiles0.png — lagartixa do DragonDePlatino (easter egg)
  POTION_HEAL: 0,     // Potion.png — frasco vermelho (poção de cura)
  POTION_MANA: 7,     // Potion.png — frasco azul (poção de mana)
  GOLD: 0,            // Money.png — moeda de ouro (frame fixo)
};

// --- Chaves dos spritesheets carregados na BootScene ---
export const SPRITES = {
  FLOOR: 'ground',
  WALL: 'wall',
  PLAYER: 'player',
  ENEMY: 'undead',
  PLATINO: 'reptiles',
  POTION: 'potion',
  MONEY: 'money',
  // Cidade
  TREE0:      'tree0',
  DECOR0:     'decor0',
  HUMANOID0:  'humanoid0',
  CAT0:       'cat0',
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

// --- Inventário ---
export const INVENTORY = {
  MAX_SLOTS: 20,
  POTION_HEAL_LIGHT_AMOUNT:  10,
  POTION_HEAL_AMOUNT:        25,
  POTION_HEAL_HIGH_AMOUNT:   50,
  POTION_MANA_LIGHT_AMOUNT:  15,
  POTION_MANA_AMOUNT:        30,
  POTION_MANA_HIGH_AMOUNT:   60,
  ITEM_SPAWN_MIN: 1,
  ITEM_SPAWN_MAX: 3,
};

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
  DAMAGE_PLAYER: 'damage-player',
  DAMAGE_ENEMY: 'damage-enemy',
  UI_LOG: 'ui-log',
  ITEM_PICKED_UP: 'item-picked-up',
  ITEM_USED: 'item-used',
  ITEM_DROPPED: 'item-dropped',
  AREA_CHANGED: 'area-changed',
  // Transições de mapa
  MAP_TRANSITION_STARTED:    'map-transition-started',
  MAP_TRANSITION_COMPLETED:  'map-transition-completed',
  // Andares de dungeon
  FLOOR_CHANGED:  'floor-changed',
  FLOOR_DESCEND:  'floor-descend',
  FLOOR_ASCEND:   'floor-ascend',
  // Inventário e equipamentos
  INVENTORY_OPENED:           'inventory-opened',
  INVENTORY_CLOSED:           'inventory-closed',
  INVENTORY_STATE_REQUESTED:  'inventory-state-requested',
  INVENTORY_STATE_RESPONSE:   'inventory-state-response',
  ITEM_EQUIPPED:    'item-equipped',
  ITEM_UNEQUIPPED:  'item-unequipped',
  // Input
  INPUT_MODE_CHANGED: 'input-mode-changed',
  // Seleção de inventário
  INVENTORY_SELECTION_CHANGED: 'inventory-selection-changed',
  INVENTORY_ITEM_CLICKED: 'inventory-item-clicked',
  // Moedas
  PLAYER_GOLD_CHANGED: 'player-gold-changed',
  // Loja
  SHOP_OPENED:  'shop-opened',
  SHOP_CLOSED:  'shop-closed',
  SHOP_UPDATED: 'shop-updated',
  SHOP_ITEM_HOVERED:      'shop-item-hovered',
  SHOP_ITEM_SELECTED:     'shop-item-selected',
  // Diálogo
  DIALOG_OPENED:          'dialog-opened',
  DIALOG_CLOSED:          'dialog-closed',
  DIALOG_OPTION_SELECTED: 'dialog-option-selected',
  // Pontos de atributo
  STAT_POINT_SPENT_REQUEST: 'stat-point-spent-request',
  STAT_POINT_SPENT:         'stat-point-spent',
  // Magias
  SPELL_UNLOCKED:        'spell-unlocked',
  SPELL_EQUIPPED:        'spell-equipped',
  SPELL_CAST:            'spell-cast',
  // Painel I — abas
  INVENTORY_TAB_CHANGED: 'inventory-tab-changed',
  // Status
  STATUS_STATE_REQUESTED: 'status-state-requested',
  STATUS_STATE_RESPONSE:  'status-state-response',
  // Magias
  SPELLS_STATE_REQUESTED:   'spells-state-requested',
  SPELLS_STATE_RESPONSE:    'spells-state-response',
  SPELL_EQUIP_REQUEST:      'spell-equip-request',
  SPELLS_SELECTION_CHANGED: 'spells-selection-changed',
} as const;

// --- Loja ---
export const SHOP = {
  SELL_RATIO: 0.4,
} as const;

// --- Taverna ---
export const TAVERN = { REST_COST: 20 } as const;

// --- Cidade (hub) ---
export const TOWN = {
  WIDTH:            30,   // TMX(20) + 2×padding(5) = 30
  HEIGHT:           25,   // TMX(15) + 2×padding(5) = 25
  START_X:          12,   // pad(5) + tmx_start(7)
  START_Y:          14,   // pad(5) + tmx_start(9)
  EXIT_X:           12,   // mantido para compatibilidade
  EXIT_Y:           19,
  FLOOR_FRAME:      16,  // grama verde do Ground0.png
  STONE_PATH_FRAME: 1,   // pedra cinza do Ground0.png (caminho central)
  BONUS_ENTRY_X:    12,  // TMX(7,-5) + pad = game(12,0)
  BONUS_ENTRY_Y:    0,
} as const;


// --- Loot ---
export const LOOT = {
  CHANCE_NOTHING:  0.40,
  CHANCE_HEAL:     0.30,  // acumulado: 0–0.30
  CHANCE_POISON:   0.20,  // acumulado: 0.30–0.50
  CHANCE_GOLD:     0.10,  // acumulado: 0.50–0.60
} as const;

// --- UI ---
export const UI = {
  LOG_PANEL_WIDTH_FRACTION: 0.33,
  LOG_VISIBLE_LINES: 12,
  LOG_MAX_HISTORY: 50,
  LOG_BG_COLOR: 0x0a0a1a,
  LOG_BORDER_COLOR: 0x4444aa,
  LOG_ALPHA: 0.75,
} as const;

// --- IA Generativa ---
export const AI = {
  // Triggers para geração de conteúdo
  ITEM_RARITY_THRESHOLD: 0.8,  // Apenas itens raros/épicos (>80% de raridade) ganham descrição IA
  ENEMY_ELITE_CHANCE: 0.15,     // 15% de chance de spawnar inimigo elite com variante IA
  EVENT_SPECIAL_TILE: 2,        // Tile especial que triggera evento narrativo (pode ser expandido)
  
  // Cache e performance
  CACHE_MAX_SIZE: 100,          // Máximo de entradas no cache
  REQUEST_TIMEOUT: 5000,        // Timeout de 5s para chamadas LLM
} as const;

// ─── Configurações de desenvolvimento ────────────────────────────────────────
export const DEV_CONFIG = {
  godMode: false,  // true → player não toma dano
};
