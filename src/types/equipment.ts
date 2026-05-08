export type EquipmentSlotId = 'helmet' | 'shield' | 'sword' | 'pants' | 'boots' | 'amulet';

export interface StatBonuses {
  str?: number;
  dex?: number;
  con?: number;
  attack?: number;
  maxHp?: number;
}

export const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlotId, string> = {
  helmet: 'Capacete',
  shield: 'Escudo',
  sword:  'Espada',
  pants:  'Calça',
  boots:  'Bota',
  amulet: 'Amuleto',
};

export const EQUIPMENT_SLOT_ORDER: EquipmentSlotId[] = [
  'helmet', 'shield', 'sword', 'pants', 'boots', 'amulet',
];

export type EquippableItemType =
  | 'sword_iron' | 'sword_steel' | 'sword_silver'
  | 'helmet_leather' | 'helmet_iron' | 'helmet_bronze'
  | 'shield_wood' | 'shield_iron' | 'shield_steel'
  | 'pants_leather' | 'pants_iron'
  | 'boots_leather' | 'boots_iron'
  | 'amulet_stone' | 'amulet_silver' | 'amulet_gold';

export type ItemRarity = 'common' | 'uncommon' | 'rare';

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
