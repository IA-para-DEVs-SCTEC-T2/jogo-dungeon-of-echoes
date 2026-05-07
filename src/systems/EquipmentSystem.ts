import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import {
  EQUIPMENT_SLOT_ORDER,
  type EquipmentSlotId,
  type EquipResult,
} from '../types/equipment';

export type { EquipmentSlotId, EquipResult };

export class EquipmentSystem {
  private _equipped: Record<EquipmentSlotId, string | null> = {
    helmet: null,
    shield: null,
    sword:  null,
    pants:  null,
    boots:  null,
    amulet: null,
  };

  equip(itemId: string, slotId: EquipmentSlotId): EquipResult {
    const previousItemId = this._equipped[slotId];
    this._equipped[slotId] = itemId;

    EventBus.emit(EVENTS.ITEM_EQUIPPED, {
      itemId,
      slotId,
      previousItemId,
      timestamp: Date.now(),
    });

    const hadPrevious = previousItemId !== null;
    return {
      success: true,
      message: hadPrevious
        ? `Equipou e desequipou o item anterior do slot ${slotId}.`
        : `Item equipado no slot ${slotId}.`,
      previousItemId,
    };
  }

  unequip(slotId: EquipmentSlotId): string | null {
    const itemId = this._equipped[slotId];
    if (!itemId) return null;

    this._equipped[slotId] = null;
    EventBus.emit(EVENTS.ITEM_UNEQUIPPED, { itemId, slotId, timestamp: Date.now() });
    return itemId;
  }

  getEquippedId(slotId: EquipmentSlotId): string | null {
    return this._equipped[slotId];
  }

  isEquipped(itemId: string): boolean {
    return EQUIPMENT_SLOT_ORDER.some(slotId => this._equipped[slotId] === itemId);
  }

  getAllEquipped(): Record<EquipmentSlotId, string | null> {
    return { ...this._equipped };
  }

  reset(): void {
    for (const slotId of EQUIPMENT_SLOT_ORDER) {
      this._equipped[slotId] = null;
    }
  }
}
