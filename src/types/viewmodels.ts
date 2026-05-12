import type { EquipmentSlotId, ItemRarity } from './equipment';

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
  actions: Array<'equip' | 'unequip' | 'use' | 'drop'>;
}

export interface InventoryViewModel {
  items: InventoryItemViewModel[];
  slots: EquipmentSlotViewModel[];
  selectedItemDetail: InventoryDetailViewModel | null;
}

export interface ShopItemViewModel {
  index: number;
  id: string;
  name: string;
  price: number;
  rarity: ItemRarity;
  bonusText: string;
  canAfford: boolean;
  isSelected: boolean;
}

export interface SellItemViewModel {
  inventoryIndex: number;
  id: string;
  name: string;
  sellPrice: number;
  isSelected: boolean;
  canSell: boolean;
}

export interface ShopViewModel {
  /** @deprecated use buyItems */
  items: ShopItemViewModel[];
  buyItems: ShopItemViewModel[];
  sellItems: SellItemViewModel[];
  tab: 'buy' | 'sell';
  playerGold: number;
  selectedIndex: number;
}

export interface StatusViewModel {
  level: number;
  xp: number;
  xpNext: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  str: number;
  intel: number;
  dex: number;
  con: number;
  wis: number;
  cha: number;
  attack: number;
  freePoints: number;
}

export interface SpellSlotViewModel {
  slotIndex: 0 | 1;
  key: 'J' | 'K';
  spellId: string | null;
  spellName: string;
  cooldownRatio: number;
}

export interface SpellListItemViewModel {
  id: string;
  name: string;
  element: string;
  damage: number;
  manaCost: number;
  cooldownMs: number;
  isEquipped: boolean;
  isSelected: boolean;
}

export interface SpellsViewModel {
  activeSlots: SpellSlotViewModel[];
  unlockedSpells: SpellListItemViewModel[];
  selectedSpellId: string | null;
  playerMana: number;
}
