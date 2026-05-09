// Propriedades de tiles do mapa da cidade.
// Edite este arquivo para controlar colisão e interação de cada sprite.
//
// Como usar:
//   - walkable: false → player não pode pisar neste tile
//   - walkable: true  → player caminha livremente
//   - interaction     → define o tipo de interação ao pressionar [T]
//
// Para encontrar o GID de um sprite: abra Town.tmx no Tiled e clique no tile,
// ou procure o número em TMX_SPRITES_LAYER / TMX_TILES_LAYER no TownTMXData.ts.
//
// Para corrigir tiles rapidamente sem mexer no renderer, use MANUAL_MAP_OVERRIDES.
// Ative DEBUG_SHOW_COORDINATES em TownTMXRenderer.ts para ver as coordenadas na tela.

// Aliases de TMX GID — use em forceGid / overlayGid no MANUAL_MAP_OVERRIDES.
// TMX GID = firstgid do tileset + frame index (esquerda→direita, cima→baixo).
export const TILE_GID = {

  // ── Wall.png (firstgid=1) — pilares de parede ───────────────────────────────
  PILLAR_L:           128,  // pilar base esq
  PILLAR_R:           130,  // pilar base dir
  PILLAR_VAR:         153,  // pilar variante
  PILLAR_DECOR_L:     168,  // pilar decorado esq
  PILLAR_DECOR_R:     170,  // pilar decorado dir

  // ── Floor.png (firstgid=1021, 21 cols) — piso de cidade ─────────────────────
  // Caminho de pedra (CAMINHO_CIDADE.PEDRA_CAMINHO)
  STONE_PATH:         1147,  // pedra lateral esq
  STONE_PATH_MID:     1148,  // pedra lateral
  STONE_PATH_R:       1149,  // pedra lateral dir
  STONE_PATH_BOT:     1154,  // pedra borda inf
  STONE_PATH_CENTER:  1155,  // pedra borda centro  ← mais usado
  STONE_PATH_BOT_R:   1156,  // pedra borda dir
  STONE_PATH_T:       1168,  // pedra T-cruzamento
  STONE_PATH_MAIN:    1169,  // pedra central
  STONE_PATH_CROSS:   1170,  // pedra cruzamento dir
  STONE_PATH_VERT:    1171,  // pedra faixa vertical
  STONE_PATH_HORIZ:   1173,  // pedra faixa horizontal
  STONE_PATH_CORNER:  1190,  // pedra canto
  STONE_PATH_CORNER2: 1191,  // pedra canto 2
  // Grama de cidade (CAMINHO_CIDADE.GRAMA)
  GRASS_FLOOR_R:      1175,  // grama borda dir
  GRASS_FLOOR:        1176,  // grama principal  ← mais usado
  GRASS_FLOOR_L:      1177,  // grama borda esq
  GRASS_FLOOR_TOP:    1178,  // grama borda sup
  GRASS_FLOOR_CORNER: 1196,  // grama canto
  GRASS_FLOOR_VAR:    1197,  // grama variante
  GRASS_FLOOR_CORNERS:1198,  // grama borda cantos
  // Piso de edifício (CAMINHO_CIDADE.PISO_EDIFICIO)
  FLOOR_VAR:          1402,  // piso variante
  FLOOR_WOOD_L:       1406,  // piso madeira esq
  FLOOR_WOOD:         1407,  // piso madeira centro  ← mais usado
  FLOOR_WOOD_R:       1408,  // piso madeira dir
  FLOOR_WOOD_VAR:     1411,  // piso madeira variante
  FLOOR_WOOD_CORNER:  1421,  // piso madeira canto
  FLOOR_TAVERN_L:     1427,  // piso taberna esq
  FLOOR_TAVERN:       1428,  // piso taberna centro
  FLOOR_TAVERN_R:     1429,  // piso taberna dir
  FLOOR_CORNER_A:     1431,  // piso canto A
  FLOOR_CORNER_B:     1432,  // piso canto B
  FLOOR_CORNER_C:     1444,  // piso canto C
  FLOOR_BORDER_L:     1448,  // piso borda esq
  FLOOR_BORDER:       1449,  // piso borda centro
  FLOOR_BORDER_R:     1450,  // piso borda dir

  // ── Pit0.png (firstgid=1840, 8 cols) — entrada de dungeon ───────────────────
  PIT:                1840,  // frame 0 — entrada dungeon
  PIT_VAR:            1841,  // frame 1 — variante

  // ── Door0.png (firstgid=2096, 8 cols) — portas passáveis ────────────────────
  DOOR:               2096,  // frame 0  — porta principal
  DOOR_VAR:           2097,  // frame 1  — porta variante
  DOOR_OPEN:          2104,  // frame 8  — porta aberta
  DOOR_ARCH:          2112,  // frame 16 — arco/portal

  // ── Decor0.png (firstgid=2136, 8 cols) — decorações e mobília ───────────────
  // Barris e caixas
  BARREL:             2137,  // frame 1   — barril madeira
  BARREL_VAR:         2138,  // frame 2   — barril variante
  CRATE:              2139,  // frame 3   — caixa
  CRATE_VAR:          2140,  // frame 4   — caixa variante
  // Decorações de chão passáveis (DECORACOES_PASSAVEIS)
  DECOR_FLOOR_4:      2177,  // frame 41  — chão decorado 4
  DECOR_FLOOR_1:      2313,  // frame 177 — chão decorado 1
  DECOR_FLOOR_3:      2320,  // frame 184 — chão decorado 3
  DECOR_FLOOR_2:      2321,  // frame 185 — chão decorado 2
  DECOR_FLOOR_5:      2305,  // frame 169 — chão decorado 5
  // Mobília taberna (TABERNA)
  VASE:               2192,  // frame 56  — vaso/tocha
  CHAIR:              2195,  // frame 59  — cadeira
  CHAIR_TABLE:        2196,  // frame 60  — cadeira c/ mesa
  COUNTER_L:          2216,  // frame 80  — balcão esq
  COUNTER:            2217,  // frame 81  — balcão centro
  COUNTER_R:          2218,  // frame 82  — balcão dir
  TABLE_L:            2256,  // frame 120 — mesa esq
  TABLE:              2257,  // frame 121 — mesa centro
  TABLE_R:            2258,  // frame 122 — mesa dir
  BOX_L:              2264,  // frame 128 — caixa esq
  BOX:                2265,  // frame 129 — caixa centro
  BOX_R:              2266,  // frame 130 — caixa dir
  BARREL_TAVERN:      2332,  // frame 196 — barril taberna
  BARREL_TAVERN_VAR:  2334,  // frame 198 — barril taberna variante
  // Mobília loja de armas (LOJA_ARMAS)
  SHELF:              2225,  // frame 89  — prateleira
  SHELF_VAR:          2227,  // frame 91  — prateleira 2
  CHEST_L:            2252,  // frame 116 — baú esq
  CHEST_R:            2253,  // frame 117 — baú dir
  CHEST_BIG_L:        2268,  // frame 132 — baú grande esq
  CHEST_BIG_R:        2269,  // frame 133 — baú grande dir
  SHELF_SIDE:         2330,  // frame 194 — prateleira lateral
  SHELF_SIDE_R:       2331,  // frame 195 — prateleira lateral dir

  // ── Ground0.png (firstgid=2312, 8 cols × 7 linhas) — chão externo ───────────
  STONE:              2312,  // frame 0   — pedra cinza
  STONE_VAR:          2313,  // frame 1   — pedra cinza variante
  DIRT:               2320,  // frame 8   — terra marrom
  DIRT_VAR:           2321,  // frame 9   — terra variante
  GRASS:              2328,  // frame 16  — grama verde
  GRASS_VAR:          2329,  // frame 17  — grama variante
  SAND:               2336,  // frame 24  — areia
  SAND_VAR:           2337,  // frame 25  — areia variante
  MUD:                2344,  // frame 32  — lama
  MUD_VAR:            2345,  // frame 33  — lama variante
  SNOW:               2352,  // frame 40  — neve
  SNOW_VAR:           2353,  // frame 41  — neve variante
  VOLCANIC:           2360,  // frame 48  — vulcânico
  VOLCANIC_VAR:       2361,  // frame 49  — vulcânico variante

  // ── Tree0.png (firstgid=2488, 12 cols reais) — árvores ─────────────────────
  // Frames 0–47 são pretos/vazios; árvores visíveis começam no frame 48
  TREE:               2536,  // frame 48  — árvore variante 0 (linha 4)
  TREE_VAR1:          2548,  // frame 60  — árvore variante 1 (linha 5)
  TREE_VAR2:          2560,  // frame 72  — árvore variante 2 (linha 6)

} as const;

export interface TileProp {
  label:       string;
  walkable:    boolean;
  interaction: null | { type: 'shop' | 'dialogue' | 'menu'; action?: string };
}

// ── TABERNA / POUSADA (edifício da direita — Sprites layer) ──────────────────
export const TABERNA: Record<number, TileProp> = {
  2160: { label: 'Decoração taberna',     walkable: false, interaction: null },
  2164: { label: 'Decoração taberna 2',   walkable: false, interaction: null },
  2192: { label: 'Vaso / tocha',          walkable: false, interaction: null },
  2216: { label: 'Balcão esq',            walkable: false, interaction: null },
  2217: { label: 'Balcão centro',         walkable: false, interaction: null },
  2218: { label: 'Balcão dir',            walkable: false, interaction: null },
  2248: { label: 'Mobília esq',           walkable: false, interaction: null },
  2249: { label: 'Mobília centro',        walkable: false, interaction: null },
  2250: { label: 'Mobília dir',           walkable: false, interaction: null },
  2256: { label: 'Mesa esq',              walkable: false, interaction: null },
  2257: { label: 'Mesa centro',           walkable: false, interaction: null },
  2258: { label: 'Mesa dir',              walkable: false, interaction: null },
  2264: { label: 'Caixa esq',             walkable: false, interaction: null },
  2265: { label: 'Caixa centro',          walkable: false, interaction: null },
  2266: { label: 'Caixa dir',             walkable: false, interaction: null },
  2195: { label: 'Cadeira',               walkable: false, interaction: null },
  2196: { label: 'Cadeira / mesa',        walkable: false, interaction: null },
  2185: { label: 'Decoração lateral',     walkable: false, interaction: null },
  2186: { label: 'Decoração lateral 2',   walkable: false, interaction: null },
  2332: { label: 'Barril taberna',        walkable: false, interaction: null },
  2334: { label: 'Barril taberna var',    walkable: false, interaction: null },
};

// ── LOJA DE ARMAS (edifício da esquerda — Sprites layer) ────────────────────
export const LOJA_ARMAS: Record<number, TileProp> = {
  2225: { label: 'Prateleira',            walkable: false, interaction: null },
  2227: { label: 'Prateleira 2',          walkable: false, interaction: null },
  2252: { label: 'Baú esq',              walkable: false, interaction: null },
  2253: { label: 'Baú dir',              walkable: false, interaction: null },
  2268: { label: 'Baú grande esq',       walkable: false, interaction: null },
  2269: { label: 'Baú grande dir',       walkable: false, interaction: null },
  2330: { label: 'Prateleira lateral',    walkable: false, interaction: null },
  2331: { label: 'Prateleira lat dir',    walkable: false, interaction: null },
};

// ── CAMINHO DA CIDADE (GIDs no Tiles layer — Floor.png) ─────────────────────
// Estes tiles são passáveis. Edite apenas walkable ou interaction se necessário.
export const CAMINHO_CIDADE = {
  GRAMA: {
    1175: { label: 'Grama borda dir',      walkable: true, interaction: null },
    1176: { label: 'Grama principal',      walkable: true, interaction: null },
    1177: { label: 'Grama borda esq',      walkable: true, interaction: null },
    1178: { label: 'Grama borda sup',      walkable: true, interaction: null },
    1196: { label: 'Grama canto',          walkable: true, interaction: null },
    1197: { label: 'Grama variante',       walkable: true, interaction: null },
    1198: { label: 'Grama borda cantos',   walkable: true, interaction: null },
  } as Record<number, TileProp>,

  PEDRA_CAMINHO: {
    1147: { label: 'Pedra lateral esq',    walkable: true, interaction: null },
    1148: { label: 'Pedra lateral',        walkable: true, interaction: null },
    1149: { label: 'Pedra lateral dir',    walkable: true, interaction: null },
    1154: { label: 'Pedra borda inf',      walkable: true, interaction: null },
    1155: { label: 'Pedra borda centro',   walkable: true, interaction: null },
    1156: { label: 'Pedra borda dir',      walkable: true, interaction: null },
    1168: { label: 'Pedra T-cruzamento',   walkable: true, interaction: null },
    1169: { label: 'Pedra central',        walkable: true, interaction: null },
    1170: { label: 'Pedra cruzamento dir', walkable: true, interaction: null },
    1171: { label: 'Pedra faixa vert',     walkable: true, interaction: null },
    1173: { label: 'Pedra faixa horiz',    walkable: true, interaction: null },
    1190: { label: 'Pedra canto',          walkable: true, interaction: null },
    1191: { label: 'Pedra canto 2',        walkable: true, interaction: null },
  } as Record<number, TileProp>,

  PISO_EDIFICIO: {
    1402: { label: 'Piso variante',        walkable: true, interaction: null },
    1406: { label: 'Piso madeira esq',     walkable: true, interaction: null },
    1407: { label: 'Piso madeira centro',  walkable: true, interaction: null },
    1408: { label: 'Piso madeira dir',     walkable: true, interaction: null },
    1411: { label: 'Piso madeira var',     walkable: true, interaction: null },
    1421: { label: 'Piso madeira canto',   walkable: true, interaction: null },
    1427: { label: 'Piso taberna esq',     walkable: true, interaction: null },
    1428: { label: 'Piso taberna centro',  walkable: true, interaction: null },
    1429: { label: 'Piso taberna dir',     walkable: true, interaction: null },
    1431: { label: 'Piso canto A',         walkable: true, interaction: null },
    1432: { label: 'Piso canto B',         walkable: true, interaction: null },
    1444: { label: 'Piso canto C',         walkable: true, interaction: null },
    1448: { label: 'Piso borda esq',       walkable: true, interaction: null },
    1449: { label: 'Piso borda centro',    walkable: true, interaction: null },
    1450: { label: 'Piso borda dir',       walkable: true, interaction: null },
  } as Record<number, TileProp>,
};

// ── OBJETOS DECORATIVOS PASSÁVEIS (Sprites layer) ────────────────────────────
export const DECORACOES_PASSAVEIS: Record<number, TileProp> = {
  2177: { label: 'Chão decorado 4',      walkable: true, interaction: null },
  2305: { label: 'Chão decorado 5',      walkable: true, interaction: null },
  2313: { label: 'Chão decorado 1',      walkable: true, interaction: null },
  2320: { label: 'Chão decorado 3',      walkable: true, interaction: null },
  2321: { label: 'Chão decorado 2',      walkable: true, interaction: null },
};

// ── PILARES / DECORAÇÕES DE PAREDE (Sprites layer — sólidos) ────────────────
// Estes aparecem no layer de sprites como elementos arquitetônicos.
export const PILARES: Record<number, TileProp> = {
  128: { label: 'Pilar base esq',        walkable: false, interaction: null },
  130: { label: 'Pilar base dir',        walkable: false, interaction: null },
  153: { label: 'Pilar variante',        walkable: false, interaction: null },
  168: { label: 'Pilar decorado esq',    walkable: false, interaction: null },
  170: { label: 'Pilar decorado dir',    walkable: false, interaction: null },
};

// ── MAPA GLOBAL — consultado pelo TownTMXRenderer ────────────────────────────
export const TILE_PROP_MAP: Record<number, TileProp> = {
  ...TABERNA,
  ...LOJA_ARMAS,
  ...CAMINHO_CIDADE.GRAMA,
  ...CAMINHO_CIDADE.PEDRA_CAMINHO,
  ...CAMINHO_CIDADE.PISO_EDIFICIO,
  ...DECORACOES_PASSAVEIS,
  ...PILARES,
};

// Override manual por coordenada "tmxX,tmxY" (coordenadas do tile no TMX, sem padding).
// Tem prioridade total sobre o que vem do arquivo .tmx.
//   forceGid    — substitui o tile base (use TILE_GID para nomes amigáveis)
//   forceGidLike — copia o GID do tile na coordenada "x,y" indicada
//   overlayGid  — sprite adicional renderizado em cima do tile base (depth LAYER_GROUND+1)
//   walkable    — sobrescreve a colisão daquele ponto
export const MANUAL_MAP_OVERRIDES: Record<string, {
  forceGid?:    number;
  forceGidLike?: string;  // ex: '18,11' — copia o tile dessa posição
  overlayGid?:  number;
  walkable?:    boolean;
}> = {
  // Exemplos (descomente e ajuste conforme necessário):
  // '14,3': { forceGid: TILE_GID.GRASS_FLOOR, walkable: true },
  // '10,7': { forceGid: TILE_GID.GRASS_FLOOR, overlayGid: 2313, walkable: true },
  // '5,12': { walkable: true },
  // '4,11': { forceGidLike: '4,7', walkable: true }, // copia o tile de 5,8
  '0,8': { walkable: true },
  '1,8': { walkable: true },
  '2,8': { walkable: true },
  '3,8': { walkable: true },
  '0,9': { walkable: true },
  '1,9': { walkable: true },
  '2,9': { walkable: true },
  '3,9': { walkable: true },
  '0,11': { walkable: true },
  '2,11': { walkable: true },
  '5,8': { forceGid: TILE_GID.GRASS_FLOOR_R, walkable: true },
  '9,6': { walkable: true },
  '9,7': { walkable: true },
  '10,6': { walkable: true },
  '10,7': { walkable: true },
  '11,6': { walkable: true },
  '11,7': { walkable: true },
  '13,0': { forceGid: TILE_GID.GRASS_FLOOR, walkable: true },
  '13,6': { walkable: true },
  '13,7': { walkable: true },
  '14,6': { walkable: true },
  '14,7': { walkable: true },
  '14,8': { walkable: true },
  '15,6': { walkable: true },
  '15,7': { walkable: true },
  '15,8': { walkable: true },
  '16,6': { walkable: true },
  '16,7': { walkable: true },
  '16,8': { walkable: true },
  '17,6': { walkable: true },
  '14,0': { forceGid: TILE_GID.GRASS_FLOOR, walkable: true },
};

export function getTileProp(gid: number): TileProp | undefined {
  return TILE_PROP_MAP[gid];
}
