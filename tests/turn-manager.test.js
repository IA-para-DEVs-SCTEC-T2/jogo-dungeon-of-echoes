/**
 * turn-manager.test.js — Testes do TurnManager
 * Valida o controle de turno, ações do player e turno dos inimigos.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TurnManager } from '../src/systems/TurnManager';
import { TILE, TILE_SIZE } from '../src/utils/constants';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createPlayer(gridX = 5, gridY = 5, hp = 20, attack = 5) {
  return {
    gridX,
    gridY,
    hp,
    maxHp: hp,
    attack,
    setPosition: vi.fn(),
  };
}

function createEnemy(gridX, gridY, hp = 10, attack = 3) {
  return {
    gridX,
    gridY,
    hp,
    maxHp: hp,
    attack,
    xpReward: 25,
    alive: true,
    update: vi.fn().mockReturnValue({ attacked: false, damage: 0 }),
  };
}

function createCombat(alwaysHit = true, damage = null) {
  return {
    attack: vi.fn().mockImplementation((attacker) => ({
      hit: alwaysHit,
      damage: alwaysHit ? (damage ?? attacker.attack) : 0,
    })),
    xpSystem: { addXP: vi.fn() },
  };
}

function createDungeon(walkable = true) {
  return {
    isWalkable: vi.fn().mockReturnValue(walkable),
    rooms: [],
  };
}

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('TurnManager — estado de turno', () => {
  it('isPlayerTurn() retorna true inicialmente', () => {
    const tm = new TurnManager();
    expect(tm.isPlayerTurn()).toBe(true);
  });

  it('retorna ao turno do player após processPlayerAction', () => {
    const tm      = new TurnManager();
    const player  = createPlayer();
    const dungeon = createDungeon(true);

    tm.processPlayerAction({ type: 'WAIT' }, player, [], dungeon, createCombat());

    expect(tm.isPlayerTurn()).toBe(true);
  });
});

describe('TurnManager — ação WAIT', () => {
  it('não move o player', () => {
    const tm     = new TurnManager();
    const player = createPlayer(5, 5);

    tm.processPlayerAction({ type: 'WAIT' }, player, [], createDungeon(), createCombat());

    expect(player.gridX).toBe(5);
    expect(player.gridY).toBe(5);
    expect(player.setPosition).not.toHaveBeenCalled();
  });

  it('inimigos agem mesmo no WAIT', () => {
    const tm     = new TurnManager();
    const player = createPlayer(5, 5);
    const enemy  = createEnemy(6, 5);

    tm.processPlayerAction({ type: 'WAIT' }, player, [enemy], createDungeon(), createCombat());

    expect(enemy.update).toHaveBeenCalledOnce();
  });
});

describe('TurnManager — ação MOVE', () => {
  it('atualiza gridX/Y do player quando tile é walkable', () => {
    const tm      = new TurnManager();
    const player  = createPlayer(5, 5);
    const dungeon = createDungeon(true);

    tm.processPlayerAction({ type: 'MOVE', dx: 1, dy: 0 }, player, [], dungeon, createCombat());

    expect(player.gridX).toBe(6);
    expect(player.gridY).toBe(5);
  });

  it('chama setPosition com coordenadas em pixels corretas', () => {
    const tm      = new TurnManager();
    const player  = createPlayer(5, 5);
    const dungeon = createDungeon(true);

    tm.processPlayerAction({ type: 'MOVE', dx: 0, dy: 1 }, player, [], dungeon, createCombat());

    const expectedX = 5 * TILE_SIZE + TILE_SIZE / 2;
    const expectedY = 6 * TILE_SIZE + TILE_SIZE / 2;
    expect(player.setPosition).toHaveBeenCalledWith(expectedX, expectedY);
  });

  it('não move quando tile não é walkable', () => {
    const tm      = new TurnManager();
    const player  = createPlayer(5, 5);
    const dungeon = createDungeon(false);

    tm.processPlayerAction({ type: 'MOVE', dx: 1, dy: 0 }, player, [], dungeon, createCombat());

    expect(player.gridX).toBe(5);
    expect(player.setPosition).not.toHaveBeenCalled();
  });

  it('playerMoved = true no resultado quando move com sucesso', () => {
    const tm     = new TurnManager();
    const player = createPlayer(5, 5);

    const result = tm.processPlayerAction(
      { type: 'MOVE', dx: 1, dy: 0 }, player, [], createDungeon(true), createCombat(),
    );

    expect(result.playerMoved).toBe(true);
  });

  it('playerMoved = false quando bloqueado', () => {
    const tm     = new TurnManager();
    const player = createPlayer(5, 5);

    const result = tm.processPlayerAction(
      { type: 'MOVE', dx: 1, dy: 0 }, player, [], createDungeon(false), createCombat(),
    );

    expect(result.playerMoved).toBe(false);
  });
});

describe('TurnManager — ação ATTACK (player → inimigo)', () => {
  it('chama combat.attack com player e inimigo', () => {
    const tm     = new TurnManager();
    const player = createPlayer();
    const enemy  = createEnemy(6, 5);
    const combat = createCombat(true, 5);

    tm.processPlayerAction({ type: 'ATTACK', target: enemy }, player, [enemy], createDungeon(), combat);

    expect(combat.attack).toHaveBeenCalledWith(player, enemy);
  });

  it('reduz HP do inimigo quando acerta', () => {
    const tm     = new TurnManager();
    const player = createPlayer(20, 5, 20, 5);
    const enemy  = createEnemy(6, 5, 10, 3);
    const combat = createCombat(true, 5);

    tm.processPlayerAction({ type: 'ATTACK', target: enemy }, player, [enemy], createDungeon(), combat);

    expect(enemy.hp).toBe(5);
  });

  it('não reduz HP do inimigo quando erra', () => {
    const tm     = new TurnManager();
    const player = createPlayer();
    const enemy  = createEnemy(6, 5, 10);
    const combat = createCombat(false);

    tm.processPlayerAction({ type: 'ATTACK', target: enemy }, player, [enemy], createDungeon(), combat);

    expect(enemy.hp).toBe(10);
  });

  it('seta enemy.alive=false quando hp ≤ 0', () => {
    const tm     = new TurnManager();
    const player = createPlayer();
    const enemy  = createEnemy(6, 5, 5);
    const combat = createCombat(true, 10); // dano 10 > hp 5

    tm.processPlayerAction({ type: 'ATTACK', target: enemy }, player, [enemy], createDungeon(), combat);

    expect(enemy.alive).toBe(false);
    expect(result => result); // alive foi setado diretamente
  });

  it('inclui o inimigo em enemiesDied quando morrer', () => {
    const tm     = new TurnManager();
    const player = createPlayer();
    const enemy  = createEnemy(6, 5, 5);
    const combat = createCombat(true, 10);

    const result = tm.processPlayerAction(
      { type: 'ATTACK', target: enemy }, player, [enemy], createDungeon(), combat,
    );

    expect(result.enemiesDied).toContain(enemy);
  });

  it('mensagem de acerto incluída no resultado', () => {
    const tm     = new TurnManager();
    const player = createPlayer(20, 5, 20, 5);
    const enemy  = createEnemy(6, 5, 20);
    const combat = createCombat(true, 5);

    const result = tm.processPlayerAction(
      { type: 'ATTACK', target: enemy }, player, [enemy], createDungeon(), combat,
    );

    expect(result.messages.some((m) => m.includes('5'))).toBe(true);
  });

  it('mensagem de miss incluída no resultado', () => {
    const tm     = new TurnManager();
    const player = createPlayer();
    const enemy  = createEnemy(6, 5, 20);
    const combat = createCombat(false);

    const result = tm.processPlayerAction(
      { type: 'ATTACK', target: enemy }, player, [enemy], createDungeon(), combat,
    );

    expect(result.messages.some((m) => m.toLowerCase().includes('errou'))).toBe(true);
  });
});

describe('TurnManager — turno dos inimigos', () => {
  it('chama update() de cada inimigo vivo', () => {
    const tm      = new TurnManager();
    const player  = createPlayer(5, 5);
    const enemy1  = createEnemy(3, 5);
    const enemy2  = createEnemy(7, 5);

    tm.processPlayerAction({ type: 'WAIT' }, player, [enemy1, enemy2], createDungeon(), createCombat());

    expect(enemy1.update).toHaveBeenCalledOnce();
    expect(enemy2.update).toHaveBeenCalledOnce();
  });

  it('não chama update() de inimigos mortos', () => {
    const tm     = new TurnManager();
    const player = createPlayer();
    const enemy  = createEnemy(3, 5);
    enemy.alive  = false;

    tm.processPlayerAction({ type: 'WAIT' }, player, [enemy], createDungeon(), createCombat());

    expect(enemy.update).not.toHaveBeenCalled();
  });

  it('reduz HP do player quando inimigo acerta', () => {
    const tm     = new TurnManager();
    const player = createPlayer(5, 5, 20, 5);
    const enemy  = createEnemy(6, 5, 10, 3);
    enemy.update = vi.fn().mockReturnValue({ attacked: true, damage: 3 });
    const combat = createCombat(true, 3); // inimigo acerta

    tm.processPlayerAction({ type: 'WAIT' }, player, [enemy], createDungeon(), combat);

    expect(player.hp).toBe(17);
  });

  it('não reduz HP do player quando inimigo erra', () => {
    const tm     = new TurnManager();
    const player = createPlayer(5, 5, 20, 5);
    const enemy  = createEnemy(6, 5);
    enemy.update = vi.fn().mockReturnValue({ attacked: true, damage: 5 });
    const combat = createCombat(false); // inimigo erra

    tm.processPlayerAction({ type: 'WAIT' }, player, [enemy], createDungeon(), combat);

    expect(player.hp).toBe(20);
  });

  it('playerDied=true quando player morre no turno inimigo', () => {
    const tm     = new TurnManager();
    const player = createPlayer(5, 5, 3, 5); // hp=3
    const enemy  = createEnemy(6, 5);
    enemy.update = vi.fn().mockReturnValue({ attacked: true, damage: 3 });
    const combat = createCombat(true, 5); // dano 5 > hp 3

    const result = tm.processPlayerAction(
      { type: 'WAIT' }, player, [enemy], createDungeon(), combat,
    );

    expect(result.playerDied).toBe(true);
    expect(player.hp).toBe(0);
  });

  it('para de processar inimigos após morte do player', () => {
    const tm      = new TurnManager();
    const player  = createPlayer(5, 5, 1, 5); // hp=1, vai morrer no 1º inimigo
    const enemy1  = createEnemy(6, 5);
    const enemy2  = createEnemy(4, 5);
    enemy1.update = vi.fn().mockReturnValue({ attacked: true, damage: 1 });
    enemy2.update = vi.fn().mockReturnValue({ attacked: true, damage: 1 });
    const combat  = createCombat(true, 5);

    tm.processPlayerAction({ type: 'WAIT' }, player, [enemy1, enemy2], createDungeon(), combat);

    expect(enemy2.update).not.toHaveBeenCalled();
  });

  it('mensagem de miss do inimigo incluída no resultado', () => {
    const tm     = new TurnManager();
    const player = createPlayer();
    const enemy  = createEnemy(6, 5);
    enemy.update = vi.fn().mockReturnValue({ attacked: true, damage: 5 });
    const combat = createCombat(false);

    const result = tm.processPlayerAction(
      { type: 'WAIT' }, player, [enemy], createDungeon(), combat,
    );

    expect(result.messages.some((m) => m.toLowerCase().includes('errou'))).toBe(true);
  });
});
