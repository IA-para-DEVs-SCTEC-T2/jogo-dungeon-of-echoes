import * as Phaser from 'phaser';
import { TILE_SIZE } from '../utils/constants';

/**
 * FogOfWarSystem — controla a visibilidade dos tiles da dungeon.
 *
 * - Tiles visíveis (raio do player): alpha 1
 * - Tiles visitados mas fora do campo de visão: alpha 0.35
 * - Tiles nunca visitados: alpha 0
 */
export class FogOfWarSystem {
  private _visited = new Set<string>();
  private _visible = new Set<string>();

  /**
   * Atualiza a visibilidade dos tiles com base na posição do player.
   * @param tiles - array de tiles renderizados na cena
   * @param playerGridX - posição X do player no grid
   * @param playerGridY - posição Y do player no grid
   * @param radius - raio de visão em tiles (padrão: 5)
   */
  update(
    tiles: Phaser.GameObjects.Image[],
    playerGridX: number,
    playerGridY: number,
    radius = 5,
  ): void {
    // Recalcular tiles visíveis neste turno (círculo)
    this._visible.clear();
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const key = `${playerGridX + dx},${playerGridY + dy}`;
          this._visible.add(key);
          this._visited.add(key);
        }
      }
    }

    // Aplicar alpha em cada tile baseado no estado de visibilidade
    for (const tile of tiles) {
      // Calcular posição grid a partir da posição pixel do tile
      const gx = Math.round((tile.x - TILE_SIZE / 2) / TILE_SIZE);
      const gy = Math.round((tile.y - TILE_SIZE / 2) / TILE_SIZE);
      const key = `${gx},${gy}`;

      if (this._visible.has(key)) {
        tile.setAlpha(1);
      } else if (this._visited.has(key)) {
        tile.setAlpha(0.35);
      } else {
        tile.setAlpha(0);
      }
    }
  }

  isVisible(gridX: number, gridY: number): boolean {
    return this._visible.has(`${gridX},${gridY}`);
  }

  /** Exporta snapshot dos tiles explorados para persistência no cache de andares. */
  exportVisited(): Set<string> {
    return new Set(this._visited);
  }

  /** Restaura tiles explorados ao revisitar um andar cacheado. */
  importVisited(visited: Set<string>): void {
    for (const key of visited) {
      this._visited.add(key);
    }
  }

  /**
   * Reseta o estado ao trocar de andar ou área.
   * Todos os tiles voltam a ser invisíveis.
   */
  reset(): void {
    this._visited.clear();
    this._visible.clear();
  }
}
