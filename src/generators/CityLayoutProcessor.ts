import { TILE } from '../utils/constants';
import { FLOOR_ATLAS } from '../config/sprites-config';
import type { TownConfig } from '../config/town.config';
import { TileVariantResolver } from './TileVariantResolver';
import type {
  BiomeType,
  ProcessedTownLayout,
  ResolvedTile,
  WorldObjectDef,
  NPCInstanceDef,
  InteractiveObjectDef,
} from '../types/town';

// Building bounding boxes [x1,y1,x2,y2] (inclusive)
const BUILDINGS = [
  { x1: 2, y1: 2, x2: 7,  y2: 6  }, // Loja
  { x1: 16, y1: 2, x2: 21, y2: 6  }, // Pousada
  { x1: 2, y1: 10, x2: 7,  y2: 13 }, // Taverna
  { x1: 16, y1: 10, x2: 21, y2: 13 }, // Casa
];

// Stone path columns
const PATH_COLS = [11, 12];
const PATH_ROW_START = 7;
const PATH_ROW_END   = 18;

export class CityLayoutProcessor {
  constructor(private _resolver: TileVariantResolver) {}

  process(config: TownConfig): ProcessedTownLayout {
    const biomeMap    = this._buildBiomeMap(config);
    const groundTiles = this._resolveGroundTiles(config, biomeMap);
    const worldObjects = this._buildWorldObjects(config);
    const npcs         = this._buildNPCs(config);
    const interactive  = this._buildInteractive(config);
    return {
      width:  config.width,
      height: config.height,
      collisionGrid: config.grid.map(r => [...r]),
      groundTiles,
      worldObjects,
      npcs,
      interactive,
      spawnPos: { x: config.startX, y: config.startY },
      exitPos:  { x: config.exitX,  y: config.exitY  },
    };
  }

  private _buildBiomeMap(config: TownConfig): BiomeType[][] {
    const map: BiomeType[][] = [];
    for (let y = 0; y < config.height; y++) {
      map[y] = [];
      for (let x = 0; x < config.width; x++) {
        map[y][x] = this._biomeAt(x, y);
      }
    }
    return map;
  }

  private _biomeAt(x: number, y: number): BiomeType {
    // Stone path → urban
    if (PATH_COLS.includes(x) && y >= PATH_ROW_START && y <= PATH_ROW_END) return 'urban';

    // Inside a building → interior
    for (const b of BUILDINGS) {
      if (x >= b.x1 && x <= b.x2 && y >= b.y1 && y <= b.y2) return 'interior';
    }

    // Adjacent to path → transition
    if (
      (PATH_COLS.includes(x - 1) || PATH_COLS.includes(x + 1)) &&
      y >= PATH_ROW_START && y <= PATH_ROW_END
    ) return 'transition';

    return 'natural';
  }

  private _resolveGroundTiles(config: TownConfig, biomeMap: BiomeType[][]): ResolvedTile[][] {
    const tiles: ResolvedTile[][] = [];
    for (let y = 0; y < config.height; y++) {
      tiles[y] = [];
      for (let x = 0; x < config.width; x++) {
        const biome = biomeMap[y][x];
        const set   = FLOOR_ATLAS[biome];
        const frame = biome === 'urban'
          ? this._resolveUrbanFrame(biomeMap, x, y)
          : this._resolver.resolve(set, x, y);
        tiles[y][x] = { sprite: set.textureKey, frame, biome };
      }
    }
    return tiles;
  }

  // Frames de estrada por posição horizontal:
  //   21 = início (borda esquerda)  — sem vizinho urban à esquerda
  //   22 = meio (continuação)       — urban em ambos os lados
  //   23 = fim (borda direita)      — sem vizinho urban à direita
  private _resolveUrbanFrame(biomeMap: BiomeType[][], x: number, y: number): number {
    const leftIsUrban  = biomeMap[y]?.[x - 1] === 'urban';
    const rightIsUrban = biomeMap[y]?.[x + 1] === 'urban';
    if (!leftIsUrban && rightIsUrban)  return 21; // início
    if (leftIsUrban  && rightIsUrban)  return 22; // meio
    return 23;                                    // fim (ou tile isolado)
  }

  private _buildWorldObjects(config: TownConfig): WorldObjectDef[] {
    const objects: WorldObjectDef[] = [];

    // Visual overrides from TOWN_CONFIG (trees, stone path visual, etc.)
    for (const [key, visual] of Object.entries(config.tileVisuals)) {
      const [xs, ys] = key.split(',');
      const gx = parseInt(xs, 10);
      const gy = parseInt(ys, 10);
      // Only include tree overrides (WALL tiles) as solid world objects
      if (config.grid[gy]?.[gx] === TILE.WALL) {
        objects.push({
          gridX: gx, gridY: gy,
          sprite: visual.sprite,
          frame: visual.frame,
          solid: true,
          layer: 'world',
        });
      }
    }

    // Decorative props from TOWN_CONFIG
    for (const prop of config.props) {
      objects.push({
        gridX: prop.x,  gridY: prop.y,
        sprite: prop.sprite, frame: prop.frame,
        solid: false,
        layer: 'world',
      });
    }

    return objects;
  }

  private _buildNPCs(config: TownConfig): NPCInstanceDef[] {
    return config.npcs.map((npc, i) => {
      const def: NPCInstanceDef = {
        id:     `npc_${i}`,
        gridX:  npc.x,
        gridY:  npc.y,
        sprite: npc.sprite,
        frame:  npc.frame,
        name:   npc.name,
        state:  'idle',
      };
      // NPCs com houseBounds não devem vagar (estão dentro de edifícios)
      if (!npc.houseBounds && npc.name !== 'Guarda') {
        if (npc.customWanderBounds) {
          def.wanderBounds = { ...npc.customWanderBounds };
        } else {
          def.wanderBounds = {
            minX: Math.max(1, npc.x - 2),
            maxX: Math.min(config.width  - 2, npc.x + 2),
            minY: Math.max(1, npc.y - 2),
            maxY: Math.min(config.height - 2, npc.y + 2),
          };
        }
      }
      if (npc.houseBounds)  def.houseBounds  = npc.houseBounds;
      if (npc.interaction)  def.interaction  = npc.interaction;
      return def;
    });
  }

  private _buildInteractive(config: TownConfig): InteractiveObjectDef[] {
    const objects: InteractiveObjectDef[] = [];
    const W = config.width;
    const H = config.height;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (config.grid[y][x] !== TILE.FLOOR) continue;
        // Check if this floor tile is adjacent to a building wall
        const neighbors = [
          { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
          { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        ];
        let adjacentToBuilding = false;
        for (const n of neighbors) {
          const nx = x + n.dx;
          const ny = y + n.dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          if (config.grid[ny][nx] === TILE.WALL) {
            for (const b of BUILDINGS) {
              if (nx >= b.x1 && nx <= b.x2 && ny >= b.y1 && ny <= b.y2) {
                adjacentToBuilding = true;
              }
            }
          }
        }
        if (adjacentToBuilding) {
          objects.push({ gridX: x, gridY: y, type: 'door', label: '[E] Entrar' });
        }
      }
    }

    return objects;
  }
}
