export type EquipmentSlotId = 'helmet' | 'shield' | 'sword' | 'pants' | 'boots' | 'amulet' | 'ring';

export interface StatBonuses {
  str?: number;
  dex?: number;
  con?: number;
  wis?: number;
  int?: number;
  attack?: number;
  maxHp?: number;
  maxMana?: number;
}

export const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlotId, string> = {
  helmet: 'Capacete',
  shield: 'Escudo',
  sword:  'Espada',
  pants:  'Calça',
  boots:  'Bota',
  amulet: 'Amuleto',
  ring:   'Anel',
};

export const EQUIPMENT_SLOT_ORDER: EquipmentSlotId[] = [
  'helmet', 'shield', 'sword', 'pants', 'boots', 'amulet', 'ring',
];

export type EquippableItemType =
  | 'sword_iron' | 'sword_steel' | 'sword_silver' | 'sword_obsidian' | 'sword_dragon'
  | 'helmet_leather' | 'helmet_bronze' | 'helmet_iron' | 'helmet_mithril' | 'helmet_void'
  | 'shield_wood' | 'shield_iron' | 'shield_steel' | 'shield_runic' | 'shield_aegis'
  | 'pants_leather' | 'pants_iron' | 'pants_mithril' | 'pants_shadow'
  | 'boots_leather' | 'boots_iron' | 'boots_swift' | 'boots_ethereal'
  | 'amulet_stone' | 'amulet_silver' | 'amulet_gold' | 'amulet_arcane' | 'amulet_eternal'
  | 'ring_copper' | 'ring_silver' | 'ring_enchanted' | 'ring_void';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface EquippableItem {
  id: string;
  type: EquippableItemType;
  slotId: EquipmentSlotId;
  name: string;
  description: string;
  rarity: ItemRarity;
  bonuses: StatBonuses;
  price: number;
}

export interface EquipResult {
  success: boolean;
  message: string;
  previousItemId: string | null;
}
