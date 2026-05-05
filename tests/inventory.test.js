/**
 * inventory.test.js — Testes do InventorySystem e Item
 * Valida o sistema de inventário, identificação e uso de itens.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InventorySystem } from '../src/systems/InventorySystem';
import { Item, UNKNOWN_NAMES, REAL_NAMES } from '../src/entities/Item';
import { INVENTORY } from '../src/utils/constants';

function makeItem(type = 'potion_heal', id = 'i1') {
  return new Item(id, type, 5, 5);
}

// ─── Item ─────────────────────────────────────────────────────────────────────

describe('Item — getDisplayName', () => {
  it('retorna nome genérico quando não identificado', () => {
    const item = makeItem('potion_heal');
    expect(item.getDisplayName({})).toBe(UNKNOWN_NAMES.potion_heal);
  });

  it('retorna nome real quando item está identificado', () => {
    const item = makeItem('potion_heal');
    item.identified = true;
    expect(item.getDisplayName({})).toBe(REAL_NAMES.potion_heal);
  });

  it('retorna nome real quando tipo já foi identificado na partida', () => {
    const item = makeItem('potion_poison');
    expect(item.getDisplayName({ potion_poison: true })).toBe(REAL_NAMES.potion_poison);
  });

  it('nomes genéricos são diferentes dos nomes reais', () => {
    expect(UNKNOWN_NAMES.potion_heal).not.toBe(REAL_NAMES.potion_heal);
    expect(UNKNOWN_NAMES.potion_poison).not.toBe(REAL_NAMES.potion_poison);
  });
});

// ─── InventorySystem ──────────────────────────────────────────────────────────

describe('InventorySystem — capacidade', () => {
  it('começa vazio', () => {
    const inv = new InventorySystem();
    expect(inv.count()).toBe(0);
    expect(inv.isFull()).toBe(false);
  });

  it('isFull() retorna true quando todos os slots estão ocupados', () => {
    const inv = new InventorySystem();
    for (let i = 0; i < INVENTORY.MAX_SLOTS; i++) {
      inv.addItem(new Item(`i${i}`, 'potion_heal', 1, 1));
    }
    expect(inv.isFull()).toBe(true);
  });

  it('addItem retorna false quando inventário cheio', () => {
    const inv = new InventorySystem();
    for (let i = 0; i < INVENTORY.MAX_SLOTS; i++) {
      inv.addItem(new Item(`i${i}`, 'potion_heal', 1, 1));
    }
    const extra = new Item('extra', 'potion_poison', 2, 2);
    expect(inv.addItem(extra)).toBe(false);
  });
});

describe('InventorySystem — addItem', () => {
  it('adiciona item ao primeiro slot livre', () => {
    const inv  = new InventorySystem();
    const item = makeItem();
    inv.addItem(item);
    expect(inv.getItem(0)).toBe(item);
    expect(inv.count()).toBe(1);
  });

  it('remove item do mapa ao adicionar ao inventário', () => {
    const inv  = new InventorySystem();
    const item = makeItem();
    inv.addItem(item);
    expect(item.gridX).toBeNull();
    expect(item.gridY).toBeNull();
  });

  it('retorna true quando adicionado com sucesso', () => {
    const inv = new InventorySystem();
    expect(inv.addItem(makeItem())).toBe(true);
  });
});

describe('InventorySystem — removeItem', () => {
  it('remove e retorna o item do slot', () => {
    const inv  = new InventorySystem();
    const item = makeItem();
    inv.addItem(item);
    const removed = inv.removeItem(0);
    expect(removed).toBe(item);
    expect(inv.getItem(0)).toBeNull();
  });

  it('retorna null para slot vazio', () => {
    const inv = new InventorySystem();
    expect(inv.removeItem(0)).toBeNull();
  });
});

describe('InventorySystem — useItem (poção de cura)', () => {
  it('aplica cura ao player', () => {
    const inv  = new InventorySystem();
    const item = makeItem('potion_heal');
    inv.addItem(item);

    const result = inv.useItem(0, {}, 80, 100);

    expect(result.success).toBe(true);
    expect(result.hpDelta).toBe(INVENTORY.POTION_HEAL_AMOUNT);
  });

  it('não cura além do HP máximo', () => {
    const inv  = new InventorySystem();
    const item = makeItem('potion_heal');
    inv.addItem(item);

    // HP atual = 95, máximo = 100, cura = 10 → delta deve ser 5
    const result = inv.useItem(0, {}, 95, 100);
    expect(result.hpDelta).toBe(5);
  });

  it('remove item do inventário após uso', () => {
    const inv  = new InventorySystem();
    inv.addItem(makeItem('potion_heal'));
    inv.useItem(0, {}, 80, 100);
    expect(inv.getItem(0)).toBeNull();
  });

  it('identifica o tipo ao usar', () => {
    const inv            = new InventorySystem();
    const identifiedItems = {};
    inv.addItem(makeItem('potion_heal'));
    inv.useItem(0, identifiedItems, 80, 100);
    expect(identifiedItems['potion_heal']).toBe(true);
  });

  it('identified=true no item após uso', () => {
    const inv  = new InventorySystem();
    const item = makeItem('potion_heal');
    inv.addItem(item);
    inv.useItem(0, {}, 80, 100);
    expect(item.identified).toBe(true);
  });

  it('mensagem inclui nome do item', () => {
    const inv  = new InventorySystem();
    inv.addItem(makeItem('potion_heal'));
    const result = inv.useItem(0, {}, 80, 100);
    expect(result.messages.some((m) => m.includes('Poção'))).toBe(true);
  });

  it('mensagem "Você se sente melhor" ao usar poção de cura', () => {
    const inv  = new InventorySystem();
    inv.addItem(makeItem('potion_heal'));
    const result = inv.useItem(0, {}, 80, 100);
    expect(result.messages.some((m) => m.includes('melhor'))).toBe(true);
  });
});

describe('InventorySystem — useItem (poção de veneno)', () => {
  it('aplica dano ao player', () => {
    const inv  = new InventorySystem();
    inv.addItem(makeItem('potion_poison'));
    const result = inv.useItem(0, {}, 80, 100);
    expect(result.hpDelta).toBe(-INVENTORY.POTION_POISON_AMOUNT);
  });

  it('mensagem "Você foi envenenado" ao usar poção de veneno', () => {
    const inv  = new InventorySystem();
    inv.addItem(makeItem('potion_poison'));
    const result = inv.useItem(0, {}, 80, 100);
    expect(result.messages.some((m) => m.includes('envenenado'))).toBe(true);
  });
});

describe('InventorySystem — useItem (slot vazio)', () => {
  it('retorna success=false para slot vazio', () => {
    const inv    = new InventorySystem();
    const result = inv.useItem(5, {}, 80, 100);
    expect(result.success).toBe(false);
    expect(result.hpDelta).toBe(0);
  });
});

describe('InventorySystem — identificação por partida', () => {
  it('tipo já identificado mostra nome real em itens futuros', () => {
    const inv            = new InventorySystem();
    const identifiedItems = { potion_heal: true };

    const item = makeItem('potion_heal');
    expect(item.getDisplayName(identifiedItems)).toBe(REAL_NAMES.potion_heal);
  });

  it('identificação não vaza entre partidas (reset)', () => {
    const inv = new InventorySystem();
    inv.addItem(makeItem('potion_heal'));
    inv.reset();
    expect(inv.count()).toBe(0);
  });
});

describe('InventorySystem — getInventoryLog', () => {
  it('retorna "(vazio)" quando inventário está vazio', () => {
    const inv  = new InventorySystem();
    const log  = inv.getInventoryLog({});
    expect(log.some((l) => l.includes('vazio'))).toBe(true);
  });

  it('lista itens com índice e nome', () => {
    const inv  = new InventorySystem();
    inv.addItem(makeItem('potion_heal', 'i1'));
    const log  = inv.getInventoryLog({});
    expect(log.some((l) => l.includes('[0]'))).toBe(true);
  });
});
