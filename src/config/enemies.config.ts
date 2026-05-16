// Créditos: DragonDePlatino — Dawnlike 16×16 (CC-BY 4.0)
// Catálogo data-driven de inimigos. Para adicionar um novo inimigo, basta
// inserir uma entrada em ENEMY_DEFS. Sistemas centrais (spawn, animação,
// scaling) lêem automaticamente este arquivo.

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Categoria que determina qual par de spritesheets DawnLike é usado
 * e em quais andares o inimigo pode aparecer.
 *
 * Spritesheet: {Categoria}0.png / {Categoria}1.png
 */
export type EnemyCategory =
  | 'pest'
  | 'misc'
  | 'reptile'
  | 'undead'
  | 'humanoid'
  | 'demon';

/** Raridade que determina o peso na seleção procedural. */
export type EnemyRarity = 'common' | 'uncommon' | 'rare';

// ─── Pesos de Raridade ────────────────────────────────────────────────────────
// Valores maiores = aparece mais frequentemente no pool aleatório.

export const RARITY_WEIGHTS: Readonly<Record<EnemyRarity, number>> = {
  common:   100,
  uncommon:  40,
  rare:      10,
};

// ─── Definição de Inimigo ─────────────────────────────────────────────────────

export interface EnemyDef {
  /**
   * Identificador único e imutável.
   * Não renomear após criação — pode ser referenciado por sistemas de loot,
   * eventos narrativos e saves futuros.
   */
  readonly id: string;

  /** Categoria que define o par de spritesheets DawnLike. */
  readonly category: EnemyCategory;

  /**
   * Índice do frame no spritesheet (mesmo índice em *0.png e *1.png).
   * Os spritesheets DawnLike têm 8 colunas: linha N começa no frame N*8.
   */
  readonly frameIndex: number;

  /** Nome de exibição padrão. Pode ser sobrescrito por AIIntegration em elites. */
  readonly name: string;

  /** HP base, antes dos multiplicadores de dificuldade e elite. */
  readonly hpBase: number;

  /** Dano base, antes dos multiplicadores de dificuldade e elite. */
  readonly damageBase: number;

  /** XP base, antes do multiplicador de andar. */
  readonly xpBase: number;

  /** Raridade usada na seleção ponderada. */
  readonly rarity: EnemyRarity;

  /** Andar mínimo de spawn (inclusivo). */
  readonly dungeonMin: number;

  /** Andar máximo de spawn (inclusivo). Use 99 para sem limite prático. */
  readonly dungeonMax: number;

  // ── Extensões futuras (opcionais, não usadas ainda) ───────────────────────
  /** Texto de lore para bosses, elites ou UI futura. */
  readonly description?: string;
  // resistances?: ElementalType[];
  // skills?: SkillId[];
  // lootTableId?: string;
  // faction?: FactionId;
  // elementalType?: ElementalType;
  // isBoss?: boolean;
  // isEliteVariant?: boolean;
}

// ─── Catálogo de Inimigos ─────────────────────────────────────────────────────
// frameIndex segue o padrão DawnLike de 8 colunas: linha 0 = frame 0, linha 1 = frame 8, etc.
// Os valores de hpBase/damageBase são multiplicados pelos scalers de difficulty.config.ts.

export const ENEMY_DEFS: readonly EnemyDef[] = [
  // ── PEST (Andares 1–2) ────────────────────────────────────────────────────
  {
    id:          'rat',
    category:    'pest',
    frameIndex:  0,
    name:        'Rato Feroz',
    hpBase:      18,
    damageBase:  4,
    xpBase:      15,
    rarity:      'common',
    dungeonMin:  1,
    dungeonMax:  2,
    description: 'Um rato faminto que habita os corredores mais rasos.',
  },
  {
    id:          'spider',
    category:    'pest',
    frameIndex:  8,
    name:        'Aranha Venenosa',
    hpBase:      22,
    damageBase:  5,
    xpBase:      18,
    rarity:      'common',
    dungeonMin:  1,
    dungeonMax:  2,
    description: 'Sua mordida deixa rastros de veneno lento.',
  },
  {
    id:          'centipede',
    category:    'pest',
    frameIndex:  16,
    name:        'Centopeia Gigante',
    hpBase:      20,
    damageBase:  6,
    xpBase:      20,
    rarity:      'uncommon',
    dungeonMin:  1,
    dungeonMax:  2,
  },

  // ── MISC (Andares 1–2) ────────────────────────────────────────────────────
  {
    id:          'slime',
    category:    'misc',
    frameIndex:  0,
    name:        'Gosma',
    hpBase:      25,
    damageBase:  4,
    xpBase:      16,
    rarity:      'common',
    dungeonMin:  1,
    dungeonMax:  2,
    description: 'Criatura amorfa sem intelecto, mas persistente.',
  },
  {
    id:          'mushroom_stalker',
    category:    'misc',
    frameIndex:  8,
    name:        'Cogumelo Ambulante',
    hpBase:      20,
    damageBase:  5,
    xpBase:      17,
    rarity:      'uncommon',
    dungeonMin:  1,
    dungeonMax:  2,
  },

  // ── REPTILE (Andares 1–2) ─────────────────────────────────────────────────
  {
    id:          'lizard',
    category:    'reptile',
    frameIndex:  0,
    name:        'Lagarto das Pedras',
    hpBase:      28,
    damageBase:  7,
    xpBase:      22,
    rarity:      'common',
    dungeonMin:  1,
    dungeonMax:  2,
  },
  {
    id:          'serpent',
    category:    'reptile',
    frameIndex:  8,
    name:        'Serpente das Ruínas',
    hpBase:      26,
    damageBase:  8,
    xpBase:      24,
    rarity:      'uncommon',
    dungeonMin:  1,
    dungeonMax:  2,
    description: 'Cobra rápida que se esconde entre pedras.',
  },

  // ── UNDEAD (Andares 3–4) ──────────────────────────────────────────────────
  {
    id:          'skeleton',
    category:    'undead',
    frameIndex:  0,
    name:        'Esqueleto',
    hpBase:      35,
    damageBase:  10,
    xpBase:      30,
    rarity:      'common',
    dungeonMin:  3,
    dungeonMax:  4,
    description: 'Ossos reanimados por magia antiga.',
  },
  {
    id:          'zombie',
    category:    'undead',
    frameIndex:  8,
    name:        'Zumbi',
    hpBase:      45,
    damageBase:  9,
    xpBase:      32,
    rarity:      'common',
    dungeonMin:  3,
    dungeonMax:  4,
  },
  {
    id:          'ghost',
    category:    'undead',
    frameIndex:  16,
    name:        'Fantasma Sombrio',
    hpBase:      30,
    damageBase:  12,
    xpBase:      40,
    rarity:      'rare',
    dungeonMin:  3,
    dungeonMax:  4,
    description: 'Espírito errante aprisionado nestas câmaras.',
  },

  // ── HUMANOID (Andares 5+) ─────────────────────────────────────────────────
  {
    id:          'goblin',
    category:    'humanoid',
    frameIndex:  0,
    name:        'Goblin',
    hpBase:      50,
    damageBase:  13,
    xpBase:      45,
    rarity:      'common',
    dungeonMin:  5,
    dungeonMax:  99,
  },
  {
    id:          'orc',
    category:    'humanoid',
    frameIndex:  8,
    name:        'Orc Guerreiro',
    hpBase:      65,
    damageBase:  15,
    xpBase:      55,
    rarity:      'uncommon',
    dungeonMin:  5,
    dungeonMax:  99,
    description: 'Grande e violento, resistência elevada.',
  },
  {
    id:          'dark_elf',
    category:    'humanoid',
    frameIndex:  16,
    name:        'Elfo das Sombras',
    hpBase:      55,
    damageBase:  17,
    xpBase:      60,
    rarity:      'rare',
    dungeonMin:  5,
    dungeonMax:  99,
  },

  // ── DEMON (Andares 5+) ────────────────────────────────────────────────────
  {
    id:          'imp',
    category:    'demon',
    frameIndex:  0,
    name:        'Imp',
    hpBase:      60,
    damageBase:  16,
    xpBase:      58,
    rarity:      'common',
    dungeonMin:  5,
    dungeonMax:  99,
  },
  {
    id:          'demon_lord',
    category:    'demon',
    frameIndex:  8,
    name:        'Senhor Demônio',
    hpBase:      80,
    damageBase:  20,
    xpBase:      80,
    rarity:      'rare',
    dungeonMin:  6,
    dungeonMax:  99,
    description: 'Uma presença antiga que exala poder corrompido.',
  },
] as const;

// ─── Distribuição por Andar ───────────────────────────────────────────────────

interface FloorCategoryRule {
  readonly minFloor: number;
  readonly maxFloor: number;
  readonly categories: readonly EnemyCategory[];
}

const FLOOR_CATEGORY_RULES: readonly FloorCategoryRule[] = [
  { minFloor: 1, maxFloor: 2, categories: ['pest', 'misc', 'reptile'] },
  { minFloor: 3, maxFloor: 4, categories: ['undead'] },
  { minFloor: 5, maxFloor: 99, categories: ['humanoid', 'demon'] },
];

// ─── Chaves de Textura por Categoria ─────────────────────────────────────────
// DawnLike usa pares: {Categoria}0.png (frame base) e {Categoria}1.png (frame alternativo).
// Nota: Undead0.png é carregado como 'undead' (SPRITES.ENEMY) por compatibilidade legada.

export const CATEGORY_TEXTURE_KEYS: Readonly<Record<EnemyCategory, readonly [string, string]>> = {
  pest:     ['pest0',     'pest1'],
  misc:     ['misc0',     'misc1'],
  reptile:  ['reptile0',  'reptile1'],
  undead:   ['undead',    'undead1'],   // 'undead' é o alias legado de Undead0.png
  humanoid: ['humanoid0', 'humanoid1'],
  demon:    ['demon0',    'demon1'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Seleção aleatória ponderada.
 * Items com peso maior têm proporcionalmente mais chance de ser selecionados.
 */
export function weightedRandom<T>(items: readonly T[], getWeight: (item: T) => number): T {
  if (items.length === 0) throw new Error('[EnemyConfig] weightedRandom: lista vazia.');

  const total = items.reduce((sum, item) => sum + getWeight(item), 0);
  let roll = Math.random() * total;

  for (const item of items) {
    roll -= getWeight(item);
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}

/**
 * Retorna as categorias de inimigos permitidas para o andar.
 * Emite aviso em DEV se nenhuma regra cobrir o andar (não deve ocorrer).
 */
export function getAllowedCategories(floor: number): readonly EnemyCategory[] {
  const rule = FLOOR_CATEGORY_RULES.find(r => floor >= r.minFloor && floor <= r.maxFloor);
  if (!rule) {
    if (import.meta.env.DEV) {
      console.warn(`[EnemyConfig] Sem regra de categoria para andar ${floor}. Usando 'pest'.`);
    }
    return ['pest'];
  }
  return rule.categories;
}

/**
 * Seleciona proceduralmente um EnemyDef válido para o andar.
 *
 * Respeita:
 * - Categorias permitidas para o andar (FLOOR_CATEGORY_RULES)
 * - Faixa dungeonMin / dungeonMax do inimigo
 * - Raridade ponderada (RARITY_WEIGHTS)
 *
 * Fallbacks em cascata (logs apenas em DEV):
 *   1. Pool ideal:    categoria correta + dentro da faixa
 *   2. Pool relaxado: qualquer inimigo dentro da faixa
 *   3. Pool global:   primeiro inimigo definido (never happens in normal play)
 */
export function pickEnemyDef(floor: number): EnemyDef {
  const allowedCategories = getAllowedCategories(floor);

  // Pool ideal
  let pool: readonly EnemyDef[] = ENEMY_DEFS.filter(
    def => allowedCategories.includes(def.category)
        && floor >= def.dungeonMin
        && floor <= def.dungeonMax,
  );

  if (pool.length === 0) {
    if (import.meta.env.DEV) {
      console.warn(
        `[EnemyConfig] Pool vazio para andar ${floor} com categorias [${allowedCategories.join(', ')}].`
        + ' Usando fallback de faixa.',
      );
    }
    // Fallback relaxado: qualquer inimigo dentro da faixa de andar
    pool = ENEMY_DEFS.filter(def => floor >= def.dungeonMin && floor <= def.dungeonMax);
  }

  if (pool.length === 0) {
    if (import.meta.env.DEV) {
      console.warn(`[EnemyConfig] Pool completamente vazio para andar ${floor}. Usando primeiro inimigo.`);
    }
    return ENEMY_DEFS[0] as EnemyDef;
  }

  return weightedRandom(pool, def => RARITY_WEIGHTS[def.rarity]);
}

/**
 * Gera a chave de animação Phaser para um inimigo.
 *
 * Formato: `enemy.{category}.{variant}.{frameIndex}`
 *
 * Exemplos:
 *   enemy.pest.idle.0
 *   enemy.undead.idle.16
 *   enemy.demon.walk.8     (quando variantes adicionais forem implementadas)
 *
 * O segmento `variant` reserva extensão futura: idle | walk | attack | death | hit.
 */
export function buildAnimKey(category: EnemyCategory, frameIndex: number, variant = 'idle'): string {
  return `enemy.${category}.${variant}.${frameIndex}`;
}
