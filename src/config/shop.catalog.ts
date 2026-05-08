import { Item } from '../entities/Item';
import type { EquipmentSlotId, StatBonuses, ItemRarity, EquippableItemType } from '../types/equipment';

export interface ShopItemDef {
  id: string;
  name: string;
  type: EquippableItemType | 'potion_heal';
  slotId: EquipmentSlotId | null;
  price: number;
  rarity: ItemRarity;
  bonuses: StatBonuses;
}

export const SHOP_CATALOG: ShopItemDef[] = [
  // Espadas
  { id: 'sword_iron_1',    name: 'Espada de Ferro',   type: 'sword_iron',   slotId: 'sword',  price: 120, rarity: 'common',   bonuses: { attack: 3 } },
  { id: 'sword_steel_1',   name: 'Espada de Aço',     type: 'sword_steel',  slotId: 'sword',  price: 250, rarity: 'uncommon', bonuses: { attack: 6 } },
  { id: 'sword_silver_1',  name: 'Espada de Prata',   type: 'sword_silver', slotId: 'sword',  price: 500, rarity: 'rare',     bonuses: { attack: 12 } },
  // Capacetes
  { id: 'helmet_leather_1',name: 'Elmo de Couro',     type: 'helmet_leather', slotId: 'helmet', price: 80,  rarity: 'common',   bonuses: { con: 1 } },
  { id: 'helmet_bronze_1', name: 'Elmo de Bronze',    type: 'helmet_bronze',  slotId: 'helmet', price: 180, rarity: 'uncommon', bonuses: { con: 2 } },
  { id: 'helmet_iron_1',   name: 'Elmo de Ferro',     type: 'helmet_iron',    slotId: 'helmet', price: 350, rarity: 'rare',     bonuses: { con: 3, maxHp: 10 } },
  // Escudos
  { id: 'shield_wood_1',   name: 'Escudo de Madeira', type: 'shield_wood',  slotId: 'shield', price: 70,  rarity: 'common',   bonuses: { con: 1 } },
  { id: 'shield_iron_1',   name: 'Escudo de Ferro',   type: 'shield_iron',  slotId: 'shield', price: 160, rarity: 'uncommon', bonuses: { con: 2, maxHp: 5 } },
  { id: 'shield_steel_1',  name: 'Escudo de Aço',     type: 'shield_steel', slotId: 'shield', price: 320, rarity: 'rare',     bonuses: { con: 3, maxHp: 15 } },
  // Calças
  { id: 'pants_leather_1', name: 'Calça de Couro',    type: 'pants_leather', slotId: 'pants', price: 60,  rarity: 'common',   bonuses: { dex: 1 } },
  { id: 'pants_iron_1',    name: 'Calça de Malha',    type: 'pants_iron',    slotId: 'pants', price: 150, rarity: 'uncommon', bonuses: { dex: 2, con: 1 } },
  // Botas
  { id: 'boots_leather_1', name: 'Botas de Couro',    type: 'boots_leather', slotId: 'boots', price: 60,  rarity: 'common',   bonuses: { dex: 1 } },
  { id: 'boots_iron_1',    name: 'Botas de Ferro',    type: 'boots_iron',    slotId: 'boots', price: 140, rarity: 'uncommon', bonuses: { dex: 2 } },
  // Amuletos
  { id: 'amulet_stone_1',  name: 'Amuleto de Pedra',  type: 'amulet_stone',  slotId: 'amulet', price: 100, rarity: 'common',   bonuses: { str: 1 } },
  { id: 'amulet_silver_1', name: 'Amuleto de Prata',  type: 'amulet_silver', slotId: 'amulet', price: 220, rarity: 'uncommon', bonuses: { str: 2, attack: 2 } },
  { id: 'amulet_gold_1',   name: 'Amuleto de Ouro',   type: 'amulet_gold',   slotId: 'amulet', price: 450, rarity: 'rare',     bonuses: { str: 3, attack: 5, maxHp: 5 } },
  // Poções
  { id: 'potion_heal_shop', name: 'Poção de Cura',    type: 'potion_heal',   slotId: null,     price: 30,  rarity: 'common',   bonuses: {} },
];

export function createItemFromCatalogEntry(entry: ShopItemDef): Item {
  const item = new Item(`${entry.id}_${Date.now()}`, entry.type as Item['type'], null, null);
  item.name    = entry.name;
  item.slotId  = entry.slotId ?? undefined;
  item.bonuses = Object.keys(entry.bonuses).length > 0 ? { ...entry.bonuses } : undefined;
  item.price   = entry.price;
  item.rarity  = entry.rarity;
  // Poções de cura compradas chegam já identificadas
  if (entry.type === 'potion_heal') item.identified = true;
  return item;
}

export function buildBonusText(bonuses: StatBonuses): string {
  const parts: string[] = [];
  if (bonuses.attack) parts.push(`+${bonuses.attack} ATK`);
  if (bonuses.maxHp)  parts.push(`+${bonuses.maxHp} HP`);
  if (bonuses.con)    parts.push(`+${bonuses.con} CON`);
  if (bonuses.str)    parts.push(`+${bonuses.str} STR`);
  if (bonuses.dex)    parts.push(`+${bonuses.dex} DEX`);
  return parts.length > 0 ? parts.join(', ') : '—';
}
