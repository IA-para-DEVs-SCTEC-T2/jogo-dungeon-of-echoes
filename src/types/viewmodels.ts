import type { EquipmentSlotId } from './equipment';

export interface LogEntryViewModel {
  text: string;
  alpha: number;
}

export interface LogViewModel {
  entries: LogEntryViewModel[];
}

export interface InventoryItemViewModel {
  index: number;
  id: string | null;
  displayName: string;
  type: string;
  isEquipped: boolean;
  isSelected: boolean;
  slotId?: EquipmentSlotId;
}

export interface EquipmentSlotViewModel {
  id: EquipmentSlotId;
  label: string;
  equippedItemId: string | null;
  equippedItemName: string;
  isSelected: boolean;
}

export interface InventoryDetailViewModel {
  name: string;
  description: string;
  actions: Array<'equip' | 'use' | 'drop'>;
}

export interface InventoryViewModel {
  items: InventoryItemViewModel[];
  slots: EquipmentSlotViewModel[];
  selectedItemDetail: InventoryDetailViewModel | null;
}
