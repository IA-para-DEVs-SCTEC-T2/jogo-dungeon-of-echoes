/**
 * constants.test.js — Valida os valores críticos de configuração da v0.1.1
 * Garante que alterações acidentais nas constantes sejam detectadas.
 */

import { describe, it, expect } from 'vitest';
import {
  TILE_SIZE,
  DUNGEON,
  TILE,
  DAWNLIKE_FRAMES,
  SPRITES,
} from '../src/utils/constants';

describe('Constantes de configuração (v0.1.1)', () => {
  it('TILE_SIZE é 16 (Dawnlike nativo)', () => {
    expect(TILE_SIZE).toBe(16);
  });

  it('grid da dungeon é 40×40', () => {
    expect(DUNGEON.WIDTH).toBe(40);
    expect(DUNGEON.HEIGHT).toBe(40);
  });

  it('TILE.WALL=0 e TILE.FLOOR=1', () => {
    expect(TILE.WALL).toBe(0);
    expect(TILE.FLOOR).toBe(1);
  });

  it('DAWNLIKE_FRAMES tem as chaves obrigatórias do tileset', () => {
    expect(DAWNLIKE_FRAMES).toHaveProperty('FLOOR');
    expect(DAWNLIKE_FRAMES).toHaveProperty('WALL');
    expect(DAWNLIKE_FRAMES).toHaveProperty('PLAYER');
    expect(DAWNLIKE_FRAMES).toHaveProperty('ENEMY');
    expect(DAWNLIKE_FRAMES).toHaveProperty('PLATINO');
  });

  it('SPRITES tem as chaves de todos os spritesheets carregados', () => {
    expect(SPRITES).toHaveProperty('FLOOR');
    expect(SPRITES).toHaveProperty('WALL');
    expect(SPRITES).toHaveProperty('PLAYER');
    expect(SPRITES).toHaveProperty('ENEMY');
    expect(SPRITES).toHaveProperty('PLATINO'); // easter egg obrigatório CC-BY
  });
});
