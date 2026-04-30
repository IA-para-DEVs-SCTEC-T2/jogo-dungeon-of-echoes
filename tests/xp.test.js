/**
 * xp.test.js — Testes do XPSystem
 * Valida os cenários definidos em specs/xp.spec.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { XPSystem } from '../src/systems/XPSystem.js';
import { EVENTS } from '../src/config/constants.js';

// Mock simples de EventEmitter
function createEmitter() {
  const handlers = {};
  return {
    emit: vi.fn((event, data) => {
      if (handlers[event]) handlers[event](data);
    }),
    on: (event, fn) => { handlers[event] = fn; },
  };
}

function createPlayer() {
  return { hp: 100, maxHp: 100, xp: 0, level: 1, attack: 10 };
}

describe('XPSystem', () => {
  let xpSystem, emitter, player;

  beforeEach(() => {
    emitter = createEmitter();
    xpSystem = new XPSystem(emitter);
    player = createPlayer();
  });

  // Cenário 1 — Ganho de XP sem level up
  it('adiciona XP sem level up', () => {
    xpSystem.addXP(player, 30);
    expect(player.xp).toBe(30);
    expect(player.level).toBe(1);
    expect(emitter.emit).not.toHaveBeenCalledWith(EVENTS.PLAYER_LEVELED_UP, expect.anything());
  });

  // Cenário 2 — Level up exato
  it('sobe de nível ao atingir XP necessário', () => {
    xpSystem.addXP(player, 100);
    expect(player.level).toBe(2);
    expect(player.maxHp).toBe(120);
    expect(player.attack).toBe(15);
    expect(player.hp).toBe(120); // HP restaurado
    expect(emitter.emit).toHaveBeenCalledWith(EVENTS.PLAYER_LEVELED_UP, expect.objectContaining({ level: 2 }));
  });

  // Cenário 3 — Múltiplos level ups
  it('processa múltiplos level ups de uma vez', () => {
    xpSystem.addXP(player, 350); // 100 (lv2) + 200 (lv3) = 300 < 350
    expect(player.level).toBe(3);
    expect(emitter.emit).toHaveBeenCalledTimes(2); // 2 level ups
  });

  // Cenário 4 — XP inválido ignorado
  it('ignora XP negativo', () => {
    xpSystem.addXP(player, -10);
    expect(player.xp).toBe(0);
    expect(player.level).toBe(1);
  });

  it('ignora XP zero', () => {
    xpSystem.addXP(player, 0);
    expect(player.xp).toBe(0);
  });

  it('ignora XP NaN', () => {
    xpSystem.addXP(player, NaN);
    expect(player.xp).toBe(0);
  });

  it('ignora player nulo', () => {
    expect(() => xpSystem.addXP(null, 50)).not.toThrow();
  });
});
