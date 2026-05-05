/**
 * combat.test.js — Testes do CombatSystem
 * Valida os cenários definidos em specs/combat.spec.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatSystem } from '../src/systems/CombatSystem';
import { XPSystem } from '../src/systems/XPSystem';
import { EVENTS } from '../src/utils/constants';

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

  // Cenário 5 — HP do inimigo diminui após ataque (regressão)
  it('HP do inimigo diminui após cada ataque', () => {
    const player = createPlayer(100, 10);
    const enemy  = createEnemy(30, 0);   // ataque 0 → não contra-ataca

    combat.resolve(player, enemy);

    expect(enemy.hp).toBe(20);
    expect(enemy.alive).toBe(true);
  });

  // Cenário 6 — HP do player diminui quando inimigo contra-ataca
  it('HP do player diminui pelo contra-ataque do inimigo', () => {
    const player = createPlayer(100, 1);  // ataque 1 → inimigo sobrevive
    const enemy  = createEnemy(30, 15);

    combat.resolve(player, enemy);

    expect(player.hp).toBe(85);
  });
});

describe('CombatSystem.attack() — 80% hit chance', () => {
  let combat, emitter, xpSystem;

  beforeEach(() => {
    emitter   = createEmitter();
    xpSystem  = new XPSystem(emitter);
    combat    = new CombatSystem(emitter, xpSystem);
  });

  it('retorna damage = attacker.attack quando acerta', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // < 0.8 → acerto
    const result = combat.attack({ attack: 7 }, { hp: 30 });
    expect(result.hit).toBe(true);
    expect(result.damage).toBe(7);
    vi.restoreAllMocks();
  });

  it('retorna damage = 0 quando erra', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // ≥ 0.8 → erro
    const result = combat.attack({ attack: 7 }, { hp: 30 });
    expect(result.hit).toBe(false);
    expect(result.damage).toBe(0);
    vi.restoreAllMocks();
  });

  it('NÃO modifica o HP do defensor (responsabilidade do chamador)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // acerto garantido
    const defender = { hp: 30 };
    combat.attack({ attack: 10 }, defender);
    expect(defender.hp).toBe(30); // inalterado
    vi.restoreAllMocks();
  });

  it('taxa de acerto estatisticamente próxima de 80% em 1000 amostras', () => {
    vi.restoreAllMocks(); // usar Math.random real
    let hits = 0;
    for (let i = 0; i < 1000; i++) {
      if (combat.attack({ attack: 1 }, { hp: 99 }).hit) hits++;
    }
    // Aceitar desvio de ±5% (750–850 hits)
    expect(hits).toBeGreaterThanOrEqual(750);
    expect(hits).toBeLessThanOrEqual(850);
  });
});
