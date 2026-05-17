import type { SpellDef } from '../types/spells';

export const SPELLS_DB: Record<string, SpellDef> = {
  minor_healing: {
    id: 'minor_healing', name: 'Minor Healing', element: 'arcane',
    damage: 0, heal: 20, manaCost: 8, cooldownMs: 1500, projectileSpeed: 0,
    animKey: 'spell_wind_fly', impactAnimKey: 'spell_wind_impact',
    minLevel: 1,
    description: 'Canaliza energia arcana para recuperar 20 de vida.',
  },
  fire_bolt: {
    id: 'fire_bolt', name: 'Fire Bolt', element: 'fire',
    damage: 15, manaCost: 6, cooldownMs: 800, projectileSpeed: 3,
    animKey: 'spell_fire_fly', impactAnimKey: 'spell_fire_impact',
    minLevel: 1,
    description: 'Um raio de fogo que abrasa o alvo.',
  },
  ice_bolt: {
    id: 'ice_bolt', name: 'Ice Bolt', element: 'ice',
    damage: 12, manaCost: 4, cooldownMs: 900, projectileSpeed: 3,
    animKey: 'spell_ice_fly', impactAnimKey: 'spell_ice_impact',
    minLevel: 1,
    description: 'Dispara um projétil de gelo que retarda o inimigo.',
  },
  ice_shard: {
    id: 'ice_shard', name: 'Ice Shard', element: 'ice',
    damage: 20, manaCost: 10, cooldownMs: 1100, projectileSpeed: 2.5,
    animKey: 'spell_ice_fly', impactAnimKey: 'spell_ice_impact',
    minLevel: 5,
    description: 'Um fragmento de gelo perfura o inimigo.',
  },
  wind_cyclone: {
    id: 'wind_cyclone', name: 'Wind Cyclone', element: 'wind',
    damage: 18, manaCost: 8, cooldownMs: 950, projectileSpeed: 4,
    animKey: 'spell_wind_fly', impactAnimKey: 'spell_wind_impact',
    minLevel: 10,
    description: 'Um ciclone de vento que avança rapidamente.',
  },
  fire_explosion: {
    id: 'fire_explosion', name: 'Fire Explosion', element: 'fire',
    damage: 35, manaCost: 18, cooldownMs: 2000, projectileSpeed: 2,
    animKey: 'spell_fire_fly', impactAnimKey: 'spell_fire_impact',
    minLevel: 15,
    description: 'Explosão de fogo que causa dano massivo.',
  },
  blizzard: {
    id: 'blizzard', name: 'Blizzard', element: 'ice',
    damage: 45, manaCost: 24, cooldownMs: 2500, projectileSpeed: 1.8,
    animKey: 'spell_ice_fly', impactAnimKey: 'spell_ice_impact',
    minLevel: 20,
    description: 'Tempestade de gelo devastadora.',
  },
};
