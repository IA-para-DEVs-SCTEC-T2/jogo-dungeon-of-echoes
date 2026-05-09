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
const DEBUG_SHOW_COORDINATES = false;

// Frames de grama usados no preenchimento ao redor do mapa TMX
const GRASS_FRAMES = [16, 17, 18] as const;

function rawToGid(raw: number): number {
  return raw & GID_MASK;
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
          if (manualOverride.walkable === false) {
            collisionGrid[worldY][worldX] = TILE.WALL;
          }
        } else {
          const frame = GRASS_FRAMES[(worldX * 7 + worldY * 13) % GRASS_FRAMES.length];
          tileObjects.push(
            scene.add.image(px, py, 'ground', frame).setDepth(LAYER_GROUND),
          );
        }

        if (DEBUG_SHOW_COORDINATES) {
          scene.add.text(px - TILE_SIZE / 2, py - TILE_SIZE / 2, coordKey, {
            fontSize: '5px', color: '#ffffff', backgroundColor: '#000000cc',
          }).setDepth(9999).setScrollFactor(1);
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
          scene.add.text(px - TILE_SIZE / 2, py - TILE_SIZE / 2, coordKey, {
            fontSize: '5px', color: '#ffffff', backgroundColor: '#000000cc',
          }).setDepth(9999).setScrollFactor(1);
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
          scene.add.text(px - TILE_SIZE / 2, py - TILE_SIZE / 2, coordKey, {
            fontSize: '5px', color: '#ffff00', backgroundColor: '#000000cc',
          }).setDepth(9999).setScrollFactor(1);
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

      scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        const cam = scene.cameras.main;
        const worldX = pointer.x / cam.zoom + cam.scrollX;
        const worldY = pointer.y / cam.zoom + cam.scrollY;
        const tmxX = Math.floor(worldX / TILE_SIZE) - TMX_PAD_X;
        const tmxY = Math.floor(worldY / TILE_SIZE) - TMX_PAD_Y;
        label.setText(`tile: ${tmxX},${tmxY}`);
      });
    }

    return { collisionGrid, npcSpawns, tileObjects };
  }
}
