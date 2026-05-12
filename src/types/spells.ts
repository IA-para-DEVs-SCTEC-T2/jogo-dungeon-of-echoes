export type SpellElement = 'fire' | 'ice' | 'wind' | 'arcane';
export type Direction    = 'up' | 'down' | 'left' | 'right';

export interface SpellDef {
  id: string;
  name: string;
  element: SpellElement;
  damage: number;
  manaCost: number;
  cooldownMs: number;
  projectileSpeed: number;
  animKey: string;
  impactAnimKey: string;
  minLevel: number;
  description: string;
}

export interface SpellSlotState {
  spellId: string | null;
  lastCastMs: number;
  cooldownMs: number;
}
