import { Item, ItemType } from '../entities/Item';
import { EventBus } from '../utils/EventBus';
import { EVENTS, LOOT } from '../utils/constants';

/**
 * LootSystem — decide e emite drops de inimigos.
 * Puro: sem dependência de Phaser. A Scene cria o sprite ao receber ITEM_DROPPED.
 */
export class LootSystem {
  private _nextId = 0;

  /**
   * Roda a tabela de loot para a posição dada e emite ITEM_DROPPED se sortear item.
   * @returns O item dropado, ou null se não dropar nada.
   */
  roll(gridX: number, gridY: number): Item | null {
    const roll = Math.random();

    let type: ItemType | null = null;

    if (roll < LOOT.CHANCE_HEAL) {
      type = 'potion_heal';
    } else if (roll < LOOT.CHANCE_HEAL + LOOT.CHANCE_POISON) {
      type = 'potion_poison';
    } else if (roll < LOOT.CHANCE_HEAL + LOOT.CHANCE_POISON + LOOT.CHANCE_GOLD) {
      type = 'gold';
    }

    if (!type) return null;

    const item = new Item(`loot_${this._nextId++}`, type, gridX, gridY);
    EventBus.emit(EVENTS.ITEM_DROPPED, { item });
    return item;
  }
}
