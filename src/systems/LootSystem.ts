import { Item, ItemType } from '../entities/Item';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import { ClassRulesEngine } from './ClassRulesEngine';
import type { PlayerClassDef } from '../config/player-classes.config';
import type { EquippableItemType, EquipmentSlotId, ItemRarity, StatBonuses } from '../types/equipment';

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

export interface ChestLootResult {
  type: 'gold' | 'potion' | 'equipment' | 'mimic';
  item?: Item;
  mimicDamage?: number;
}

// Pools de equipamentos por tier de andar
const EQUIPMENT_POOL_MID: Array<{ type: EquippableItemType; slot: EquipmentSlotId; name: string }> = [
  { type: 'sword_iron',      slot: 'sword',  name: 'Espada de Ferro' },
  { type: 'helmet_leather',  slot: 'helmet', name: 'Capacete de Couro' },
  { type: 'shield_wood',     slot: 'shield', name: 'Escudo de Madeira' },
  { type: 'boots_leather',   slot: 'boots',  name: 'Botas de Couro' },
  { type: 'pants_leather',   slot: 'pants',  name: 'Calça de Couro' },
  { type: 'amulet_stone',    slot: 'amulet', name: 'Amuleto de Pedra' },
];

const EQUIPMENT_POOL_ADVANCED: Array<{ type: EquippableItemType; slot: EquipmentSlotId; name: string }> = [
  { type: 'sword_steel',     slot: 'sword',  name: 'Espada de Aço' },
  { type: 'sword_silver',    slot: 'sword',  name: 'Espada de Prata' },
  { type: 'helmet_bronze',   slot: 'helmet', name: 'Capacete de Bronze' },
  { type: 'helmet_iron',     slot: 'helmet', name: 'Capacete de Ferro' },
  { type: 'shield_iron',     slot: 'shield', name: 'Escudo de Ferro' },
  { type: 'shield_steel',    slot: 'shield', name: 'Escudo de Aço' },
  { type: 'pants_iron',      slot: 'pants',  name: 'Calça de Ferro' },
  { type: 'boots_iron',      slot: 'boots',  name: 'Botas de Ferro' },
  { type: 'boots_swift',     slot: 'boots',  name: 'Botas Velozes' },
  { type: 'amulet_silver',   slot: 'amulet', name: 'Amuleto de Prata' },
  { type: 'amulet_gold',     slot: 'amulet', name: 'Amuleto de Ouro' },
  { type: 'ring_silver',     slot: 'ring',   name: 'Anel de Prata' },
  { type: 'ring_enchanted',  slot: 'ring',   name: 'Anel Encantado' },
];

const EQUIPMENT_POOL_ELITE: Array<{ type: EquippableItemType; slot: EquipmentSlotId; name: string }> = [
  { type: 'sword_obsidian',  slot: 'sword',  name: 'Espada de Obsidiana' },
  { type: 'sword_dragon',    slot: 'sword',  name: 'Espada do Dragão' },
  { type: 'helmet_mithril',  slot: 'helmet', name: 'Capacete de Mithril' },
  { type: 'shield_runic',    slot: 'shield', name: 'Escudo Rúnico' },
  { type: 'shield_aegis',    slot: 'shield', name: 'Égide' },
  { type: 'pants_mithril',   slot: 'pants',  name: 'Calça de Mithril' },
  { type: 'boots_ethereal',  slot: 'boots',  name: 'Botas Etéreas' },
  { type: 'amulet_arcane',   slot: 'amulet', name: 'Amuleto Arcano' },
  { type: 'amulet_eternal',  slot: 'amulet', name: 'Amuleto Eterno' },
  { type: 'ring_void',       slot: 'ring',   name: 'Anel do Vazio' },
];

function pickEquipmentPool(floor: number) {
  if (floor >= 10) return EQUIPMENT_POOL_ELITE;
  if (floor >= 6)  return EQUIPMENT_POOL_ADVANCED;
  return EQUIPMENT_POOL_MID;
}

function equipmentRarity(floor: number): ItemRarity {
  if (floor >= 10) return Math.random() < 0.3 ? 'epic' : 'rare';
  if (floor >= 6)  return Math.random() < 0.4 ? 'rare' : 'uncommon';
  return 'common';
}

function equipmentBonuses(slot: EquipmentSlotId, floor: number): StatBonuses {
  const scale = Math.ceil(floor / 2);
  const bonusMap: Record<EquipmentSlotId, StatBonuses> = {
    sword:  { attack: 3 + scale, str: 1 + Math.floor(scale / 2) },
    helmet: { con: 2 + scale,    maxHp: 5 + scale * 3 },
    shield: { con: 1 + scale,    maxHp: 3 + scale * 2 },
    pants:  { dex: 1 + scale,    maxHp: 2 + scale * 2 },
    boots:  { dex: 2 + scale },
    amulet: { wis: 1 + scale,    int: 1 + scale },
    ring:   { str: 1 + scale,    dex: 1 + scale },
    extra:  { maxMana: 5 + scale * 3 },
  };
  return bonusMap[slot];
}

function generateEquipmentForFloor(floor: number, id: number): Item {
  const pool = pickEquipmentPool(floor);
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const rarity = equipmentRarity(floor);
  const bonuses = equipmentBonuses(entry.slot, floor);
  const price = 20 + floor * 15 + Math.floor(Math.random() * 20);

  const item = new Item(`chest_eq_${id}`, entry.type, null, null);
  item.name    = entry.name;
  item.slotId  = entry.slot;
  item.rarity  = rarity;
  item.bonuses = bonuses;
  item.price   = price;
  return item;
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

  /**
   * Rola o loot de um baú baseado no andar atual.
   * Não emite evento — a GameScene processa o resultado diretamente.
   */
  rollChestLoot(floor: number): ChestLootResult {
    const r = Math.random();

    // Andar inicial (1-2): ouro ou poção
    if (floor <= 2) {
      if (r < 0.60) {
        const item = new Item(`chest_gold_${this._nextId++}`, 'gold', null, null);
        item.goldAmount = pickGoldAmount(floor + 1); // baú dá sempre mais que drop comum
        return { type: 'gold', item };
      }
      const potionType = Math.random() < 0.5 ? pickHealTier(floor) : pickManaTier(floor);
      return { type: 'potion', item: new Item(`chest_pot_${this._nextId++}`, potionType, null, null) };
    }

    // Andar intermediário (3-5): ouro, poção ou mímica
    if (floor <= 5) {
      if (r < 0.50) {
        const item = new Item(`chest_gold_${this._nextId++}`, 'gold', null, null);
        item.goldAmount = pickGoldAmount(floor + 2);
        return { type: 'gold', item };
      }
      if (r < 0.80) {
        const potionType = Math.random() < 0.5 ? pickHealTier(floor) : pickManaTier(floor);
        return { type: 'potion', item: new Item(`chest_pot_${this._nextId++}`, potionType, null, null) };
      }
      const mimicDamage = 15 + Math.floor(Math.random() * 11); // 15-25
      return { type: 'mimic', mimicDamage };
    }

    // Andar avançado (6+): equipamento, ouro grande ou poção forte
    if (r < 0.50) {
      return { type: 'equipment', item: generateEquipmentForFloor(floor, this._nextId++) };
    }
    if (r < 0.80) {
      const item = new Item(`chest_gold_${this._nextId++}`, 'gold', null, null);
      item.goldAmount = pickGoldAmount(floor + 3);
      return { type: 'gold', item };
    }
    const potionType = Math.random() < 0.5 ? pickHealTier(floor) : pickManaTier(floor);
    return { type: 'potion', item: new Item(`chest_pot_${this._nextId++}`, potionType, null, null) };
  }
}
