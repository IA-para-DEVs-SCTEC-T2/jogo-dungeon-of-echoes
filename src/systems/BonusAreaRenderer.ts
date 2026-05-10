import * as Phaser from 'phaser';
import { TILE_SIZE, TILE } from '../utils/constants';
import { LAYER_GROUND, LAYER_WORLD_BASE } from '../config/sprites-config';
import { BONUS_W, BONUS_H, BONUS_AREA_OVERRIDES, BONUS_AREA_NPCS } from '../config/BonusAreaData';
import type { NPCInstanceDef } from '../types/town';
import { TMX_TILESETS } from '../config/TownTMXData';

// Quando true, exibe "x,y" sobre cada tile e ativa o debug de clique
const DEBUG_SHOW_COORDINATES = true;

// Resolve forceGid → { textureKey, frame } usando os tilesets do TMX da cidade
function resolveForceGid(gid: number): { textureKey: string; frame: number } | null {
  for (const ts of TMX_TILESETS) {
    if (gid >= ts.firstgid) {
      return { textureKey: ts.textureKey, frame: gid - ts.firstgid };
    }
  }
  return null;
}

export interface BonusAreaResult {
  tileObjects:   Phaser.GameObjects.Image[];
  collisionGrid: number[][];
  npcSpawns:     NPCInstanceDef[];
  debugDispose:  () => void;
}

export class BonusAreaRenderer {
  render(scene: Phaser.Scene): BonusAreaResult {
    const tileObjects:   Phaser.GameObjects.Image[] = [];
    const coordLabels:   Phaser.GameObjects.Text[]  = [];
    const npcSpawns:     NPCInstanceDef[]           = [...BONUS_AREA_NPCS];

    const collisionGrid: number[][] = Array.from({ length: BONUS_H }, (_, y) =>
      Array.from({ length: BONUS_W }, (_, x) => {
        const override = BONUS_AREA_OVERRIDES[`${x},${y}`];
        if (override?.walkable === false) return TILE.WALL;
        if (y === 0 || x === 0 || x === BONUS_W - 1) return TILE.WALL;
        return TILE.FLOOR;
      }),
    );

    // Renderiza chão
    for (let gy = 0; gy < BONUS_H; gy++) {
      for (let gx = 0; gx < BONUS_W; gx++) {
        const px = gx * TILE_SIZE + TILE_SIZE / 2;
        const py = gy * TILE_SIZE + TILE_SIZE / 2;
        const override = BONUS_AREA_OVERRIDES[`${gx},${gy}`];

        let tex   = 'floor';
        let frame = 155; // grama padrão
        if (override?.forceGid !== undefined) {
          const resolved = resolveForceGid(override.forceGid);
          if (resolved) { tex = resolved.textureKey; frame = resolved.frame; }
        }

        tileObjects.push(
          scene.add.image(px, py, tex, frame).setDepth(LAYER_GROUND),
        );

        if (DEBUG_SHOW_COORDINATES) {
          coordLabels.push(
            scene.add.text(px - TILE_SIZE / 2, py - TILE_SIZE / 2, `${gx},${gy}`, {
              fontSize: '4px', fontFamily: 'monospace', color: '#ffffff55',
            }).setDepth(LAYER_WORLD_BASE - 1),
          );
        }

        // Objetos interativos estáticos (interaction em BONUS_AREA_OVERRIDES)
        if (override?.interaction) {
          npcSpawns.push({
            id:            `bonus-sign-${gx}-${gy}`,
            gridX:         gx,
            gridY:         gy,
            sprite:        'decor0',
            frame:         0,
            name:          override.npcName ?? 'Placa',
            state:         'idle',
            interactRange: 1,
            interaction:   override.interaction,
          });
        }
      }
    }

    let debugDispose = () => {};

    if (DEBUG_SHOW_COORDINATES) {
      const label = scene.add.text(8, 8, 'clique num tile...', {
        fontSize: '12px', fontFamily: 'monospace', color: '#00ffff',
        backgroundColor: '#000000dd', padding: { x: 5, y: 3 },
      }).setDepth(9999).setScrollFactor(0);

      let coordsVisible = true;
      const uiScene = scene.game.scene.getScene('UIScene') ?? scene;
      const { height } = uiScene.scale;
      const toggleBtn = uiScene.add.text(8, height - 28, '[ coords: ON ]', {
        fontSize: '12px', fontFamily: 'monospace', color: '#00ff00',
        backgroundColor: '#000000dd', padding: { x: 5, y: 3 },
      }).setDepth(99999).setScrollFactor(0).setInteractive({ useHandCursor: true });

      toggleBtn.on('pointerdown', () => {
        coordsVisible = !coordsVisible;
        coordLabels.forEach(t => t.setVisible(coordsVisible));
        toggleBtn.setText(coordsVisible ? '[ coords: ON ]' : '[ coords: OFF ]');
        toggleBtn.setColor(coordsVisible ? '#00ff00' : '#ff4444');
      });

      const onPointerDown = (pointer: Phaser.Input.Pointer) => {
        const cam = scene.cameras.main;
        const wp  = cam.getWorldPoint(pointer.x, pointer.y);
        const gx  = Math.floor(wp.x / TILE_SIZE);
        const gy  = Math.floor(wp.y / TILE_SIZE);
        const key = `${gx},${gy}`;
        label.setText(`tile: ${key}`);

        const override = BONUS_AREA_OVERRIDES[key];
        const inBounds = gx >= 0 && gy >= 0 && gx < BONUS_W && gy < BONUS_H;
        const lines: string[] = [
          `[DEBUG bonus] (${gx}, ${gy}) | world(${wp.x.toFixed(1)}, ${wp.y.toFixed(1)})`,
          `  → use '${key}' em BONUS_AREA_OVERRIDES`,
        ];
        if (!inBounds) lines.push('  ⚠ fora dos limites do mapa');
        if (override)  lines.push(`  Override atual: ${JSON.stringify(override)}`);
        else           lines.push('  Sem override — chão padrão (grama, floor frame 155)');
        console.log(lines.join('\n'));
      };

      scene.input.on('pointerdown', onPointerDown);

      debugDispose = () => {
        scene.input.off('pointerdown', onPointerDown);
        label.destroy();
        toggleBtn.destroy();
        coordLabels.forEach(t => t.destroy());
      };
    }

    return { tileObjects, collisionGrid, npcSpawns, debugDispose };
  }
}
