import { TILE } from '../utils/constants';
import type { DungeonTheme, TileCategory, AutoTileSet } from '../config/dungeon-themes';

export interface TileRenderData {
  texture: string;
  frame:   number;
  depth?:  number;  // reservado para expansão (chasm overlay, etc.)
}

/**
 * Interpreta o contexto espacial de cada tile (vizinhos cardinais) e resolve
 * qual frame renderizar. Não instancia objetos Phaser — pura lógica de dados.
 *
 * Extensão futura: adicionar novos TileCategory em dungeon-themes.ts e o case
 * correspondente em resolveCategory(). Nenhuma alteração aqui é necessária.
 */
export class AutoTileResolver {

  /** Determina a categoria semântica de um tile pelo seu valor no grid. */
  resolveCategory(grid: number[][], x: number, y: number): TileCategory {
    const v = grid[y]?.[x];
    if (v === TILE.FLOOR) return 'floor';
    if (v === TILE.WALL)  return 'wall';
    // Expansão futura: TILE.WATER, TILE.DOOR, TILE.LAVA, etc.
    return 'wall'; // fallback seguro — tile desconhecido age como parede
  }

  /**
   * Resolve o frame visual de um tile em (x, y) com base nos vizinhos.
   * @param grid     - Grid procedural (WALL/FLOOR/…)
   * @param x, y     - Posição do tile
   * @param theme    - Tema visual do andar
   * @param floorNum - Número do andar (usado na variação determinística)
   */
  resolve(
    grid:     number[][],
    x:        number,
    y:        number,
    theme:    DungeonTheme,
    floorNum: number,
  ): TileRenderData {
    const category = this.resolveCategory(grid, x, y);
    const tileSet  = theme.autoTileSets[category];

    if (!tileSet) {
      return { texture: 'wall', frame: 0 }; // categoria sem dados → fallback neutro
    }

    if (category === 'floor') {
      return {
        texture: 'floor',
        frame:   this._pickDeterministic(tileSet.bodyFrames, x, y, floorNum, 0),
      };
    }

    // ── Tiles com borda (wall, pillar, chasm, …) ──────────────────────────────
    const sOpen = !this._isSameOrOob(grid, category, x,     y + 1);
    const eOpen = !this._isSameOrOob(grid, category, x + 1, y    );
    const wOpen = !this._isSameOrOob(grid, category, x - 1, y    );

    // Face superior visível (sul aberto) — escolhe canto ou face reta
    if (sOpen) {
      if (wOpen && !eOpen) return { texture: 'wall', frame: tileSet.cornerOuter_TL };
      if (eOpen && !wOpen) return { texture: 'wall', frame: tileSet.cornerOuter_TR };
      return { texture: 'wall', frame: tileSet.face };
    }

    // Cantos côncavos (inner corners) — detectados via diagonal quando disponíveis
    if (tileSet.cornerInner_TL !== undefined && eOpen) {
      const seOpen = !this._isSameOrOob(grid, category, x + 1, y + 1);
      if (seOpen) return { texture: 'wall', frame: tileSet.cornerInner_TL };
    }
    if (tileSet.cornerInner_TR !== undefined && wOpen) {
      const swOpen = !this._isSameOrOob(grid, category, x - 1, y + 1);
      if (swOpen) return { texture: 'wall', frame: tileSet.cornerInner_TR };
    }

    // Corpo sólido — variação determinística por posição
    return {
      texture: 'wall',
      frame:   this._pickDeterministic(tileSet.bodyFrames, x, y, floorNum, 1),
    };
  }

  /**
   * Retorna true se o vizinho em (gx, gy) é da mesma categoria que `category`
   * OU está fora dos limites do grid (borda tratada como "mesmo tipo").
   */
  private _isSameOrOob(
    grid:     number[][],
    category: TileCategory,
    gx:       number,
    gy:       number,
  ): boolean {
    if (gy < 0 || gy >= grid.length || gx < 0 || gx >= (grid[0]?.length ?? 0)) return true;
    return this.resolveCategory(grid, gx, gy) === category;
  }

  /**
   * Hash determinístico: mesmo (x, y, floor) sempre retorna o mesmo índice.
   * `salt` diferencia a seleção entre floor e body para evitar padrões idênticos.
   */
  private _pickDeterministic(
    frames: number[],
    x:      number,
    y:      number,
    floor:  number,
    salt:   number,
  ): number {
    const hash = ((x * 2654435761) ^ (y * 2246822519) ^ (floor * 374761393) ^ (salt * 1234567891)) >>> 0;
    return frames[hash % frames.length];
  }
}
