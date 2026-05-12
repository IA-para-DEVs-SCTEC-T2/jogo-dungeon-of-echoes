/**
 * event-memory.test.js — Testes do EventMemory
 * Valida o registro, filtragem e serialização de eventos da run.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventMemory } from '../src/systems/EventMemory';

function makeEvent(type, data = {}, timestamp = Date.now()) {
  return { type, timestamp, data };
}

describe('EventMemory — addEvent', () => {
  it('adiciona evento corretamente', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('ENEMY_KILLED', { enemyName: 'Goblin' }));
    expect(mem.getAllEvents()).toHaveLength(1);
  });

  it('respeita debounce para PLAYER_DAMAGED', () => {
    const mem = new EventMemory();
    const now = Date.now();
    mem.addEvent(makeEvent('PLAYER_DAMAGED', { damage: 5 }, now));
    mem.addEvent(makeEvent('PLAYER_DAMAGED', { damage: 5 }, now + 100)); // dentro do debounce
    expect(mem.getAllEvents()).toHaveLength(1);
  });

  it('permite dois PLAYER_DAMAGED com intervalo suficiente', () => {
    const mem = new EventMemory();
    const now = Date.now();
    mem.addEvent(makeEvent('PLAYER_DAMAGED', { damage: 5 }, now));
    mem.addEvent(makeEvent('PLAYER_DAMAGED', { damage: 5 }, now + 600)); // fora do debounce
    expect(mem.getAllEvents()).toHaveLength(2);
  });

  it('não aplica debounce para FLOOR_CHANGED', () => {
    const mem = new EventMemory();
    const now = Date.now();
    mem.addEvent(makeEvent('FLOOR_CHANGED', { floor: 1 }, now));
    mem.addEvent(makeEvent('FLOOR_CHANGED', { floor: 2 }, now + 10));
    expect(mem.getAllEvents()).toHaveLength(2);
  });
});

describe('EventMemory — getRecentEvents', () => {
  it('retorna os N eventos mais recentes', () => {
    const mem = new EventMemory();
    for (let i = 0; i < 5; i++) {
      mem.addEvent(makeEvent('ENEMY_KILLED', { enemyName: `Inimigo ${i}` }, Date.now() + i * 1000));
    }
    expect(mem.getRecentEvents(3)).toHaveLength(3);
  });

  it('retorna todos se limit > total', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('ITEM_FOUND', { itemName: 'Poção' }));
    expect(mem.getRecentEvents(10)).toHaveLength(1);
  });
});

describe('EventMemory — getImportantEvents', () => {
  it('filtra apenas eventos importantes', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('PLAYER_DAMAGED', { damage: 5 }));   // não importante
    mem.addEvent(makeEvent('PLAYER_NEAR_DEATH', { hp: 5 }));    // importante
    mem.addEvent(makeEvent('ENEMY_KILLED', { enemyName: 'X' })); // importante

    const important = mem.getImportantEvents();
    expect(important.every(e => ['PLAYER_NEAR_DEATH', 'ENEMY_KILLED'].includes(e.type))).toBe(true);
  });

  it('deduplica eventos consecutivos do mesmo tipo', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('ENEMY_KILLED', { enemyName: 'A' }, Date.now()));
    mem.addEvent(makeEvent('ENEMY_KILLED', { enemyName: 'B' }, Date.now() + 1000));
    // Dois ENEMY_KILLED consecutivos → apenas 1 após deduplicação
    expect(mem.getImportantEvents()).toHaveLength(1);
  });

  it('não deduplica eventos de tipos diferentes', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('ENEMY_KILLED', { enemyName: 'A' }, Date.now()));
    mem.addEvent(makeEvent('FLOOR_CHANGED', { floor: 2 }, Date.now() + 1000));
    mem.addEvent(makeEvent('ENEMY_KILLED', { enemyName: 'B' }, Date.now() + 2000));
    expect(mem.getImportantEvents()).toHaveLength(3);
  });
});

describe('EventMemory — countByType e hasEvent', () => {
  it('conta eventos por tipo', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('ENEMY_KILLED', {}, Date.now()));
    mem.addEvent(makeEvent('ENEMY_KILLED', {}, Date.now() + 1000));
    expect(mem.countByType('ENEMY_KILLED')).toBe(2);
  });

  it('hasEvent retorna true quando evento existe', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('PLAYER_DEATH', { floor: 3 }));
    expect(mem.hasEvent('PLAYER_DEATH')).toBe(true);
  });

  it('hasEvent retorna false quando evento não existe', () => {
    const mem = new EventMemory();
    expect(mem.hasEvent('ELITE_ENEMY_FOUND')).toBe(false);
  });
});

describe('EventMemory — toPromptLines', () => {
  it('converte eventos em linhas de texto legíveis', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('ENEMY_KILLED', { enemyName: 'Goblin' }));
    mem.addEvent(makeEvent('FLOOR_CHANGED', { floor: 2 }));
    const lines = mem.toPromptLines();
    expect(lines.some(l => l.includes('Goblin'))).toBe(true);
    expect(lines.some(l => l.includes('andar 2'))).toBe(true);
  });

  it('retorna array vazio quando não há eventos importantes', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('PLAYER_DAMAGED', { damage: 5 })); // não importante
    expect(mem.toPromptLines()).toHaveLength(0);
  });
});

describe('EventMemory — reset', () => {
  it('limpa todos os eventos', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('ENEMY_KILLED', {}));
    mem.addEvent(makeEvent('FLOOR_CHANGED', { floor: 2 }));
    mem.reset();
    expect(mem.getAllEvents()).toHaveLength(0);
  });

  it('permite adicionar eventos após reset', () => {
    const mem = new EventMemory();
    mem.addEvent(makeEvent('ENEMY_KILLED', {}));
    mem.reset();
    mem.addEvent(makeEvent('FLOOR_CHANGED', { floor: 1 }));
    expect(mem.getAllEvents()).toHaveLength(1);
  });
});
