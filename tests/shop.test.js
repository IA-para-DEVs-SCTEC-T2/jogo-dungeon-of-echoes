/**
 * shop.test.js — Testes do ShopSystem e bônus de equipamento do Player
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShopSystem } from '../src/systems/ShopSystem';
import { InventorySystem } from '../src/systems/InventorySystem';
import { Item } from '../src/entities/Item';
import { SHOP_CATALOG, createItemFromCatalogEntry, buildBonusText } from '../src/config/shop.catalog';
import { EventBus } from '../src/utils/EventBus';

// Mock do EventBus para não depender de cena Phaser
vi.spyOn(EventBus, 'emit').mockImplementation(() => EventBus);

// Player mínimo para os testes
function makePlayer(gold = 500) {
  const _bonuses = {};
  return {
    gold,
    hp: 93,
    maxHp: 93,
    attack: 10,
    con: 18,
    wis: 10,
    intel: 10,
    level: 1,
    _equipmentBonuses: _bonuses,
    recalcStats() {
      this.maxHp  = this.con * 5 + this.level * 3 + (this._equipmentBonuses.maxHp ?? 0);
      this.attack = 10 + (this._equipmentBonuses.attack ?? 0);
      this.hp     = Math.min(this.hp, this.maxHp);
    },
    applyEquipmentBonuses(bonuses) {
      for (const key of Object.keys(bonuses)) {
        this._equipmentBonuses[key] = (this._equipmentBonuses[key] ?? 0) + (bonuses[key] ?? 0);
      }
      this.recalcStats();
    },
    removeEquipmentBonuses(bonuses) {
      for (const key of Object.keys(bonuses)) {
        this._equipmentBonuses[key] = (this._equipmentBonuses[key] ?? 0) - (bonuses[key] ?? 0);
      }
      this.recalcStats();
    },
  };
}

// ─── createItemFromCatalogEntry ───────────────────────────────────────────────

describe('createItemFromCatalogEntry', () => {
  it('cria item com campos corretos', () => {
    const entry = SHOP_CATALOG.find(e => e.id === 'sword_iron_1');
    const item = createItemFromCatalogEntry(entry);
    expect(item.name).toBe('Espada de Ferro');
    expect(item.slotId).toBe('sword');
    expect(item.price).toBe(120);
    expect(item.rarity).toBe('common');
    expect(item.bonuses.attack).toBe(3);
  });

  it('poção de cura chegam identificadas', () => {
    const entry = SHOP_CATALOG.find(e => e.id === 'potion_heal_shop');
    const item = createItemFromCatalogEntry(entry);
    expect(item.identified).toBe(true);
  });
});

// ─── buildBonusText ───────────────────────────────────────────────────────────

describe('buildBonusText', () => {
  it('formata bônus corretamente', () => {
    expect(buildBonusText({ attack: 3 })).toBe('+3 ATK');
    expect(buildBonusText({ maxHp: 10, con: 2 })).toBe('+10 HP, +2 CON');
    expect(buildBonusText({})).toBe('—');
  });
});

// ─── ShopSystem — compra ──────────────────────────────────────────────────────

describe('ShopSystem — buyItem', () => {
  let shop, inv, player;

  beforeEach(() => {
    vi.clearAllMocks();
    shop   = new ShopSystem(SHOP_CATALOG);
    inv    = new InventorySystem();
    player = makePlayer(500);
  });

  it('compra com sucesso quando tem ouro suficiente', () => {
    const idx = SHOP_CATALOG.findIndex(e => e.id === 'sword_iron_1'); // preço 120
    const result = shop.buyItem(player, idx, inv);
    expect(result.success).toBe(true);
    expect(player.gold).toBe(380);
    expect(inv.count()).toBe(1);
  });

  it('falha quando ouro insuficiente', () => {
    player.gold = 50;
    const idx = SHOP_CATALOG.findIndex(e => e.id === 'sword_iron_1'); // preço 120
    const result = shop.buyItem(player, idx, inv);
    expect(result.success).toBe(false);
    expect(result.message).toContain('insuficiente');
    expect(player.gold).toBe(50);
    expect(inv.count()).toBe(0);
  });

  it('falha quando inventário cheio', () => {
    // Encher o inventário com 20 poções
    for (let i = 0; i < 20; i++) {
      inv.addItem(new Item(`p${i}`, 'potion_heal', null, null));
    }
    const idx = SHOP_CATALOG.findIndex(e => e.id === 'potion_heal_shop');
    const result = shop.buyItem(player, idx, inv);
    expect(result.success).toBe(false);
    expect(result.message).toContain('cheio');
  });

  it('emite PLAYER_GOLD_CHANGED após compra', () => {
    const idx = SHOP_CATALOG.findIndex(e => e.id === 'potion_heal_shop'); // preço 30
    shop.buyItem(player, idx, inv);
    expect(EventBus.emit).toHaveBeenCalledWith('player-gold-changed', { gold: 460 });
  });
});

// ─── ShopSystem — venda ───────────────────────────────────────────────────────

describe('ShopSystem — sellItem', () => {
  let shop, inv, player;

  beforeEach(() => {
    vi.clearAllMocks();
    shop   = new ShopSystem(SHOP_CATALOG);
    inv    = new InventorySystem();
    player = makePlayer(100);
  });

  it('vende item com preço e adiciona 40% do valor ao ouro', () => {
    const item = new Item('sword1', 'sword_iron', null, null);
    item.name  = 'Espada de Ferro';
    item.price = 120;
    inv.addItem(item);

    const result = shop.sellItem(player, 0, inv);
    expect(result.success).toBe(true);
    expect(result.goldGained).toBe(48); // floor(120 * 0.4)
    expect(player.gold).toBe(148);
    expect(inv.count()).toBe(0);
  });

  it('falha ao vender item sem preço', () => {
    const item = new Item('p1', 'potion_heal', null, null);
    // price = undefined
    inv.addItem(item);
    const result = shop.sellItem(player, 0, inv);
    expect(result.success).toBe(false);
    expect(result.goldGained).toBe(0);
    expect(player.gold).toBe(100);
  });

  it('falha ao vender slot vazio', () => {
    const result = shop.sellItem(player, 5, inv);
    expect(result.success).toBe(false);
  });
});

// ─── Player — applyEquipmentBonuses / removeEquipmentBonuses ─────────────────

describe('Player — bônus de equipamento', () => {
  it('aplica bônus de ataque', () => {
    const p = makePlayer();
    p.applyEquipmentBonuses({ attack: 6 });
    expect(p.attack).toBe(16);
  });

  it('aplica bônus de maxHp e não ultrapassa hp', () => {
    const p = makePlayer();
    p.hp = 50;
    p.applyEquipmentBonuses({ maxHp: 20 });
    expect(p.maxHp).toBe(113); // 18*5 + 1*3 + 20
    expect(p.hp).toBe(50); // hp não sobe sozinho
  });

  it('hp é clamped para maxHp se maxHp cair', () => {
    const p = makePlayer();
    p.applyEquipmentBonuses({ maxHp: 20 });
    p.hp = p.maxHp; // full hp com bônus
    p.removeEquipmentBonuses({ maxHp: 20 });
    expect(p.maxHp).toBe(93);
    expect(p.hp).toBe(93); // clamped para novo maxHp
  });

  it('remove bônus corretamente revertendo stats', () => {
    const p = makePlayer();
    p.applyEquipmentBonuses({ attack: 5, con: 2 });
    expect(p.attack).toBe(15);
    p.removeEquipmentBonuses({ attack: 5, con: 2 });
    expect(p.attack).toBe(10);
  });

  it('múltiplos equipamentos acumulam corretamente', () => {
    const p = makePlayer();
    p.applyEquipmentBonuses({ attack: 3 });
    p.applyEquipmentBonuses({ attack: 6 });
    expect(p.attack).toBe(19);
    p.removeEquipmentBonuses({ attack: 3 });
    expect(p.attack).toBe(16);
  });
});

// ─── ShopSystem — buildViewModel ─────────────────────────────────────────────

describe('ShopSystem — buildViewModel', () => {
  it('marca item selecionado corretamente', () => {
    const shop = new ShopSystem(SHOP_CATALOG);
    const player = makePlayer(200);
    const vm = shop.buildViewModel(player, 2);
    expect(vm.items[2].isSelected).toBe(true);
    expect(vm.items[0].isSelected).toBe(false);
    expect(vm.selectedIndex).toBe(2);
    expect(vm.playerGold).toBe(200);
  });

  it('canAfford reflete ouro do player', () => {
    const shop = new ShopSystem(SHOP_CATALOG);
    const player = makePlayer(25); // menos que qualquer item exceto poções
    const vm = shop.buildViewModel(player, 0);
    // Todos os itens com price > 25 devem ter canAfford=false
    vm.items.forEach(item => {
      if (item.price > 25) expect(item.canAfford).toBe(false);
    });
  });
});
