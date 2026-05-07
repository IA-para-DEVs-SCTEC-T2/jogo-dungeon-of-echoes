export type EquipmentSlotId = 'helmet' | 'shield' | 'sword' | 'pants' | 'boots' | 'amulet';

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
  | 'sword_iron' | 'sword_steel'
  | 'helmet_leather' | 'helmet_iron'
  | 'shield_wood' | 'boots_leather' | 'amulet_stone';

export type ItemRarity = 'common' | 'uncommon' | 'rare';

export interface EquippableItem {
  id: string;
  type: EquippableItemType;
  slotId: EquipmentSlotId;
  name: string;
  description: string;
  rarity: ItemRarity;
}

export interface EquipResult {
  success: boolean;
  message: string;
  previousItemId: string | null;
}
