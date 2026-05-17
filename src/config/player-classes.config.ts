import type { EquipmentSlotId } from '../types/equipment';

export type PlayerClass = 'base' | 'guerreiro' | 'arqueiro' | 'mago';

export interface PlayerClassDef {
  id: PlayerClass;
  label: string;
  description: string;
  frame: number;

  /** Bônus de stats aplicados uma vez na criação do personagem */
  statBonus: { str?: number; dex?: number; intel?: number; con?: number; wis?: number };
  /** Ganho de stat por nível (além do crescimento padrão) */
  statGrowthPerLevel: { str?: number; dex?: number; intel?: number; con?: number; wis?: number };

  // ── Combate ────────────────────────────────────────────────────────────────
  attackType: 'melee' | 'ranged' | 'magic';
  /** Alcance de ataque em tiles (1 = corpo a corpo) */
  attackRange: number;
  /** Multiplicador de dano físico recebido (< 1 = mais resistente, > 1 = mais frágil) */
  physicalDamageReceived: number;
  /** Cooldown de movimento em ms */
  moveCooldownMs: number;
  /** Permite ataques corpo a corpo */
  canMelee: boolean;

  // ── Equipamentos ───────────────────────────────────────────────────────────
  /** Slots de equipamento proibidos para esta classe */
  forbiddenSlots: EquipmentSlotId[];

  // ── Loot / economia ────────────────────────────────────────────────────────
  /** Multiplicador sobre a chance de drop (> 1 = mais drops) */
  luckMultiplier: number;
  /** Chance adicional de dropar um segundo item [0–1] */
  extraDropChance: number;

  // ── Flechas (Arqueiro) ─────────────────────────────────────────────────────
  usesArrows: boolean;
  startingArrows: number;
  /** Multiplicador de dano em ataques corpo a corpo (padrão 1.0) */
  meleeDamageMultiplier?: number;
  /** Multiplicador de dano em ataques à distância (padrão 1.0) */
  rangedDamageMultiplier?: number;

  // ── Magias ─────────────────────────────────────────────────────────────────
  /** Multiplicador no custo de mana das magias (< 1 = mais barato) */
  manaCostMultiplier: number;
  /** Mana regenerada por turno */
  manaRegenPerTurn: number;
  /** IDs de magias exclusivas desta classe (outras classes não desbloqueiam) */
  exclusiveSpells: string[];
  /** Número máximo de slots de magia equipados (padrão 2; Mago tem 4) */
  maxSpellSlots: number;

  // ── IA inimiga ─────────────────────────────────────────────────────────────
  /**
   * Bias de aproximação dos inimigos [0–1].
   * 0 = comportamento normal; 1 = inimigos sempre perseguem ativamente.
   */
  enemyApproachBias: number;
}

export const PLAYER_CLASSES: PlayerClassDef[] = [
  {
    id: 'base',
    label: 'Aventureiro',
    description: 'Equilibrado. Bom começo para qualquer caminho.',
    frame: 24,
    statBonus: {},
    statGrowthPerLevel: {},
    attackType: 'melee',
    attackRange: 1,
    physicalDamageReceived: 1.0,
    moveCooldownMs: 150,
    canMelee: true,
    forbiddenSlots: [],
    luckMultiplier: 1.4,
    extraDropChance: 0.15,
    usesArrows: false,
    startingArrows: 0,
    manaCostMultiplier: 1.0,
    manaRegenPerTurn: 0,
    exclusiveSpells: [],
    maxSpellSlots: 2,
    enemyApproachBias: 0,
  },
  {
    id: 'guerreiro',
    label: 'Guerreiro',
    description: '+3 FOR, +2 CON. Tanque corpo a corpo.',
    frame: 25,
    statBonus: { str: 3, con: 2, wis: -3, int: -2 },
    statGrowthPerLevel: { str: 1, con: 1 },
    attackType: 'melee',
    attackRange: 1,
    physicalDamageReceived: 0.70,
    moveCooldownMs: 210,
    canMelee: true,
    forbiddenSlots: [],
    luckMultiplier: 1.0,
    extraDropChance: 0.0,
    usesArrows: false,
    startingArrows: 0,
    manaCostMultiplier: 1.3,
    manaRegenPerTurn: 0,
    exclusiveSpells: [],
    maxSpellSlots: 2,
    enemyApproachBias: 0,
  },
  {
    id: 'arqueiro',
    label: 'Arqueiro',
    description: '+3 DES. Críticos frequentes e ataques à distância.',
    frame: 26,
    statBonus: { dex: 3 },
    statGrowthPerLevel: { dex: 1 },
    attackType: 'ranged',
    attackRange: 4,
    physicalDamageReceived: 1.30,
    moveCooldownMs: 130,
    canMelee: true,
    forbiddenSlots: ['sword', 'shield'],
    luckMultiplier: 1.0,
    extraDropChance: 0.0,
    usesArrows: true,
    startingArrows: 100,
    meleeDamageMultiplier: 0.5,
    rangedDamageMultiplier: 1.3,
    manaCostMultiplier: 1.0,
    manaRegenPerTurn: 0,
    exclusiveSpells: [],
    maxSpellSlots: 2,
    enemyApproachBias: 1.0,
  },
  {
    id: 'mago',
    label: 'Mago',
    description: '+4 INT, +2 SAB. Poder mágico elevado.',
    frame: 31,
    statBonus: { intel: 5, wis: 3, con: -3 },
    statGrowthPerLevel: { intel: 1, wis: 1 },
    attackType: 'magic',
    attackRange: 1,
    physicalDamageReceived: 1.60,
    moveCooldownMs: 150,
    canMelee: false,
    forbiddenSlots: ['sword', 'shield'],
    luckMultiplier: 1.0,
    extraDropChance: 0.0,
    usesArrows: false,
    startingArrows: 0,
    manaCostMultiplier: 0.65,
    manaRegenPerTurn: 3,
    exclusiveSpells: ['ice_bolt', 'great_fire'],
    maxSpellSlots: 4,
    enemyApproachBias: 0.8,
  },
];
