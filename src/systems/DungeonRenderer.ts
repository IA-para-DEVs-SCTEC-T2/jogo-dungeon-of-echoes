import { TILE_SIZE } from '../utils/constants';
import { AutoTileResolver } from './AutoTileResolver';
import type { DungeonTheme } from '../config/dungeon-themes';

export interface RenderCommand {
  x:       number;  // posição em pixels (centro do tile)
  y:       number;
  texture: string;
  frame:   number;
  depth:   number;
}

/**
 * Itera o grid procedural, delega a resolução visual ao AutoTileResolver
 * e retorna uma lista de RenderCommands.
 *
 * Não conhece Phaser.Scene — não instancia GameObjects.
 * GameScene consome os comandos e cria os sprites.
 */
export class DungeonRenderer {
  private _resolver = new AutoTileResolver();

  buildCommands(
    grid:      number[][],
    theme:     DungeonTheme,
    floor:     number,
    baseDepth: number = 0,
  ): RenderCommand[] {
    const commands: RenderCommand[] = [];
    const H = grid.length;
    const W = grid[0]?.length ?? 0;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const data = this._resolver.resolve(grid, x, y, theme, floor);
        commands.push({
          x:       x * TILE_SIZE + TILE_SIZE / 2,
          y:       y * TILE_SIZE + TILE_SIZE / 2,
          texture: data.texture,
          frame:   data.frame,
          depth:   data.depth ?? baseDepth,
        });
      }
    }

    return commands;
  }
}
