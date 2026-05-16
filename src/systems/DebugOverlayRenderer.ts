import { SemanticGrid, SemanticValue } from './SemanticClassifier';
import { WALL_VARIANT_LUT, computeRawMask, sanitizeMask, WallVariant } from './WallVariantLUT';
import { TILE_SIZE } from '../utils/constants';
import type { RenderCommand } from './DungeonRenderer';

// Modo de visualização de debug.
// 'off' = renderização normal; os outros modos sobrepõem informações visuais.
export type DebugMode = 'semantic' | 'variant' | 'bitmask' | 'off';

// Frames de debug — usa Wall.png como atlas arbitrário.
// Os valores abaixo são cores/frames simbólicos para distinguir categorias.
// Em produção este renderer nunca é instanciado.
const DEBUG_FRAMES = {
  FLOOR:     210,  // pedra clara (Floor.png) — verde simbólico
  WALL_EDGE: 181,  // face frontal cinza
  VOID:      200,  // body escuro
  // Variantes (wall_edge)
  [WallVariant.FACE]:       181,
  [WallVariant.FACE_END_W]: 180,
  [WallVariant.FACE_END_E]: 182,
  [WallVariant.FACE_T]:     181,
  [WallVariant.INNER_NW]:   362,
  [WallVariant.INNER_NE]:   360,
  [WallVariant.BODY]:       200,
} as const;

/**
 * Renderer alternativo para validação visual do autotiling.
 * Substitui o output de DungeonRenderer.buildCommands() quando ativo.
 *
 * Uso no GameScene:
 *   const renderer = new DungeonRenderer();
 *   const commands = debugMode !== 'off'
 *     ? new DebugOverlayRenderer(debugMode).buildCommands(grid, sem)
 *     : renderer.buildCommands(grid, theme, floor);
 */
export class DebugOverlayRenderer {
  constructor(private mode: Exclude<DebugMode, 'off'>) {}

  buildCommands(grid: number[][], sem: SemanticGrid): RenderCommand[] {
    const H = grid.length;
    const W = grid[0]?.length ?? 0;
    const commands: RenderCommand[] = [];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const sv = sem[y][x];
        let frame: number;

        switch (this.mode) {
          case 'semantic':
            frame = sv === SemanticValue.FLOOR
              ? DEBUG_FRAMES.FLOOR
              : sv === SemanticValue.WALL_EDGE
                ? DEBUG_FRAMES.WALL_EDGE
                : DEBUG_FRAMES.VOID;
            break;

          case 'variant':
            if (sv !== SemanticValue.WALL_EDGE) {
              frame = sv === SemanticValue.FLOOR ? DEBUG_FRAMES.FLOOR : DEBUG_FRAMES.VOID;
            } else {
              const variant = WALL_VARIANT_LUT[sanitizeMask(computeRawMask(grid, x, y))];
              frame = DEBUG_FRAMES[variant as keyof typeof DEBUG_FRAMES] ?? DEBUG_FRAMES.WALL_EDGE;
            }
            break;

          case 'bitmask':
            // Renderiza o valor numérico do bitmask como frame index (visual aproximado)
            // Útil para identificar quais masks são mais comuns
            if (sv !== SemanticValue.WALL_EDGE) {
              frame = sv === SemanticValue.FLOOR ? DEBUG_FRAMES.FLOOR : DEBUG_FRAMES.VOID;
            } else {
              const raw = computeRawMask(grid, x, y);
              // Mapeia 0–255 para frames disponíveis no atlas (módulo 20 = colunas Wall.png)
              frame = raw % 20;
            }
            break;
        }

        // Sempre emite RenderCommand para VOID em modo debug (para visualizar)
        commands.push({
          x:       x * TILE_SIZE + TILE_SIZE / 2,
          y:       y * TILE_SIZE + TILE_SIZE / 2,
          texture: sv === SemanticValue.FLOOR ? 'floor' : 'wall',
          frame,
          depth:   0,
        });
      }
    }

    return commands;
  }
}
