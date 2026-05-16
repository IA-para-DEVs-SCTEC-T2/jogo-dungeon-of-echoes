import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import { ClassRulesEngine } from './ClassRulesEngine';
import {
  EQUIPMENT_SLOT_ORDER,
  type EquipmentSlotId,
  type EquipResult,
} from '../types/equipment';
import type { PlayerClassDef } from '../config/player-classes.config';

export type { EquipmentSlotId, EquipResult };

interface SlotMeta {
  noUnequip?: boolean;
}

export class EquipmentSystem {
  private _equipped: Record<EquipmentSlotId, string | null> = {
    helmet: null,
    shield: null,
    sword:  null,
    pants:  null,
    boots:  null,
    amulet: null,
    ring:   null,
    extra:  null,
  };

  private _equippedMeta: Record<string, SlotMeta> = {};

  /**
   * Equipa um item no slot indicado.
   *
   * @param itemId  - ID do item a equipar
   * @param slotId  - Slot de destino
   * @param classDef - Definição de classe do jogador (para validação de regras)
   * @param item    - Metadados opcionais do item (type, noUnequip)
   */
  equip(
    itemId: string,
    slotId: EquipmentSlotId,
    classDef?: PlayerClassDef,
    item?: { noUnequip?: boolean; type?: string },
  ): EquipResult {
    // Validação de regras de classe (se classDef fornecido)
    if (classDef && !ClassRulesEngine.canEquipSlot(classDef, slotId, item?.type)) {
      return {
        success: false,
        message: `Sua classe não pode equipar este item neste slot.`,
        previousItemId: null,
      };
    }

    const previousItemId = this._equipped[slotId];
    this._equipped[slotId] = itemId;
    this._equippedMeta[slotId] = { noUnequip: item?.noUnequip ?? false };

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

  /**
   * Desequipa o item no slot indicado.
   * Retorna null se o slot estiver vazio ou se o item tem noUnequip=true.
   */
  unequip(slotId: EquipmentSlotId): string | null {
    if (this._equippedMeta[slotId]?.noUnequip) return null;

    const itemId = this._equipped[slotId];
    if (!itemId) return null;

    this._equipped[slotId] = null;
    delete this._equippedMeta[slotId];
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
    this._equippedMeta = {};
  }
}
