/**
 * enemy.test.js — Testes do EnemySystem
 * Valida os cenários definidos em specs/enemy.spec.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnemySystem, createEnemies } from '../src/systems/EnemySystem';
import { ENEMY, TILE_SIZE } from '../src/utils/constants';

function makeEmitter() {
  return { emit: vi.fn() };
}

describe('EnemySystem', () => {
  let enemy;
  let emitter;

  beforeEach(() => {
    emitter = makeEmitter();
    enemy = new EnemySystem(5, 3, 0);
  });

  // Cenário 1 — Estado inicial correto
  it('inicializa com atributos padrão', () => {
    expect(enemy.hp).toBe(ENEMY.HP);
    expect(enemy.maxHp).toBe(ENEMY.HP);
    expect(enemy.attack).toBe(ENEMY.ATTACK);
    expect(enemy.xpReward).toBe(ENEMY.XP_REWARD);
    expect(enemy.alive).toBe(true);
    expect(enemy.gridX).toBe(5);
    expect(enemy.gridY).toBe(3);
  });

  // Cenário 2 — Recebe dano e sobrevive
  it('recebe dano e permanece vivo', () => {
    enemy.takeDamage(10, emitter);
    expect(enemy.hp).toBe(ENEMY.HP - 10);
    expect(enemy.alive).toBe(true);
    expect(emitter.emit).not.toHaveBeenCalledWith('enemy-died', expect.anything());
  });

  // Cenário 3 — Recebe dano letal e morre
  it('morre quando HP chega a 0 e emite enemy-died', () => {
    enemy.takeDamage(ENEMY.HP, emitter);
    expect(enemy.hp).toBe(0);
    expect(enemy.alive).toBe(false);
    expect(emitter.emit).toHaveBeenCalledWith('enemy-died', enemy);
  });

  // Cenário 4 — Dano maior que HP restante não vai negativo
  it('HP nunca fica abaixo de 0', () => {
    enemy.takeDamage(ENEMY.HP + 999, emitter);
    expect(enemy.hp).toBe(0);
  });

  // Cenário 5 — Inimigo morto ignora dano adicional
  it('inimigo morto não recebe dano adicional', () => {
    enemy.takeDamage(ENEMY.HP, emitter);
    emitter.emit.mockClear();

    enemy.takeDamage(10, emitter);
    expect(emitter.emit).not.toHaveBeenCalled();
    expect(enemy.hp).toBe(0);
  });

  // Cenário 6 — getPixelPos usa TILE_SIZE correto (16px)
  it('getPixelPos calcula posição em pixels com TILE_SIZE=16', () => {
    const pos = enemy.getPixelPos();
    expect(pos.x).toBe(5 * TILE_SIZE + TILE_SIZE / 2); // 88
    expect(pos.y).toBe(3 * TILE_SIZE + TILE_SIZE / 2); // 56
    expect(TILE_SIZE).toBe(16);
  });
});

describe('createEnemies', () => {
  // Mock mínimo de DungeonGenerator para testar a factory
  function makeDungeon(startPos = { x: 0, y: 0 }) {
    let call = 0;
    return {
      rooms: [{ x: 5, y: 5, width: 8, height: 8 }],
      startPos,
      isWalkable: () => true,
      // Retorna posições únicas a cada chamada para evitar colisão no occupied Set
      getRandomFloorPosition: () => ({ x: 6 + call++, y: 6 }),
    };
  }

  it('cria o número correto de inimigos', () => {
    const dungeon = makeDungeon();
    const enemies = createEnemies(dungeon, 3, dungeon.startPos);
    expect(enemies.length).toBe(3);
  });

  it('todos os inimigos iniciam vivos', () => {
    const dungeon = makeDungeon();
    const enemies = createEnemies(dungeon, 4, dungeon.startPos);
    enemies.forEach((e) => expect(e.alive).toBe(true));
  });
});

// ─── Enemy.ts — entidade pura ──────────────────────────────────────────────

import { Enemy } from '../src/entities/Enemy';
import { TILE_SIZE } from '../src/utils/constants';

describe('Enemy (entidade pura)', () => {
  let enemy;

  beforeEach(() => {
    enemy = new Enemy('e0', 4, 6, 10, 3);
  });

  it('inicializa com os atributos fornecidos', () => {
    expect(enemy.id).toBe('e0');
    expect(enemy.gridX).toBe(4);
    expect(enemy.gridY).toBe(6);
    expect(enemy.hp).toBe(10);
    expect(enemy.maxHp).toBe(10);
    expect(enemy.attack).toBe(3);
    expect(enemy.alive).toBe(true);
  });

  it('usa valores padrão hp=10 e attack=3 quando omitidos', () => {
    const e = new Enemy('x', 0, 0);
    expect(e.hp).toBe(10);
    expect(e.attack).toBe(3);
  });

  it('takeDamage reduz hp corretamente', () => {
    enemy.takeDamage(4);
    expect(enemy.hp).toBe(6);
    expect(enemy.alive).toBe(true);
  });

  it('hp nunca fica abaixo de 0', () => {
    enemy.takeDamage(999);
    expect(enemy.hp).toBe(0);
  });

  it('seta alive=false quando hp chega a 0', () => {
    enemy.takeDamage(10);
    expect(enemy.alive).toBe(false);
  });

  it('takeDamage em inimigo morto é ignorado silenciosamente', () => {
    enemy.alive = false;
    enemy.hp = 0;
    enemy.takeDamage(5);
    expect(enemy.hp).toBe(0); // não vai negativo
    expect(enemy.alive).toBe(false);
  });

  it('getPixelPos calcula posição em pixels com TILE_SIZE=16', () => {
    const pos = enemy.getPixelPos();
    expect(pos.x).toBe(4 * TILE_SIZE + TILE_SIZE / 2);
    expect(pos.y).toBe(6 * TILE_SIZE + TILE_SIZE / 2);
  });
});
