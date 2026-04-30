/**
 * combat.test.js — Testes do CombatSystem
 * Valida os cenários definidos em specs/combat.spec.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatSystem } from '../src/systems/CombatSystem.js';
import { XPSystem } from '../src/systems/XPSystem.js';
import { EVENTS } from '../src/config/constants.js';

function createEmitter() {
  return { emit: vi.fn() };
}

function createPlayer(hp = 100, attack = 10) {
  return { hp, maxHp: hp, attack, xp: 0, level: 1 };
}

function createEnemy(hp = 30, attack = 8) {
  return { hp, maxHp: hp, attack, xpReward: 25, alive: true };
}

describe('CombatSystem', () => {
  let combat, emitter, xpSystem;

  beforeEach(() => {
    emitter = createEmitter();
    xpSystem = new XPSystem(emitter);
    combat = new CombatSystem(emitter, xpSystem);
  });

  // Cenário 1 — Player mata inimigo
  it('player ataca e mata inimigo, ganha XP', () => {
    const player = createPlayer(100, 10);
    const enemy = createEnemy(10, 8);

    const result = combat.resolve(player, enemy);

    expect(enemy.hp).toBe(0);
    expect(enemy.alive).toBe(false);
    expect(result.enemyDied).toBe(true);
    expect(player.xp).toBe(25); // xpReward
    expect(emitter.emit).toHaveBeenCalledWith(EVENTS.ENEMY_DIED, enemy);
  });

  // Cenário 2 — Inimigo sobrevive e contra-ataca
  it('inimigo sobrevive e contra-ataca o player', () => {
    const player = createPlayer(100, 10);
    const enemy = createEnemy(30, 8);

    const result = combat.resolve(player, enemy);

    expect(enemy.hp).toBe(20);
    expect(enemy.alive).toBe(true);
    expect(player.hp).toBe(92);
    expect(result.enemyDied).toBe(false);
    expect(result.playerDied).toBe(false);
  });

  // Cenário 3 — Inimigo mata player no contra-ataque
  it('inimigo mata player no contra-ataque', () => {
    const player = createPlayer(5, 5);
    const enemy = createEnemy(30, 10);

    const result = combat.resolve(player, enemy);

    expect(player.hp).toBe(0);
    expect(result.playerDied).toBe(true);
    expect(emitter.emit).toHaveBeenCalledWith(EVENTS.PLAYER_DIED, player);
  });

  // Cenário 4 — Inimigo morto não combate
  it('combate com inimigo morto retorna null', () => {
    const player = createPlayer();
    const enemy = createEnemy();
    enemy.alive = false;

    const result = combat.resolve(player, enemy);

    expect(result).toBeNull();
    expect(emitter.emit).not.toHaveBeenCalled();
  });

  // Caso de erro — referência nula
  it('retorna null com referências nulas', () => {
    expect(combat.resolve(null, createEnemy())).toBeNull();
    expect(combat.resolve(createPlayer(), null)).toBeNull();
  });
});
