// Dados estáticos extraídos de public/assets/dawnlike/Examples/Town.tmx
// Mapa 20×15, tilewidth=16, tileheight=16

export const TMX_WIDTH  = 20;
export const TMX_HEIGHT = 15;

// Padding de grama ao redor do mapa TMX para continuidade visual
export const TMX_PAD_X     = 5;
export const TMX_PAD_Y     = 5;
export const TOWN_TOTAL_W  = TMX_WIDTH  + 2 * TMX_PAD_X;  // 30
export const TOWN_TOTAL_H  = TMX_HEIGHT + 2 * TMX_PAD_Y;  // 25

// Layer "Tiles" — chão, paredes, piso
export const TMX_TILES_LAYER: number[] = [
  1176,1176,1176,1176,1176,1176,1177,1171,1175,1176,1176,1176,1176,1176,1176,1176,1176,1176,1176,1176,
  1176,1176,1176,1176,1176,1176,1177,1171,1175,1197,1197,1197,1197,1197,1197,1197,1197,1197,1197,1176,
  1176,1176,1176,1176,1176,1176,1177,1171,1178,1421,129,129,129,129,129,129,129,129,1421,1175,
  1176,1176,1176,1176,1176,1176,1177,1171,1178,148,1406,1408,1411,1406,1407,1407,1407,1408,148,1175,
  1197,1197,1197,1197,1197,1176,1177,1171,1178,148,1448,1450,132,1427,1428,1428,1428,1429,148,1175,
  129,129,129,129,1421,1175,1177,1171,1178,1421,129,129,153,1427,1428,1428,1428,1429,148,1196,
  1407,1407,1407,1408,148,1175,1177,1171,1175,1155,1155,1156,148,1427,1428,1428,1428,1429,129,129,
  1428,1428,1428,1429,148,1175,1177,1171,1175,1176,1176,1177,148,1427,1428,1428,1428,1429,1431,1432,
  1428,1428,1428,1429,148,1175,1198,1171,1196,1197,1197,1177,148,1427,1428,1428,1428,1429,128,129,
  1449,1449,1449,1450,148,1178,1147,1169,1148,1148,1149,1178,148,1448,1449,1449,1449,1450,148,1154,
  129,1411,129,129,1421,1178,1168,1169,1169,1169,1170,1178,1421,129,129,1411,129,129,1421,1175,
  1155,1402,1155,1155,1155,1177,1168,1169,1169,1169,1170,1175,1155,1155,1156,1402,1154,1155,1155,1176,
  1197,1444,1197,1197,1197,1198,1168,1169,1169,1169,1170,1196,1197,1197,1198,1444,1196,1197,1197,1197,
  1148,1148,1148,1173,1173,1173,1190,1169,1169,1169,1190,1173,1173,1173,1173,1148,1148,1148,1148,1148,
  1190,1190,1191,1154,1155,1155,1156,1168,1169,1170,1154,1155,1155,1155,1156,1168,1169,1169,1169,1169,
  1190,1190,1191,1154,1155,1155,1156,1168,1169,1170,1154,1155,1155,1155,1156,1168,1169,1169,1169,1169,
  129,1411,129,129,1421,1178,1168,1169,1169,1169,1170,1178,1421,129,129,1411,129,129,1421,1175,
];

// Layer "Sprites" — decorações, NPCs, objetos (0 = vazio)
export const TMX_SPRITES_LAYER: number[] = [
  2497,2497,2498,2504,2505,2506,7,0,7,2147485969,7,2147485969,2313,2147486720,3073,2491,2147485969,2491,2496,2497,
  2497,2497,2498,2491,2321,7,2491,0,7,7,2147485969,2147485969,7,2491,7,7,2491,7,2504,2505,
  2497,2497,2498,2321,2491,2147485968,7,0,2461,128,7,7,7,7,7,7,7,7,130,2147485969,
  2505,2505,2506,7,2321,2491,7,0,7,7,2147486752,7,2097,2164,2147486640,0,2848,2160,7,7,
  2491,7,2321,7,2321,7,2147486109,0,7,7,3120,3120,7,2216,2217,2217,2217,2218,7,2147485969,
  7,7,7,7,130,7,7,2147486109,2147485969,168,7,7,7,2192,7,2192,2800,2147485840,7,7,
  2227,7,2849,2225,7,2147485961,7,0,7,2330,2330,2331,7,7,2248,2249,2250,7,7,7,
  2217,2217,2217,2218,7,7,2313,0,2147485961,2331,2331,2330,7,7,2256,2257,2258,2832,2097,7,
  2252,2252,2252,2253,7,2491,7,0,7,2147485961,2491,2491,7,2195,2264,2265,2266,2147485843,7,7,
  2268,2268,2268,2269,7,2321,0,0,0,0,0,7,7,2196,2147485843,7,2195,2196,7,2491,
  7,2096,7,2186,170,7,0,7,2305,7,2826,7,168,2185,7,2096,7,2185,170,2147485961,
  2334,0,2334,2147485968,2491,7,0,7,7,2827,0,3050,7,7,2332,0,2332,2491,7,7,
  0,0,0,0,7,2147485968,0,2147486472,7,7,0,7,2177,7,2320,0,7,7,2147485969,7,
  0,0,0,2147486018,0,0,0,0,0,0,0,0,0,2460,0,0,0,0,7,7,
  0,0,0,0,2491,2491,7,0,2374,0,2491,7,2491,7,7,0,0,0,2825,0,
];

// Tilesets em ordem decrescente de firstgid para lookup eficiente
export const TMX_TILESETS = [
  { firstgid: 3104, lastgid: Infinity, textureKey: 'chest0',    cols: 8  },  // Items/Chest0.png
  { firstgid: 3008, lastgid: 3103,     textureKey: 'quad0',     cols: 8  },  // Characters/Quadraped0.png
  { firstgid: 2968, lastgid: 3007,     textureKey: 'cat0',      cols: 8  },  // Characters/Cat0.png
  { firstgid: 2752, lastgid: 2967,     textureKey: 'humanoid0', cols: 8  },  // Characters/Humanoid0.png
  { firstgid: 2488, lastgid: 2751,     textureKey: 'tree0',     cols: 8  },  // Objects/Tree0.png
  { firstgid: 2368, lastgid: 2487,     textureKey: 'player',    cols: 8  },  // Characters/Player0.png
  { firstgid: 2312, lastgid: 2367,     textureKey: 'ground',    cols: 8  },  // Objects/Ground0.png
  { firstgid: 2136, lastgid: 2311,     textureKey: 'decor0',    cols: 8  },  // Objects/Decor0.png
  { firstgid: 2096, lastgid: 2135,     textureKey: 'door0',     cols: 8  },  // Objects/Door0.png
  { firstgid: 1840, lastgid: 2095,     textureKey: 'pit0',      cols: 8  },  // Objects/Pit0.png
  { firstgid: 1021, lastgid: 1839,     textureKey: 'floor',     cols: 21 },  // Objects/Floor.png
  { firstgid: 1,    lastgid: 1020,     textureKey: 'wall',      cols: 20 },  // Objects/Wall.png
] as const;

export interface TileResolution {
  textureKey: string;
  frame:      number;
  flipX:      boolean;
  flipY:      boolean;
}

const FLIP_H = 0x80000000;
const FLIP_V = 0x40000000;
const GID_MASK = 0x1FFFFFFF;

export function resolveGid(rawGid: number): TileResolution | null {
  if (rawGid === 0) return null;

  const flipX = (rawGid & FLIP_H) !== 0;
  const flipY = (rawGid & FLIP_V) !== 0;
  const gid   = rawGid & GID_MASK;

  if (gid === 0) return null;

  for (const ts of TMX_TILESETS) {
    if (gid >= ts.firstgid) {
      const local = gid - ts.firstgid;
      return { textureKey: ts.textureKey, frame: local, flipX, flipY };
    }
  }
  return null;
}

// GID 7 é Wall frame 6 — usado como marcador vazio no layer Sprites, ignorar
export const SPRITE_EMPTY_GIDS = new Set([0, 7]);

// Overrides de NPC por posição "x,y" no TMX (base 0)
// Permite atribuir interações específicas a NPCs identificados na análise do Sprites layer
import type { NPCInstanceDef } from '../types/town';

// Posições TMX (x,y) cujos sprites são completamente ignorados no renderer
export const TMX_REMOVED_POSITIONS = new Set(['7,5', '6,4', '8,2', '16,5', '18,14', '13,13']);

export const TMX_NPC_OVERRIDES: Record<string, Partial<NPCInstanceDef>> = {
  // Mercador atrás do balcão (2,7) — interagível a 2 tiles do ponto (2,8)
  '2,6':  { name: 'Mercador',      interactRange: 2, interaction: { type: 'shop',     message: 'O que deseja comprar?' } },
  '16,3': { name: 'Estalajadeiro', interactRange: 2, interaction: { type: 'menu', message: 'Bem-vindo à pousada.',
              menuOptions: [{ id: 'rest', label: 'Repousar (20 ouro)', content: 'Descanse e recupere HP e MP.', action: 'rest', goldCost: 20 }] } },
  // NPCs externos com wandering pela área central da cidade
  '10,10':{ name: 'Guarda',   wanderBounds: { minX: 9, maxX: 16, minY: 10, maxY: 17 }, interaction: { type: 'dialogue', message: 'Mantenha a paz, aventureiro.' } },
  '9,11': { name: 'Guarda',   wanderBounds: { minX: 9, maxX: 16, minY: 10, maxY: 17 }, interaction: { type: 'dialogue', message: 'Cuidado com o que há lá fora.' } },
};
