/**
 * fog-of-war.test.js — Testes do FogOfWarSystem
 *
 * O FogOfWarSystem não depende de Phaser diretamente — apenas chama
 * tile.setAlpha(). Por isso podemos mockar tiles como objetos simples
 * { x, y, setAlpha: vi.fn() } sem precisar de um ambiente Phaser real.
 *
 * TILE_SIZE = 16 (de constants.ts)
 * Fórmula de conversão pixel → grid:
 *   gx = Math.round((tile.x - TILE_SIZE / 2) / TILE_SIZE)
 *   gy = Math.round((tile.y - TILE_SIZE / 2) / TILE_SIZE)
 *
 * Portanto, para um tile na posição grid (gx, gy):
 *   tile.x = gx * TILE_SIZE + TILE_SIZE / 2
 *   tile.y = gy * TILE_SIZE + TILE_SIZE / 2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FogOfWarSystem } from '../src/systems/FogOfWarSystem';
import { TILE_SIZE } from '../src/utils/constants';

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Cria um tile mock na posição grid (gx, gy).
 * O setAlpha é um spy para verificar quais valores foram aplicados.
 */
function makeTile(gx, gy) {
  return {
    x: gx * TILE_SIZE + TILE_SIZE / 2,
    y: gy * TILE_SIZE + TILE_SIZE / 2,
    setAlpha: vi.fn(),
  };
}

/**
 * Retorna o último valor passado para setAlpha de um tile.
 * Útil para verificar o estado final após múltiplas chamadas.
 */
function lastAlpha(tile) {
  const calls = tile.setAlpha.mock.calls;
  return calls.length > 0 ? calls[calls.length - 1][0] : undefined;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('FogOfWarSystem — visibilidade inicial', () => {
  let fog;

  beforeEach(() => {
    fog = new FogOfWarSystem();
  });

  it('tile na posição exata do player fica com alpha 1', () => {
    const tile = makeTile(5, 5);
    fog.update([tile], 5, 5, 3);
    expect(lastAlpha(tile)).toBe(1);
  });

  it('tile dentro do raio fica com alpha 1', () => {
    // player em (10, 10), raio 3 — tile em (12, 10) está a distância 2
    const tile = makeTile(12, 10);
    fog.update([tile], 10, 10, 3);
    expect(lastAlpha(tile)).toBe(1);
  });

  it('tile exatamente na borda do raio fica com alpha 1', () => {
    // player em (5, 5), raio 3 — tile em (8, 5) está a distância exata 3
    const tile = makeTile(8, 5);
    fog.update([tile], 5, 5, 3);
    expect(lastAlpha(tile)).toBe(1);
  });

  it('tile fora do raio nunca visitado fica com alpha 0', () => {
    // player em (5, 5), raio 3 — tile em (10, 5) está a distância 5
    const tile = makeTile(10, 5);
    fog.update([tile], 5, 5, 3);
    expect(lastAlpha(tile)).toBe(0);
  });

  it('tile na diagonal dentro do raio circular fica com alpha 1', () => {
    // player em (5, 5), raio 3 — tile em (7, 7): dx=2, dy=2 → dist²=8 ≤ 9
    const tile = makeTile(7, 7);
    fog.update([tile], 5, 5, 3);
    expect(lastAlpha(tile)).toBe(1);
  });

  it('tile na diagonal fora do raio circular fica com alpha 0', () => {
    // player em (5, 5), raio 3 — tile em (8, 8): dx=3, dy=3 → dist²=18 > 9
    const tile = makeTile(8, 8);
    fog.update([tile], 5, 5, 3);
    expect(lastAlpha(tile)).toBe(0);
  });
});

describe('FogOfWarSystem — tiles visitados', () => {
  let fog;

  beforeEach(() => {
    fog = new FogOfWarSystem();
  });

  it('tile visitado mas fora do campo de visão atual fica com alpha 0.35', () => {
    const tile = makeTile(5, 5);

    // Primeira chamada: player em (5, 5) — tile fica visível (alpha 1)
    fog.update([tile], 5, 5, 2);
    expect(lastAlpha(tile)).toBe(1);

    // Segunda chamada: player se move para (10, 10) — tile sai do raio
    fog.update([tile], 10, 10, 2);
    expect(lastAlpha(tile)).toBe(0.35);
  });

  it('tile visitado volta a alpha 1 quando o player retorna ao raio', () => {
    const tile = makeTile(5, 5);

    fog.update([tile], 5, 5, 2);   // visível
    fog.update([tile], 10, 10, 2); // visitado (fora do raio)
    fog.update([tile], 5, 5, 2);   // volta ao raio

    expect(lastAlpha(tile)).toBe(1);
  });

  it('múltiplos tiles: cada um recebe o alpha correto conforme posição', () => {
    const tileVisivel   = makeTile(5, 5);  // dentro do raio
    const tileVisitado  = makeTile(0, 0);  // fora do raio, mas será visitado antes
    const tileNaoVisto  = makeTile(20, 20); // nunca visitado

    // Primeira passagem: player em (0, 0) — tileVisitado fica visível
    fog.update([tileVisivel, tileVisitado, tileNaoVisto], 0, 0, 2);

    // Segunda passagem: player em (5, 5) — tileVisivel fica visível, tileVisitado fica escurecido
    fog.update([tileVisivel, tileVisitado, tileNaoVisto], 5, 5, 2);

    expect(lastAlpha(tileVisivel)).toBe(1);
    expect(lastAlpha(tileVisitado)).toBe(0.35);
    expect(lastAlpha(tileNaoVisto)).toBe(0);
  });
});

describe('FogOfWarSystem — reset()', () => {
  let fog;

  beforeEach(() => {
    fog = new FogOfWarSystem();
  });

  it('após reset(), tile anteriormente visitado fica com alpha 0', () => {
    const tile = makeTile(5, 5);

    fog.update([tile], 5, 5, 2);  // visível
    fog.reset();
    fog.update([tile], 10, 10, 2); // player longe — tile não está no raio

    expect(lastAlpha(tile)).toBe(0); // não visitado após reset
  });

  it('após reset(), tile no raio do player fica com alpha 1 normalmente', () => {
    const tile = makeTile(5, 5);

    fog.update([tile], 5, 5, 2);
    fog.reset();
    fog.update([tile], 5, 5, 2); // player volta ao mesmo lugar

    expect(lastAlpha(tile)).toBe(1);
  });

  it('reset() pode ser chamado sem update() anterior sem erros', () => {
    expect(() => fog.reset()).not.toThrow();
  });
});

describe('FogOfWarSystem — raio customizado', () => {
  let fog;

  beforeEach(() => {
    fog = new FogOfWarSystem();
  });

  it('raio 1 só ilumina tiles imediatamente adjacentes', () => {
    const tileAdjacente = makeTile(6, 5); // distância 1
    const tileLonge     = makeTile(7, 5); // distância 2

    fog.update([tileAdjacente, tileLonge], 5, 5, 1);

    expect(lastAlpha(tileAdjacente)).toBe(1);
    expect(lastAlpha(tileLonge)).toBe(0);
  });

  it('raio 0 só ilumina o tile exato do player', () => {
    const tilePlayer    = makeTile(5, 5);
    const tileAdjacente = makeTile(6, 5);

    fog.update([tilePlayer, tileAdjacente], 5, 5, 0);

    expect(lastAlpha(tilePlayer)).toBe(1);
    expect(lastAlpha(tileAdjacente)).toBe(0);
  });

  it('raio padrão (5) ilumina tile a distância 5 na horizontal', () => {
    const tile = makeTile(10, 5); // distância 5 de (5, 5)
    fog.update([tile], 5, 5); // sem passar raio — usa padrão 5
    expect(lastAlpha(tile)).toBe(1);
  });

  it('raio padrão (5) não ilumina tile a distância 6', () => {
    const tile = makeTile(11, 5); // distância 6 de (5, 5)
    fog.update([tile], 5, 5); // raio padrão 5
    expect(lastAlpha(tile)).toBe(0);
  });
});

describe('FogOfWarSystem — casos extremos', () => {
  let fog;

  beforeEach(() => {
    fog = new FogOfWarSystem();
  });

  it('array de tiles vazio não lança erro', () => {
    expect(() => fog.update([], 5, 5, 3)).not.toThrow();
  });

  it('setAlpha é chamado uma vez por tile por update()', () => {
    const tile = makeTile(5, 5);
    fog.update([tile], 5, 5, 3);
    expect(tile.setAlpha).toHaveBeenCalledTimes(1);
  });

  it('múltiplos updates acumulam tiles visitados corretamente', () => {
    const tileA = makeTile(0, 0);
    const tileB = makeTile(10, 0);

    fog.update([tileA, tileB], 0, 0, 2);  // tileA visível, tileB não visto
    fog.update([tileA, tileB], 10, 0, 2); // tileB visível, tileA visitado

    expect(lastAlpha(tileA)).toBe(0.35);
    expect(lastAlpha(tileB)).toBe(1);
  });
});
