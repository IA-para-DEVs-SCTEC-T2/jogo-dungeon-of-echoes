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
