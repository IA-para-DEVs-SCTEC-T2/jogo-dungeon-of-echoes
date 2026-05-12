import { Item, ItemType } from '../entities/Item';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';

// Tabela de loot por andar
// Chances acumuladas: nada | poção | ouro
// Pocão é rara; ouro é mais comum e escala com o andar.
const LOOT_TABLE: Array<{ nothing: number; potion: number; gold: number }> = [
  { nothing: 0.72, potion: 0.08, gold: 0.20 }, // andar 1
  { nothing: 0.70, potion: 0.08, gold: 0.22 }, // andar 2
  { nothing: 0.68, potion: 0.07, gold: 0.25 }, // andar 3
  { nothing: 0.66, potion: 0.07, gold: 0.27 }, // andar 4
  { nothing: 0.64, potion: 0.06, gold: 0.30 }, // andar 5+
];

function getTable(floor: number) {
  return LOOT_TABLE[Math.min(floor, LOOT_TABLE.length) - 1];
}

type HealTier = 'potion_heal_light' | 'potion_heal' | 'potion_heal_high';
type ManaTier  = 'potion_mana_light' | 'potion_mana' | 'potion_mana_high';

function pickHealTier(floor: number): HealTier {
  const r = Math.random();
  if (floor <= 2) return r < 0.70 ? 'potion_heal_light' : 'potion_heal';
  if (floor <= 4) return r < 0.35 ? 'potion_heal_light' : r < 0.80 ? 'potion_heal' : 'potion_heal_high';
  return r < 0.15 ? 'potion_heal_light' : r < 0.55 ? 'potion_heal' : 'potion_heal_high';
}

function pickManaTier(floor: number): ManaTier {
  const r = Math.random();
  if (floor <= 2) return r < 0.70 ? 'potion_mana_light' : 'potion_mana';
  if (floor <= 4) return r < 0.35 ? 'potion_mana_light' : r < 0.80 ? 'potion_mana' : 'potion_mana_high';
  return r < 0.15 ? 'potion_mana_light' : r < 0.55 ? 'potion_mana' : 'potion_mana_high';
}

// Ouro: valor base escala com o andar (±30% de variação)
function pickGoldAmount(floor: number): number {
  const base = 3 + floor * 4;          // andar 1=7, 2=11, 3=15, 4=19, 5=23...
  const variance = Math.floor(base * 0.3);
  return base + Math.floor(Math.random() * (variance * 2 + 1)) - variance;
}

/**
 * LootSystem — decide e emite drops de inimigos.
 * Puro: sem dependência de Phaser. A Scene cria o sprite ao receber ITEM_DROPPED.
 */
export class LootSystem {
  private _nextId = 0;

  /**
   * Roda a tabela de loot para a posição dada e emite ITEM_DROPPED se sortear item.
   * @param floor - Andar atual; influencia chances e tier das recompensas.
   * @returns O item dropado, ou null se não dropar nada.
   */
  roll(gridX: number, gridY: number, floor = 1): Item | null {
    const t = getTable(floor);
    const r = Math.random();

    let type: ItemType | null = null;
    let goldAmount: number | undefined;

    if (r < t.nothing) {
      return null;
    } else if (r < t.nothing + t.potion) {
      type = Math.random() < 0.5 ? pickHealTier(floor) : pickManaTier(floor);
    } else {
      type = 'gold';
      goldAmount = pickGoldAmount(floor);
    }

    const item = new Item(`loot_${this._nextId++}`, type, gridX, gridY);
    if (goldAmount !== undefined) item.goldAmount = goldAmount;
    EventBus.emit(EVENTS.ITEM_DROPPED, { item });
    return item;
  }
}
