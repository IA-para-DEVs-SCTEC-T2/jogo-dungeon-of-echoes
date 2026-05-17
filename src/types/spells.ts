export type SpellElement = 'fire' | 'ice' | 'wind' | 'arcane';
export type Direction    = 'up' | 'down' | 'left' | 'right';

export type SpellAreaType = 'adjacent' | 'line' | 'radial';

export interface SpellDef {
  id: string;
  name: string;
  element: SpellElement;
  damage: number;
  heal?: number;        // se > 0, cura o player em vez de atacar
  manaCost: number;
  cooldownMs: number;
  projectileSpeed: number;
  animKey: string;
  impactAnimKey: string;
  minLevel: number;
  description: string;
  range?: number;       // alcance em tiles (padrão: 1)
  areaType?: SpellAreaType; // tipo de área (padrão: 'adjacent')
}

export interface SpellSlotState {
  spellId: string | null;
  lastCastMs: number;
  cooldownMs: number;
}
