import { getTileSemantics } from './TileSemanticsProvider';

export const enum SemanticValue { FLOOR = 0, WALL_EDGE = 1, VOID = 2 }
export type SemanticGrid = SemanticValue[][];

// Shell por vizinhança CARDINAL (4 dirs) — garante espessura exata de 1 tile.
// Diagonais participam apenas na resolução do bitmask, não aqui.
//
// Resultado:
//   VOID VOID VOID        VOID VOID VOID
//   VOID EDGE VOID   ←   VOID WALL VOID  (diagonal floor NÃO cria EDGE)
//   VOID FLOOR VOID       VOID FLOOR VOID
export function classifyGrid(grid: number[][]): SemanticGrid {
  const H = grid.length;
  const W = grid[0]?.length ?? 0;
  const DIRS_4 = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;

  return grid.map((row, y) =>
    row.map((v, x) => {
      if (getTileSemantics(v).isVisuallyOpen) return SemanticValue.FLOOR;
      for (const [dx, dy] of DIRS_4) {
        const nx = x + dx, ny = y + dy;
        if (ny >= 0 && ny < H && nx >= 0 && nx < W && getTileSemantics(grid[ny][nx]).isVisuallyOpen)
          return SemanticValue.WALL_EDGE;
      }
      return SemanticValue.VOID;
    })
  );
}
