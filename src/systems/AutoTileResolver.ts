import { TILE } from '../utils/constants';
import type { DungeonTheme, TileCategory, AutoTileSet, BitmaskFrameSet } from '../config/dungeon-themes';
import { SemanticGrid, SemanticValue } from './SemanticClassifier';
import { WallVariant, WALL_VARIANT_LUT, computeRawMask, sanitizeMask } from './WallVariantLUT';

export interface TileRenderData {
  texture: string;
  frame:   number;
  depth?:  number;  // reservado para expansão (chasm overlay, etc.)
}

/**
 * Interpreta o contexto espacial de cada tile e resolve qual frame renderizar.
 * Não instancia objetos Phaser — pura lógica de dados.
 *
 * Recebe SemanticGrid para distinguir FLOOR / WALL_EDGE / VOID.
 * VOID é tratado no DungeonRenderer (tile skipado antes de chegar aqui).
 */
export class AutoTileResolver {

  /** Determina a categoria semântica de um tile via SemanticGrid. */
  resolveCategory(sem: SemanticGrid, x: number, y: number): TileCategory {
    const s = sem[y]?.[x];
    if (s === SemanticValue.FLOOR)     return 'floor';
    if (s === SemanticValue.WALL_EDGE) return 'wall_edge';
    return 'void';
  }

  /**
   * Resolve o frame visual de um tile em (x, y).
   * Retorna null para VOID — DungeonRenderer já filtra, mas como proteção extra.
   *
   * @param grid     - Grid procedural (fonte de verdade para bitmask)
   * @param sem      - Grid semântico pré-calculado (FLOOR/WALL_EDGE/VOID)
   * @param x, y     - Posição do tile
   * @param theme    - Tema visual do andar
   * @param floorNum - Número do andar (usado na variação determinística de floor)
   */
  resolve(
    grid:     number[][],
    sem:      SemanticGrid,
    x:        number,
    y:        number,
    theme:    DungeonTheme,
    floorNum: number,
  ): TileRenderData | null {
    const category = this.resolveCategory(sem, x, y);

    if (category === 'void') return null;

    if (category === 'floor') {
      const tileSet = theme.autoTileSets['floor'];
      if (!tileSet) return { texture: 'floor', frame: 0 };
      return {
        texture: 'floor',
        frame:   this._pickDeterministic(tileSet.bodyFrames, x, y, floorNum, 0),
      };
    }

    if (category === 'wall_edge') {
      const tileSet = theme.autoTileSets['wall_edge'] ?? theme.autoTileSets['wall'];
      if (!tileSet) return { texture: 'wall', frame: 0 };

      // Bitmask 8-bit — usa isVisuallyOpen, atlas-agnostic
      if (tileSet.bitmaskFrames) {
        const rawMask = computeRawMask(grid, x, y);
        const mask    = sanitizeMask(rawMask);
        const variant = WALL_VARIANT_LUT[mask];
        return { texture: 'wall', frame: this._frameForVariant(variant, tileSet.bitmaskFrames) };
      }

      // Fallback: lógica 4-vizinhos legada (temas não migrados continuam funcionando)
      return this._resolveLegacyWall(grid, x, y, tileSet, floorNum);
    }

    // Categorias futuras (water, lava, etc.) — fallback legado
    const tileSet = theme.autoTileSets[category as TileCategory];
    if (!tileSet) return { texture: 'wall', frame: 0 };
    return this._resolveLegacyWall(grid, x, y, tileSet, floorNum);
  }

  // ── Métodos privados ────────────────────────────────────────────────────────

  private _frameForVariant(variant: WallVariant, bf: BitmaskFrameSet): number {
    switch (variant) {
      case WallVariant.FACE:      return bf.face;
      case WallVariant.FACE_END_W: return bf.faceEndW;
      case WallVariant.FACE_END_E: return bf.faceEndE;
      case WallVariant.FACE_T:    return bf.faceT;
      case WallVariant.INNER_NW:  return bf.innerNW;
      case WallVariant.INNER_NE:  return bf.innerNE;
      case WallVariant.BODY:      return bf.body;
      default:                    return bf.face;
    }
  }

  private _resolveLegacyWall(
    grid:     number[][],
    x:        number,
    y:        number,
    tileSet:  AutoTileSet,
    floorNum: number,
  ): TileRenderData {
    const sOpen = !this._isSameOrOobLegacy(grid, x,     y + 1);
    const eOpen = !this._isSameOrOobLegacy(grid, x + 1, y    );
    const wOpen = !this._isSameOrOobLegacy(grid, x - 1, y    );

    if (sOpen) {
      if (wOpen && !eOpen) return { texture: 'wall', frame: tileSet.cornerOuter_TL };
      if (eOpen && !wOpen) return { texture: 'wall', frame: tileSet.cornerOuter_TR };
      return { texture: 'wall', frame: tileSet.face };
    }

    if (tileSet.cornerInner_TL !== undefined && eOpen) {
      const seOpen = !this._isSameOrOobLegacy(grid, x + 1, y + 1);
      if (seOpen) return { texture: 'wall', frame: tileSet.cornerInner_TL };
    }
    if (tileSet.cornerInner_TR !== undefined && wOpen) {
      const swOpen = !this._isSameOrOobLegacy(grid, x - 1, y + 1);
      if (swOpen) return { texture: 'wall', frame: tileSet.cornerInner_TR };
    }

    return {
      texture: 'wall',
      frame:   this._pickDeterministic(tileSet.bodyFrames, x, y, floorNum, 1),
    };
  }

  // Versão legada de _isSameOrOob — usa valor raw do grid, não SemanticGrid
  private _isSameOrOobLegacy(grid: number[][], gx: number, gy: number): boolean {
    if (gy < 0 || gy >= grid.length || gx < 0 || gx >= (grid[0]?.length ?? 0)) return true;
    return grid[gy][gx] !== TILE.FLOOR;
  }

  /**
   * Hash determinístico: mesmo (x, y, floor) sempre retorna o mesmo índice.
   * `salt` diferencia a seleção entre floor e body.
   */
  private _pickDeterministic(
    frames: number[],
    x:      number,
    y:      number,
    floor:  number,
    salt:   number,
  ): number {
    if (frames.length === 0) return 0;
    const hash = ((x * 2654435761) ^ (y * 2246822519) ^ (floor * 374761393) ^ (salt * 1234567891)) >>> 0;
    return frames[hash % frames.length];
  }
}
