import { EventBus } from '../utils/EventBus';
import { EVENTS, SHOP } from '../utils/constants';
import { SHOP_CATALOG, createItemFromCatalogEntry, buildBonusText } from '../config/shop.catalog';
import type { ShopItemDef } from '../config/shop.catalog';
import type { Player } from '../entities/Player';
import type { InventorySystem } from './InventorySystem';
import type { ShopViewModel, SellItemViewModel } from '../types/viewmodels';

export interface BuyResult { success: boolean; message: string; }
export interface SellResult { success: boolean; message: string; goldGained: number; }

export class ShopSystem {
  private _catalog: ShopItemDef[];

  constructor(catalog: ShopItemDef[] = SHOP_CATALOG) {
    this._catalog = catalog;
  }

  get catalog(): ShopItemDef[] {
    return this._catalog;
  }

  buyItem(player: Player, index: number, inventory: InventorySystem): BuyResult {
    const entry = this._catalog[index];
    if (!entry) return { success: false, message: 'Item inválido.' };

    if (player.gold < entry.price) {
      return { success: false, message: `Ouro insuficiente. Precisa de ${entry.price} moedas.` };
    }
    if (inventory.isFull()) {
      return { success: false, message: 'Inventário cheio. Faça espaço antes de comprar.' };
    }

    const item = createItemFromCatalogEntry(entry);
    inventory.addItem(item);
    player.gold -= entry.price;

    EventBus.emit(EVENTS.PLAYER_GOLD_CHANGED, { gold: player.gold });

    return { success: true, message: `Comprou ${entry.name} por ${entry.price} moedas.` };
  }

  sellItem(player: Player, itemIndex: number, inventory: InventorySystem): SellResult {
    const item = inventory.getItem(itemIndex);
    if (!item) return { success: false, message: 'Nenhum item selecionado.', goldGained: 0 };

    const basePrice = item.price ?? 0;
    if (basePrice === 0) {
      return { success: false, message: 'Este item não pode ser vendido.', goldGained: 0 };
    }

    const goldGained = Math.floor(basePrice * SHOP.SELL_RATIO);
    inventory.removeItem(itemIndex);
    player.gold += goldGained;

    EventBus.emit(EVENTS.PLAYER_GOLD_CHANGED, { gold: player.gold });

    return {
      success: true,
      message: `Vendeu ${item.name ?? item.type} por ${goldGained} moedas.`,
      goldGained,
    };
  }

  buildSellItems(
    player: { inventory: InventorySystem },
    equippedIds: Set<string>,
    selectedIndex: number,
  ): SellItemViewModel[] {
    const result: SellItemViewModel[] = [];
    const items = player.inventory.items;
    let poolIndex = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      const canSell = (item.price != null && item.price > 0) && !equippedIds.has(item.id);
      const sellPrice = Math.floor((item.price ?? 0) * SHOP.SELL_RATIO);
      result.push({
        inventoryIndex: i,
        id: item.id,
        name: item.name ?? item.type,
        sellPrice,
        isSelected: poolIndex === selectedIndex,
        canSell,
      });
      poolIndex++;
    }
    return result;
  }

  buildViewModel(
    player: Player,
    selectedIndex: number,
    tab: 'buy' | 'sell' = 'buy',
    inventory?: InventorySystem,
    equippedIds?: Set<string>,
  ): ShopViewModel {
    const buyItems = this._catalog.map((entry, i) => ({
      index:      i,
      id:         entry.id,
      name:       entry.name,
      price:      entry.price,
      rarity:     entry.rarity,
      bonusText:  buildBonusText(entry.bonuses),
      canAfford:  player.gold >= entry.price,
      isSelected: tab === 'buy' && i === selectedIndex,
    }));

    const sellItems: SellItemViewModel[] = (inventory && equippedIds)
      ? this.buildSellItems({ inventory }, equippedIds, tab === 'sell' ? selectedIndex : -1)
      : [];

    return {
      items: buyItems,
      buyItems,
      sellItems,
      tab,
      playerGold: player.gold,
      selectedIndex,
    };
  }
}
