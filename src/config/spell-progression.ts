// Tabela data-driven: key = nível mínimo para desbloquear as magias listadas
export const SPELL_PROGRESSION: Record<number, string[]> = {
  1:  ['fire_bolt', 'minor_healing'],
  5:  ['ice_shard'],
  10: ['wind_cyclone'],
  15: ['fire_explosion'],
  20: ['blizzard'],
};
