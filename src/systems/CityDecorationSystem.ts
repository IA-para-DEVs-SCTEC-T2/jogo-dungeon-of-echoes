import * as Phaser from 'phaser';
import { TILE_SIZE } from '../utils/constants';
import { LAYER_WORLD_BASE } from '../config/sprites-config';
import type { WorldObjectDef } from '../types/town';
import type { TownLabelDef } from '../config/town.config';

export class CityDecorationSystem {
  /**
   * Renderiza objetos do mundo e labels de texto para a cidade.
   * Retorna todos os GameObjects criados para serem adicionados ao _decorObjects
   * da GameScene (destruídos automaticamente no cleanup de área).
   * @param scene        - Cena Phaser onde os objetos serão adicionados
   * @param worldObjects - Objetos do mundo vindos do ProcessedTownLayout
   * @param labels       - Labels de texto vindos do TOWN_CONFIG
   * @returns Array de GameObjects criados
   */
  render(
    scene: Phaser.Scene,
    worldObjects: WorldObjectDef[],
    labels: TownLabelDef[],
  ): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = [];

    for (const obj of worldObjects) {
      const px = obj.gridX * TILE_SIZE + TILE_SIZE / 2;
      const py = obj.gridY * TILE_SIZE + TILE_SIZE / 2;
      objects.push(
        scene.add.sprite(px, py, obj.sprite, obj.frame)
          .setDepth(LAYER_WORLD_BASE + obj.gridY * 10)
          .setScrollFactor(1),
      );
    }

    for (const label of labels) {
      const px = label.x * TILE_SIZE + TILE_SIZE / 2;
      const py = label.y * TILE_SIZE - 2;
      objects.push(
        scene.add.text(px, py, label.text, {
          fontSize: '6px',
          color: label.color,
          fontFamily: 'monospace',
        })
          .setOrigin(0.5, 1)
          .setDepth(label.depth)
          .setScrollFactor(1),
      );
    }

    return objects;
  }
}
