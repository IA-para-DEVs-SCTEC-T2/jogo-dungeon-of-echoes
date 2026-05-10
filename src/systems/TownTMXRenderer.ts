import * as Phaser from 'phaser';
import { TILE_SIZE, TILE } from '../utils/constants';
import { LAYER_GROUND, LAYER_OVERHEAD } from '../config/sprites-config';
import {
  TMX_WIDTH, TMX_HEIGHT,
  TMX_PAD_X, TMX_PAD_Y, TOWN_TOTAL_W, TOWN_TOTAL_H,
  TMX_TILES_LAYER, TMX_SPRITES_LAYER,
  SPRITE_EMPTY_GIDS,
  TMX_NPC_OVERRIDES,
  resolveGid,
} from '../config/TownTMXData';
import { getTileProp, MANUAL_MAP_OVERRIDES } from '../config/TileProperties';
import type { NPCInstanceDef } from '../types/town';

// GID ranges dos tilesets
const WALL_LAST    = 1020;   // Wall.png — paredes sólidas no Tiles layer
const DOOR0_FIRST  = 2096;   const DOOR0_LAST  = 2135;
const TREE0_FIRST  = 2488;   const TREE0_LAST  = 2751;
const TREE0_EMPTY_LAST = TREE0_FIRST + 47;  // frames 0–47 são pretos/vazios (linhas 0–3 do Tree0.png)
const HUMAN0_FIRST = 2752;   const HUMAN0_LAST = 2967;
const CAT0_FIRST   = 2968;   const CAT0_LAST   = 3007;
const QUAD0_FIRST  = 3008;   const QUAD0_LAST  = 3103;
const CHEST0_FIRST = 3104;

const GID_MASK = 0x1FFFFFFF;

// Quando true, exibe "tmxX,tmxY" sobre cada tile — útil para identificar coordenadas
// de tiles problemáticos e adicioná-los em MANUAL_MAP_OVERRIDES (TileProperties.ts).
const DEBUG_SHOW_COORDINATES = true;

const STONE_PATH_FIRST  = 1147;
const STONE_PATH_LAST   = 1200;
const ROAD_EXTEND_TILES = 3;

function weightedGrassFrame(worldX: number, worldY: number): number {
  const h = (worldX * 7 + worldY * 13) % 100;
  if (h < 60) return 16;
  if (h < 90) return 17;
  return 18;
}

function rawToGid(raw: number): number {
  return raw & GID_MASK;
}

function borderStonePathGid(tmxX: number, tmxY: number): number | null {
  const bx = Math.max(0, Math.min(TMX_WIDTH  - 1, tmxX));
  const by = Math.max(0, Math.min(TMX_HEIGHT - 1, tmxY));
  const gid = rawToGid(TMX_TILES_LAYER[by * TMX_WIDTH + bx]);
  return (gid >= STONE_PATH_FIRST && gid <= STONE_PATH_LAST) ? gid : null;
}

function inRange(gid: number, first: number, last: number): boolean {
  return gid >= first && gid <= last;
}

function npcDefaultInteraction(gid: number): NPCInstanceDef['interaction'] {
  if (inRange(gid, CAT0_FIRST,  CAT0_LAST))  return { type: 'dialogue', message: 'Miau.' };
  if (inRange(gid, QUAD0_FIRST, QUAD0_LAST)) return { type: 'dialogue', message: '*relincha*' };
  return { type: 'dialogue', message: 'Olá, aventureiro!' };
}

function npcDefaultName(gid: number): string {
  if (inRange(gid, CAT0_FIRST,  CAT0_LAST))  return 'Gato';
  if (inRange(gid, QUAD0_FIRST, QUAD0_LAST)) return 'Animal';
  const local = gid - HUMAN0_FIRST;
  if (local < 8)  return 'Mercador';
  if (local < 16) return 'Guarda';
  return 'Estalajadeiro';
}

function npcSpriteFromGid(gid: number): { sprite: string; frame: number } {
  if (inRange(gid, CAT0_FIRST,  CAT0_LAST))  return { sprite: 'cat0',      frame: gid - CAT0_FIRST };
  if (inRange(gid, QUAD0_FIRST, QUAD0_LAST)) return { sprite: 'quad0',     frame: gid - QUAD0_FIRST };
  return { sprite: 'humanoid0', frame: gid - HUMAN0_FIRST };
}

export interface TownTMXResult {
  collisionGrid: number[][];
  npcSpawns:     NPCInstanceDef[];
  tileObjects:   Phaser.GameObjects.Image[];
}

export class TownTMXRenderer {
  render(scene: Phaser.Scene): TownTMXResult {
    const tileObjects: Phaser.GameObjects.Image[] = [];
    const npcSpawns:   NPCInstanceDef[]           = [];
    const coordLabels: Phaser.GameObjects.Text[]  = [];

    // Grid de colisão do tamanho total (com padding de grama)
    const collisionGrid: number[][] = Array.from(
      { length: TOWN_TOTAL_H },
      () => new Array(TOWN_TOTAL_W).fill(TILE.FLOOR),
    );

    // ── Grama de preenchimento ao redor do mapa TMX ──────────────────────────
    // Usamos soma determinística das coordenadas para variar frames sem Math.random
    for (let worldY = 0; worldY < TOWN_TOTAL_H; worldY++) {
      for (let worldX = 0; worldX < TOWN_TOTAL_W; worldX++) {
        const tmxX = worldX - TMX_PAD_X;
        const tmxY = worldY - TMX_PAD_Y;
        const inTMX = tmxX >= 0 && tmxX < TMX_WIDTH && tmxY >= 0 && tmxY < TMX_HEIGHT;
        if (inTMX) continue; // células TMX são tratadas nos loops abaixo

        const coordKey = `${tmxX},${tmxY}`;
        const manualOverride = MANUAL_MAP_OVERRIDES[coordKey];
        const px = worldX * TILE_SIZE + TILE_SIZE / 2;
        const py = worldY * TILE_SIZE + TILE_SIZE / 2;

        if (manualOverride?.forceGid !== undefined) {
          const resolved = resolveGid(manualOverride.forceGid);
          if (resolved) {
            tileObjects.push(
              scene.add
                .image(px, py, resolved.textureKey, resolved.frame)
                .setDepth(LAYER_GROUND)
                .setFlipX(resolved.flipX)
                .setFlipY(resolved.flipY),
            );
          }
          if (manualOverride.overlayGid !== undefined) {
            const overlayResolved = resolveGid(manualOverride.overlayGid);
            if (overlayResolved) {
              tileObjects.push(
                scene.add
                  .image(px, py, overlayResolved.textureKey, overlayResolved.frame)
                  .setDepth(LAYER_GROUND + 1)
                  .setFlipX(overlayResolved.flipX)
                  .setFlipY(overlayResolved.flipY),
              );
            }
          }
          if (manualOverride.walkable === false) {
            collisionGrid[worldY][worldX] = TILE.WALL;
          }
        } else {
          const distFromBorder = Math.max(
            tmxX < 0 ? -(tmxX + 1) : tmxX >= TMX_WIDTH  ? tmxX - TMX_WIDTH  : 0,
            tmxY < 0 ? -(tmxY + 1) : tmxY >= TMX_HEIGHT ? tmxY - TMX_HEIGHT : 0,
          );
          const roadGid = distFromBorder < ROAD_EXTEND_TILES
            ? borderStonePathGid(tmxX, tmxY)
            : null;

          if (roadGid !== null) {
            const resolved = resolveGid(roadGid);
            if (resolved) {
              tileObjects.push(
                scene.add
                  .image(px, py, resolved.textureKey, resolved.frame)
                  .setDepth(LAYER_GROUND)
                  .setFlipX(resolved.flipX)
                  .setFlipY(resolved.flipY),
              );
            }
          } else {
            tileObjects.push(
              scene.add.image(px, py, 'ground', weightedGrassFrame(worldX, worldY)).setDepth(LAYER_GROUND),
            );
          }
        }

        if (DEBUG_SHOW_COORDINATES) {
          coordLabels.push(
            scene.add.text(px - TILE_SIZE / 2, py - TILE_SIZE / 2, coordKey, {
              fontSize: '5px', color: '#ffffff', backgroundColor: '#000000cc',
            }).setDepth(9999).setScrollFactor(1),
          );
        }
      }
    }

    // ── Layer "Tiles" (chão / arquitetura) ───────────────────────────────────
    for (let tmxY = 0; tmxY < TMX_HEIGHT; tmxY++) {
      for (let tmxX = 0; tmxX < TMX_WIDTH; tmxX++) {
        const raw = TMX_TILES_LAYER[tmxY * TMX_WIDTH + tmxX];
        let gid = rawToGid(raw);

        // Override manual — verificar ANTES do skip de gid=0,
        // pois o override pode inserir um tile numa posição vazia do TMX
        const coordKey = `${tmxX},${tmxY}`;
        const manualOverride = MANUAL_MAP_OVERRIDES[coordKey];
        if (manualOverride?.forceGid !== undefined) {
          gid = manualOverride.forceGid;
        } else if (manualOverride?.forceGidLike !== undefined) {
          const [lx, ly] = manualOverride.forceGidLike.split(',').map(Number);
          if (!isNaN(lx) && !isNaN(ly)) {
            // Resolve o GID final da coordenada de referência (respeitando overrides dela)
            const refOverride = MANUAL_MAP_OVERRIDES[`${lx},${ly}`];
            if (refOverride?.forceGid !== undefined) {
              gid = refOverride.forceGid;
            } else {
              gid = rawToGid(TMX_TILES_LAYER[ly * TMX_WIDTH + lx]);
            }
          }
        }

        if (gid === 0) continue;

        const resolved = resolveGid(gid);
        if (!resolved) continue;

        const worldX = tmxX + TMX_PAD_X;
        const worldY = tmxY + TMX_PAD_Y;
        const px = worldX * TILE_SIZE + TILE_SIZE / 2;
        const py = worldY * TILE_SIZE + TILE_SIZE / 2;

        tileObjects.push(
          scene.add
            .image(px, py, resolved.textureKey, resolved.frame)
            .setDepth(LAYER_GROUND)
            .setFlipX(resolved.flipX)
            .setFlipY(resolved.flipY),
        );

        if (manualOverride?.overlayGid !== undefined) {
          const overlayResolved = resolveGid(manualOverride.overlayGid);
          if (overlayResolved) {
            tileObjects.push(
              scene.add
                .image(px, py, overlayResolved.textureKey, overlayResolved.frame)
                .setDepth(LAYER_GROUND + 1)
                .setFlipX(overlayResolved.flipX)
                .setFlipY(overlayResolved.flipY),
            );
          }
        }

        if (DEBUG_SHOW_COORDINATES) {
          coordLabels.push(
            scene.add.text(px - TILE_SIZE / 2, py - TILE_SIZE / 2, coordKey, {
              fontSize: '5px', color: '#ffffff', backgroundColor: '#000000cc',
            }).setDepth(9999).setScrollFactor(1),
          );
        }

        // Colisão: Wall tileset (GID 1–1020) = sólido por padrão
        // Floor tileset (GID >= 1021) = passável por padrão (piso de edifícios e caminhos)
        if (manualOverride?.walkable !== undefined) {
          if (!manualOverride.walkable) collisionGrid[worldY][worldX] = TILE.WALL;
        } else if (gid <= WALL_LAST) {
          const prop = getTileProp(gid);
          if (!prop || !prop.walkable) {
            collisionGrid[worldY][worldX] = TILE.WALL;
          }
        }
        // Floor tileset já está FLOOR (passável) — nenhuma ação necessária
      }
    }

    // ── Layer "Sprites" (objetos / NPCs) ─────────────────────────────────────
    for (let tmxY = 0; tmxY < TMX_HEIGHT; tmxY++) {
      for (let tmxX = 0; tmxX < TMX_WIDTH; tmxX++) {
        const raw = TMX_SPRITES_LAYER[tmxY * TMX_WIDTH + tmxX];
        if (SPRITE_EMPTY_GIDS.has(raw)) continue;

        let gid = rawToGid(raw);
        if (gid === 0 || gid === 7) continue;

        // Override manual — sempre tem prioridade sobre o TMX
        const coordKey = `${tmxX},${tmxY}`;
        const manualOverride = MANUAL_MAP_OVERRIDES[coordKey];
        if (manualOverride?.forceGid !== undefined) {
          gid = manualOverride.forceGid;
        }

        const worldX = tmxX + TMX_PAD_X;
        const worldY = tmxY + TMX_PAD_Y;

        if (DEBUG_SHOW_COORDINATES) {
          const px = worldX * TILE_SIZE + TILE_SIZE / 2;
          const py = worldY * TILE_SIZE + TILE_SIZE / 2;
          coordLabels.push(
            scene.add.text(px - TILE_SIZE / 2, py - TILE_SIZE / 2, coordKey, {
              fontSize: '5px', color: '#ffff00', backgroundColor: '#000000cc',
            }).setDepth(9999).setScrollFactor(1),
          );
        }

        // NPCs — registrar para spawn, não renderizar como imagem estática
        if (inRange(gid, HUMAN0_FIRST, HUMAN0_LAST) ||
            inRange(gid, CAT0_FIRST,   CAT0_LAST)   ||
            inRange(gid, QUAD0_FIRST,  QUAD0_LAST)) {
          const { sprite, frame } = npcSpriteFromGid(gid);
          const override = TMX_NPC_OVERRIDES[`${tmxX},${tmxY}`] ?? {};
          npcSpawns.push({
            id:          `tmx-npc-${tmxX}-${tmxY}`,
            gridX:       worldX,
            gridY:       worldY,
            sprite,
            frame,
            name:        override.name        ?? npcDefaultName(gid),
            state:       override.state       ?? 'idle',
            interaction: override.interaction ?? npcDefaultInteraction(gid),
          });
          continue;
        }

        // Door0 — visível mas PASSÁVEL (porta = entrada)
        if (inRange(gid, DOOR0_FIRST, DOOR0_LAST)) {
          const resolved = resolveGid(gid);
          if (resolved) {
            const px = worldX * TILE_SIZE + TILE_SIZE / 2;
            const py = worldY * TILE_SIZE + TILE_SIZE / 2;
            tileObjects.push(
              scene.add
                .image(px, py, resolved.textureKey, resolved.frame)
                .setDepth(LAYER_GROUND + 1)
                .setFlipX(resolved.flipX)
                .setFlipY(resolved.flipY),
            );
          }
          // collisionGrid permanece FLOOR (passável) — não marcar como WALL
          continue;
        }

        const resolved = resolveGid(gid);
        if (!resolved) continue;

        const px = worldX * TILE_SIZE + TILE_SIZE / 2;
        const py = worldY * TILE_SIZE + TILE_SIZE / 2;

        // Frames 0–47 do Tree0 são pretos/vazios — ignorar
        if (inRange(gid, TREE0_FIRST, TREE0_EMPTY_LAST)) continue;

        // Copa de árvore (frames 48–59, primeira linha visível) → overhead para Y-sort
        const isTreeTop = inRange(gid, TREE0_FIRST + 48, TREE0_FIRST + 59);
        const depth = isTreeTop ? LAYER_OVERHEAD : LAYER_GROUND + 1;

        tileObjects.push(
          scene.add
            .image(px, py, resolved.textureKey, resolved.frame)
            .setDepth(depth)
            .setFlipX(resolved.flipX)
            .setFlipY(resolved.flipY),
        );

        // Colisão no Sprites layer: override manual tem prioridade, depois TileProperties
        // Padrão: sólido para objetos desconhecidos (seguro)
        let isSolid: boolean;
        if (manualOverride?.walkable !== undefined) {
          isSolid = !manualOverride.walkable;
        } else {
          const prop = getTileProp(gid);
          isSolid = prop
            ? !prop.walkable
            : inRange(gid, TREE0_FIRST, TREE0_LAST) || gid >= CHEST0_FIRST || true;
        }

        if (isSolid) {
          collisionGrid[worldY][worldX] = TILE.WALL;
        }
      }
    }

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

      scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        const tmxX = Math.floor(pointer.worldX / TILE_SIZE) - TMX_PAD_X;
        const tmxY = Math.floor(pointer.worldY / TILE_SIZE) - TMX_PAD_Y;
        label.setText(`tile: ${tmxX},${tmxY}`);

        const coordKey  = `${tmxX},${tmxY}`;
        const override  = MANUAL_MAP_OVERRIDES[coordKey];
        const inBounds  = tmxX >= 0 && tmxY >= 0 && tmxX < TMX_WIDTH && tmxY < TMX_HEIGHT;
        const lines: string[] = [
          `[DEBUG] tmx(${tmxX}, ${tmxY}) | world(${pointer.worldX.toFixed(1)}, ${pointer.worldY.toFixed(1)})`,
        ];

        if (inBounds) {
          const idx        = tmxY * TMX_WIDTH + tmxX;
          const tilesGid   = rawToGid(TMX_TILES_LAYER[idx]);
          const spritesGid = rawToGid(TMX_SPRITES_LAYER[idx]);
          if (tilesGid)   lines.push(`  Tiles layer   forceGid: ${tilesGid}`);
          if (spritesGid) lines.push(`  Sprites layer forceGid: ${spritesGid}`);
          if (!tilesGid && !spritesGid) lines.push('  Ambas as layers: GID 0 (vazio no TMX)');
        } else {
          // área de padding fora do TMX
          const worldX = tmxX + TMX_PAD_X;
          const worldY = tmxY + TMX_PAD_Y;
          const distFromBorder = Math.max(
            tmxX < 0 ? -(tmxX + 1) : tmxX >= TMX_WIDTH  ? tmxX - TMX_WIDTH  : 0,
            tmxY < 0 ? -(tmxY + 1) : tmxY >= TMX_HEIGHT ? tmxY - TMX_HEIGHT : 0,
          );
          if (override?.forceGid !== undefined) {
            lines.push(`  Padding (override) forceGid: ${override.forceGid}`);
          } else if (distFromBorder < ROAD_EXTEND_TILES) {
            const roadGid = borderStonePathGid(tmxX, tmxY);
            if (roadGid !== null) lines.push(`  Padding (borda de caminho) forceGid: ${roadGid}`);
            else                  lines.push(`  Padding (borda) — sem caminho adjacente, grama procedural`);
          } else {
            const frame = weightedGrassFrame(worldX, worldY);
            lines.push(`  Padding (grama procedural) texture: ground  frame: ${frame}`);
            lines.push(`  → Para forçar aqui use forceGid de outra coord com a mesma grama,`);
            lines.push(`    ou procure o GID que resolveGid mapeia para { textureKey:'ground', frame:${frame} }`);
          }
        }

        if (override) lines.push(`  Override atual: ${JSON.stringify(override)}`);

        console.log(lines.join('\n'));
      });
    }

    return { collisionGrid, npcSpawns, tileObjects };
  }
}
