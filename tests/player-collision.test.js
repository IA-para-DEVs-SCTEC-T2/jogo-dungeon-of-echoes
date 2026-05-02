/**
 * player-collision.test.js — Testes de colisão do Player
 * Valida que o jogador não atravessa paredes e se move corretamente em tiles válidos.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TILE } from '../src/utils/constants';

// Mock mínimo do DungeonGenerator para testes de colisão
function createDungeon(grid) {
  return {
    grid,
    width: grid[0].length,
    height: grid.length,
    rooms: [],
    isWalkable(x, y) {
      if (x < 0 || y < 0 || y >= this.height || x >= this.width) return false;
      return this.grid[y][x] === TILE.FLOOR;
    },
  };
}

// Mock mínimo de Player (sem Phaser)
function createPlayer(gridX, gridY) {
  return {
    gridX,
    gridY,
    hp: 100,
    maxHp: 100,
    xp: 0,
    level: 1,
    attack: 10,
    _lastMoveTime: 0,
    tryMove(dx, dy, dungeon, enemies, now) {
      // Replica a lógica de Player.tryMove sem Phaser
      const MOVE_COOLDOWN = 150;
      if (now - this._lastMoveTime < MOVE_COOLDOWN) return { moved: false, enemy: null };

      const tx = this.gridX + dx;
      const ty = this.gridY + dy;

      if (!dungeon.isWalkable(tx, ty)) return { moved: false, enemy: null };

      const enemy = (enemies ?? []).find((e) => e.alive && e.gridX === tx && e.gridY === ty) ?? null;
      if (enemy) return { moved: false, enemy };

      this.gridX = tx;
      this.gridY = ty;
      this._lastMoveTime = now;
      return { moved: true, enemy: null };
    },
  };
}

// Mapa 5×5: bordas são paredes (0), centro é chão (1)
//   0 0 0 0 0
//   0 1 1 1 0
//   0 1 1 1 0
//   0 1 1 1 0
//   0 0 0 0 0
const WALL = TILE.WALL;
const FLOOR = TILE.FLOOR;
const MAP_5x5 = [
  [WALL,  WALL,  WALL,  WALL,  WALL],
  [WALL,  FLOOR, FLOOR, FLOOR, WALL],
  [WALL,  FLOOR, FLOOR, FLOOR, WALL],
  [WALL,  FLOOR, FLOOR, FLOOR, WALL],
  [WALL,  WALL,  WALL,  WALL,  WALL],
];

describe('Player — colisão com paredes', () => {
  let player, dungeon;

  beforeEach(() => {
    dungeon = createDungeon(MAP_5x5);
    player  = createPlayer(2, 2); // centro do mapa
  });

  it('move para tile de chão válido', () => {
    const result = player.tryMove(1, 0, dungeon, [], 200);
    expect(result.moved).toBe(true);
    expect(player.gridX).toBe(3);
    expect(player.gridY).toBe(2);
  });

  it('não atravessa parede à direita', () => {
    player.gridX = 3;
    const result = player.tryMove(1, 0, dungeon, [], 200);
    expect(result.moved).toBe(false);
    expect(player.gridX).toBe(3);
  });

  it('não atravessa parede à esquerda', () => {
    player.gridX = 1;
    const result = player.tryMove(-1, 0, dungeon, [], 200);
    expect(result.moved).toBe(false);
    expect(player.gridX).toBe(1);
  });

  it('não atravessa parede acima', () => {
    player.gridY = 1;
    const result = player.tryMove(0, -1, dungeon, [], 200);
    expect(result.moved).toBe(false);
    expect(player.gridY).toBe(1);
  });

  it('não atravessa parede abaixo', () => {
    player.gridY = 3;
    const result = player.tryMove(0, 1, dungeon, [], 200);
    expect(result.moved).toBe(false);
    expect(player.gridY).toBe(3);
  });

  it('respeita cooldown de movimento', () => {
    player.tryMove(1, 0, dungeon, [], 200); // move em t=200
    const result = player.tryMove(-1, 0, dungeon, [], 300); // t=300 (100ms < 150ms cooldown)
    expect(result.moved).toBe(false);
    expect(player.gridX).toBe(3); // não voltou
  });

  it('permite movimento após cooldown expirar', () => {
    player.tryMove(1, 0, dungeon, [], 200);           // move em t=200
    const result = player.tryMove(-1, 0, dungeon, [], 360); // t=360 (160ms > 150ms)
    expect(result.moved).toBe(true);
    expect(player.gridX).toBe(2);
  });

  it('retorna o inimigo alvo ao tentar mover para tile ocupado', () => {
    const enemy = { alive: true, gridX: 3, gridY: 2 };
    const result = player.tryMove(1, 0, dungeon, [enemy], 200);
    expect(result.moved).toBe(false);
    expect(result.enemy).toBe(enemy);
  });
});
