import { Item, ItemType } from '../entities/Item';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import { ClassRulesEngine } from './ClassRulesEngine';
import type { PlayerClassDef } from '../config/player-classes.config';

// Tabela de loot por andar — ouro é a recompensa principal e deve ser frequente.
const LOOT_TABLE: Array<{ nothing: number; potion: number; gold: number }> = [
  { nothing: 0.50, potion: 0.08, gold: 0.42 }, // andar 1
  { nothing: 0.47, potion: 0.08, gold: 0.45 }, // andar 2
  { nothing: 0.44, potion: 0.07, gold: 0.49 }, // andar 3
  { nothing: 0.41, potion: 0.07, gold: 0.52 }, // andar 4
  { nothing: 0.38, potion: 0.06, gold: 0.56 }, // andar 5+
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

// Ouro: base maior e escala mais agressiva com o andar (±30% de variação)
function pickGoldAmount(floor: number, elite = false): number {
  const base = 5 + floor * 6;
  const variance = Math.floor(base * 0.3);
  const amount = base + Math.floor(Math.random() * (variance * 2 + 1)) - variance;
  return elite ? Math.floor(amount * 1.8) : amount;
}

function rollOne(gridX: number, gridY: number, floor: number, elite: boolean, id: number): { item: Item | null; nextId: number } {
  const t = getTable(floor);
  const r = elite ? 1 : Math.random();

  let type: ItemType | null = null;
  let goldAmount: number | undefined;

  if (r < t.nothing) {
    return { item: null, nextId: id };
  } else if (r < t.nothing + t.potion) {
    type = Math.random() < 0.5 ? pickHealTier(floor) : pickManaTier(floor);
  } else {
    type = 'gold';
    goldAmount = pickGoldAmount(floor, elite);
  }

  const item = new Item(`loot_${id}`, type, gridX, gridY);
  if (goldAmount !== undefined) item.goldAmount = goldAmount;
  return { item, nextId: id + 1 };
}

/**
 * LootSystem — decide e emite drops de inimigos.
 * Puro: sem dependência de Phaser. A Scene cria o sprite ao receber ITEM_DROPPED.
 */
export class LootSystem {
  private _nextId = 0;

  /**
   * Roda a tabela de loot para a posição dada e emite ITEM_DROPPED se sortear item.
   * classDef opcional aplica luckMultiplier e extraDropChance do Aventureiro.
   */
  roll(gridX: number, gridY: number, floor = 1, elite = false, classDef?: PlayerClassDef): Item | null {
    const luck   = classDef ? ClassRulesEngine.luckMultiplier(classDef) : 1.0;
    const extra  = classDef ? ClassRulesEngine.extraDropChance(classDef) : 0.0;

    // Luck modifica a chance de "nada" — reduz proporcionalmente
    const t = getTable(floor);
    const adjustedNothing = elite ? 0 : Math.max(0, t.nothing / luck);
    const r = elite ? 1 : Math.random();
    const effectiveR = r < adjustedNothing ? 0 : r; // forçar drop se sorte reduziu threshold

    const { item, nextId } = rollOne(gridX, gridY, floor, elite, this._nextId);
    this._nextId = nextId;

    // Re-roll com ajuste de sorte: usar effectiveR reaproveitado ou rolar de novo
    let primary: Item | null;
    if (r < adjustedNothing) {
      primary = null;
    } else {
      void effectiveR; // usamos o item já rolado
      primary = item;
    }

    if (primary) EventBus.emit(EVENTS.ITEM_DROPPED, { item: primary });

    // Chance de drop extra (Aventureiro)
    if (extra > 0 && Math.random() < extra) {
      const { item: bonus, nextId: nextId2 } = rollOne(gridX, gridY, floor, false, this._nextId);
      this._nextId = nextId2;
      if (bonus) EventBus.emit(EVENTS.ITEM_DROPPED, { item: bonus });
    }

    return primary;
  }
}
