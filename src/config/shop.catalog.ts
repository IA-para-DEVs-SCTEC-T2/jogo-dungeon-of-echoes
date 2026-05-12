import { Item } from '../entities/Item';
import type { ConsumableItemType } from '../entities/Item';
import type { EquipmentSlotId, StatBonuses, ItemRarity, EquippableItemType } from '../types/equipment';

export interface ShopItemDef {
  id: string;
  name: string;
  type: EquippableItemType | ConsumableItemType;
  slotId: EquipmentSlotId | null;
  price: number;
  rarity: ItemRarity;
  bonuses: StatBonuses;
}

export const SHOP_CATALOG: ShopItemDef[] = [
  // ── Espadas ──────────────────────────────────────────────────────────────
  { id: 'sword_iron_1',     name: 'Espada de Ferro',      type: 'sword_iron',     slotId: 'sword',  price:  120, rarity: 'common',    bonuses: { attack: 3 } },
  { id: 'sword_steel_1',    name: 'Espada de Aço',        type: 'sword_steel',    slotId: 'sword',  price:  280, rarity: 'uncommon',  bonuses: { attack: 6 } },
  { id: 'sword_silver_1',   name: 'Espada de Prata',      type: 'sword_silver',   slotId: 'sword',  price:  600, rarity: 'rare',      bonuses: { attack: 12, str: 1 } },
  { id: 'sword_obsidian_1', name: 'Espada de Obsidiana',  type: 'sword_obsidian', slotId: 'sword',  price: 1400, rarity: 'epic',      bonuses: { attack: 22, str: 3, dex: 2 } },
  { id: 'sword_dragon_1',   name: 'Espadão do Dragão',    type: 'sword_dragon',   slotId: 'sword',  price: 3500, rarity: 'legendary', bonuses: { attack: 40, str: 6, maxHp: 30 } },

  // ── Capacetes ────────────────────────────────────────────────────────────
  { id: 'helmet_leather_1', name: 'Elmo de Couro',        type: 'helmet_leather', slotId: 'helmet', price:   80, rarity: 'common',    bonuses: { con: 1 } },
  { id: 'helmet_bronze_1',  name: 'Elmo de Bronze',       type: 'helmet_bronze',  slotId: 'helmet', price:  190, rarity: 'uncommon',  bonuses: { con: 2 } },
  { id: 'helmet_iron_1',    name: 'Elmo de Ferro',         type: 'helmet_iron',    slotId: 'helmet', price:  380, rarity: 'rare',      bonuses: { con: 3, maxHp: 10 } },
  { id: 'helmet_mithril_1', name: 'Elmo de Mithril',      type: 'helmet_mithril', slotId: 'helmet', price:  950, rarity: 'epic',      bonuses: { con: 5, maxHp: 25, dex: 1 } },
  { id: 'helmet_void_1',    name: 'Coroa do Vazio',        type: 'helmet_void',    slotId: 'helmet', price: 2800, rarity: 'legendary', bonuses: { con: 8, maxHp: 60, wis: 3, maxMana: 20 } },

  // ── Escudos ───────────────────────────────────────────────────────────────
  { id: 'shield_wood_1',    name: 'Escudo de Madeira',    type: 'shield_wood',    slotId: 'shield', price:   70, rarity: 'common',    bonuses: { con: 1 } },
  { id: 'shield_iron_1',    name: 'Escudo de Ferro',      type: 'shield_iron',    slotId: 'shield', price:  170, rarity: 'uncommon',  bonuses: { con: 2, maxHp: 5 } },
  { id: 'shield_steel_1',   name: 'Escudo de Aço',        type: 'shield_steel',   slotId: 'shield', price:  360, rarity: 'rare',      bonuses: { con: 3, maxHp: 15 } },
  { id: 'shield_runic_1',   name: 'Escudo Rúnico',        type: 'shield_runic',   slotId: 'shield', price:  900, rarity: 'epic',      bonuses: { con: 5, maxHp: 35, str: 2 } },
  { id: 'shield_aegis_1',   name: 'Égide Celestial',      type: 'shield_aegis',   slotId: 'shield', price: 2500, rarity: 'legendary', bonuses: { con: 8, maxHp: 80, attack: 5 } },

  // ── Calças ────────────────────────────────────────────────────────────────
  { id: 'pants_leather_1',  name: 'Calça de Couro',       type: 'pants_leather',  slotId: 'pants',  price:   60, rarity: 'common',    bonuses: { dex: 1 } },
  { id: 'pants_iron_1',     name: 'Calça de Malha',       type: 'pants_iron',     slotId: 'pants',  price:  160, rarity: 'uncommon',  bonuses: { dex: 2, con: 1 } },
  { id: 'pants_mithril_1',  name: 'Calça de Mithril',     type: 'pants_mithril',  slotId: 'pants',  price:  750, rarity: 'epic',      bonuses: { dex: 4, con: 3, maxHp: 15 } },
  { id: 'pants_shadow_1',   name: 'Vestes da Sombra',     type: 'pants_shadow',   slotId: 'pants',  price: 2200, rarity: 'legendary', bonuses: { dex: 7, con: 4, attack: 8, maxHp: 20 } },

  // ── Botas ─────────────────────────────────────────────────────────────────
  { id: 'boots_leather_1',  name: 'Botas de Couro',       type: 'boots_leather',  slotId: 'boots',  price:   60, rarity: 'common',    bonuses: { dex: 1 } },
  { id: 'boots_iron_1',     name: 'Botas de Ferro',       type: 'boots_iron',     slotId: 'boots',  price:  150, rarity: 'uncommon',  bonuses: { dex: 2 } },
  { id: 'boots_swift_1',    name: 'Botas Velozes',        type: 'boots_swift',    slotId: 'boots',  price:  680, rarity: 'epic',      bonuses: { dex: 4, str: 2, maxHp: 10 } },
  { id: 'boots_ethereal_1', name: 'Botas Etéreas',        type: 'boots_ethereal', slotId: 'boots',  price: 1900, rarity: 'legendary', bonuses: { dex: 8, attack: 6, maxHp: 15 } },

  // ── Amuletos ──────────────────────────────────────────────────────────────
  { id: 'amulet_stone_1',   name: 'Amuleto de Pedra',     type: 'amulet_stone',   slotId: 'amulet', price:  100, rarity: 'common',    bonuses: { str: 1 } },
  { id: 'amulet_silver_1',  name: 'Amuleto de Prata',     type: 'amulet_silver',  slotId: 'amulet', price:  230, rarity: 'uncommon',  bonuses: { str: 2, attack: 2 } },
  { id: 'amulet_gold_1',    name: 'Amuleto de Ouro',      type: 'amulet_gold',    slotId: 'amulet', price:  500, rarity: 'rare',      bonuses: { str: 3, attack: 5, maxHp: 5 } },
  { id: 'amulet_arcane_1',  name: 'Amuleto Arcano',       type: 'amulet_arcane',  slotId: 'amulet', price: 1200, rarity: 'epic',      bonuses: { str: 4, wis: 3, int: 3, maxMana: 25 } },
  { id: 'amulet_eternal_1', name: 'Amuleto da Eternidade',type: 'amulet_eternal', slotId: 'amulet', price: 3200, rarity: 'legendary', bonuses: { str: 6, attack: 10, maxHp: 40, maxMana: 40 } },

  // ── Anéis (novo slot) ─────────────────────────────────────────────────────
  { id: 'ring_copper_1',    name: 'Anel de Cobre',        type: 'ring_copper',    slotId: 'ring',   price:   90, rarity: 'common',    bonuses: { int: 1 } },
  { id: 'ring_silver_1',    name: 'Anel de Prata',        type: 'ring_silver',    slotId: 'ring',   price:  210, rarity: 'uncommon',  bonuses: { wis: 2, maxMana: 10 } },
  { id: 'ring_enchanted_1', name: 'Anel Encantado',       type: 'ring_enchanted', slotId: 'ring',   price:  850, rarity: 'epic',      bonuses: { wis: 4, int: 4, maxMana: 30, attack: 3 } },
  { id: 'ring_void_1',      name: 'Anel do Vazio',        type: 'ring_void',      slotId: 'ring',   price: 2800, rarity: 'legendary', bonuses: { wis: 6, int: 6, maxMana: 60, str: 3, attack: 8 } },

  // ── Poções ────────────────────────────────────────────────────────────────
  { id: 'potion_heal_light_shop', name: 'Poção de Cura Fraca',  type: 'potion_heal_light', slotId: null, price:  15, rarity: 'common',   bonuses: {} },
  { id: 'potion_heal_shop',       name: 'Poção de Cura',        type: 'potion_heal',       slotId: null, price:  40, rarity: 'uncommon', bonuses: {} },
  { id: 'potion_heal_high_shop',  name: 'Poção de Cura Forte',  type: 'potion_heal_high',  slotId: null, price:  90, rarity: 'rare',     bonuses: {} },
  { id: 'potion_mana_light_shop', name: 'Poção de Mana Fraca',  type: 'potion_mana_light', slotId: null, price:  20, rarity: 'common',   bonuses: {} },
  { id: 'potion_mana_shop',       name: 'Poção de Mana',        type: 'potion_mana',       slotId: null, price:  50, rarity: 'uncommon', bonuses: {} },
  { id: 'potion_mana_high_shop',  name: 'Poção de Mana Forte',  type: 'potion_mana_high',  slotId: null, price: 110, rarity: 'rare',     bonuses: {} },
];

export function createItemFromCatalogEntry(entry: ShopItemDef): Item {
  const item = new Item(`${entry.id}_${Date.now()}`, entry.type as Item['type'], null, null);
  item.name    = entry.name;
  item.slotId  = entry.slotId ?? undefined;
  item.bonuses = Object.keys(entry.bonuses).length > 0 ? { ...entry.bonuses } : undefined;
  item.price   = entry.price;
  item.rarity  = entry.rarity;
  // Poções compradas chegam já identificadas
  if (entry.type.startsWith('potion_')) item.identified = true;
  return item;
}

export function buildBonusText(bonuses: StatBonuses): string {
  const parts: string[] = [];
  if (bonuses.attack)  parts.push(`+${bonuses.attack} ATK`);
  if (bonuses.maxHp)   parts.push(`+${bonuses.maxHp} HP`);
  if (bonuses.maxMana) parts.push(`+${bonuses.maxMana} Mana`);
  if (bonuses.con)     parts.push(`+${bonuses.con} CON`);
  if (bonuses.str)     parts.push(`+${bonuses.str} STR`);
  if (bonuses.dex)     parts.push(`+${bonuses.dex} DEX`);
  if (bonuses.wis)     parts.push(`+${bonuses.wis} WIS`);
  if (bonuses.int)     parts.push(`+${bonuses.int} INT`);
  return parts.length > 0 ? parts.join(', ') : '—';
}
