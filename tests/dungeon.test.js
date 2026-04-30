/**
 * dungeon.test.js — Testes do DungeonSystem
 * Valida os cenários definidos em specs/dungeon.spec.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DungeonSystem } from '../src/systems/DungeonSystem.js';
import { TILE } from '../src/config/constants.js';

describe('DungeonSystem', () => {
  let dungeon;

  beforeEach(() => {
    dungeon = new DungeonSystem(40, 30);
    dungeon.generate(8);
  });

  // Cenário 1 — Bordas sempre WALL
  it('bordas do grid são sempre WALL', () => {
    const { width, height } = dungeon;
    for (let x = 0; x < width; x++) {
      expect(dungeon.getTile(x, 0)).toBe(TILE.WALL);
      expect(dungeon.getTile(x, height - 1)).toBe(TILE.WALL);
    }
    for (let y = 0; y < height; y++) {
      expect(dungeon.getTile(0, y)).toBe(TILE.WALL);
      expect(dungeon.getTile(width - 1, y)).toBe(TILE.WALL);
    }
  });

  // Cenário 2 — Tiles internos das salas são FLOOR
  it('tiles internos das salas são FLOOR', () => {
    expect(dungeon.rooms.length).toBeGreaterThan(0);
    dungeon.rooms.forEach((room) => {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          expect(dungeon.getTile(x, y)).toBe(TILE.FLOOR);
        }
      }
    });
  });

  // Cenário 3 — startPos é FLOOR
  it('startPos aponta para tile FLOOR', () => {
    const { x, y } = dungeon.startPos;
    expect(dungeon.getTile(x, y)).toBe(TILE.FLOOR);
  });

  // Cenário 4 — Acesso fora dos limites retorna WALL
  it('acesso fora dos limites retorna WALL sem erro', () => {
    expect(dungeon.getTile(50, 50)).toBe(TILE.WALL);
    expect(dungeon.getTile(-1, -1)).toBe(TILE.WALL);
    expect(dungeon.getTile(100, 0)).toBe(TILE.WALL);
  });

  // Extra — Fallback funciona
  it('gera ao menos 1 sala (fallback)', () => {
    const d = new DungeonSystem(10, 10);
    d.generate(0); // 0 salas → fallback
    expect(d.rooms.length).toBeGreaterThanOrEqual(1);
  });
});
