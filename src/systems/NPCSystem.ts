import * as Phaser from 'phaser';
import { TILE_SIZE } from '../utils/constants';
import type { TownConfig } from '../config/town.config';

export class NPCSystem {
  private _sprites: Phaser.GameObjects.Sprite[] = [];

  /**
   * Cria sprites estáticos para os NPCs definidos no config.
   * Retorna os sprites para que possam ser adicionados ao _decorObjects
   * da GameScene (destruídos automaticamente no cleanup de área).
   */
  spawn(scene: Phaser.Scene, config: TownConfig): Phaser.GameObjects.Sprite[] {
    this._sprites = [];

    for (const npc of config.npcs) {
      const px = npc.x * TILE_SIZE + TILE_SIZE / 2;
      const py = npc.y * TILE_SIZE + TILE_SIZE / 2;
      const sprite = scene.add
        .sprite(px, py, npc.sprite, npc.frame)
        .setDepth(5)
        .setScrollFactor(1);
      this._sprites.push(sprite);
    }

    return this._sprites;
  }

  /** Destrói todos os sprites de NPC (chamado no cleanup de área). */
  destroy(): void {
    this._sprites.forEach(s => s.destroy());
    this._sprites = [];
  }
}
