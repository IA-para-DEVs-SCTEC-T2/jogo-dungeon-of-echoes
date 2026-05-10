// Temas visuais de dungeon por andar — frames extraídos dos TMXs de referência:
//   Dungeon.tmx    → andares 1–2 (pedra cinza)
//   Mine.tmx       → andares 3–4 (terra/minério)
//   Underworld.tmx → andares 5–6 (pedra escura + abismo)
//   Underworld boss → andar 7+ (mix abismo + diferenciação de boss floor)
//
// Os TMXs NÃO são carregados em runtime — servem apenas como referência visual.
// Spritesheets: 'wall' (Wall.png 20 cols × 51 linhas) e 'floor' (Floor.png 21 cols × 39 linhas).

// ── Categorias de tile semântico ─────────────────────────────────────────────
// Expansível sem alterar AutoTileResolver ou DungeonRenderer.
export type TileCategory = 'wall' | 'floor' | 'door' | 'water' | 'lava' | 'chasm' | 'pillar';

// ── AutoTileSet ───────────────────────────────────────────────────────────────
// Frames organizados por tipo de borda. Cada categoria em cada tema define seu set.
export interface AutoTileSet {
  face:             number;    // borda superior visível (vizinho sul = aberto)
  cornerOuter_TL:   number;    // canto externo TL (sul=aberto, oeste=aberto)
  cornerOuter_TR:   number;    // canto externo TR (sul=aberto, leste=aberto)
  bodyFrames:       number[];  // corpo sólido — pool para variação determinística por posição
  cornerInner_TL?:  number;    // canto côncavo TL (sul=fechado, leste=aberto, diag SE=aberto)
  cornerInner_TR?:  number;    // canto côncavo TR (sul=fechado, oeste=aberto, diag SO=aberto)
  isolated?:        number;    // tile sem vizinhos do mesmo tipo (fallback para face)
}

// ── DungeonTheme ──────────────────────────────────────────────────────────────
export interface DungeonTheme {
  autoTileSets: Partial<Record<TileCategory, AutoTileSet>>;

  // Campos reservados para expansão futura (não usados ainda)
  ambientColor?: number;   // tint de câmera/iluminação
  fogDensity?:   number;   // FOG of War quando implementado
  musicKey?:     string;   // trilha sonora por tema
  propsPool?:    string[]; // decorações em spawn procedural
}

// ── Dados dos temas ───────────────────────────────────────────────────────────
// Frames de inner corners (360, 362) são compartilhados — aparecem em todos os TMXs
// nas linhas 18-20 de Wall.png.
const SHARED_INNER: Pick<AutoTileSet, 'cornerInner_TL' | 'cornerInner_TR'> = {
  cornerInner_TL: 362,  // Wall.png linha 18 col 2
  cornerInner_TR: 360,  // Wall.png linha 18 col 0
};

const THEMES: Record<string, DungeonTheme> = {

  // Dungeon.tmx — pedra cinza clara
  // Wall.png linhas 9–11 (frames 180–222) · Floor.png linha 10 (frames 210–215)
  dungeon: {
    autoTileSets: {
      wall: {
        face:           181,          // linha 9 col 1
        cornerOuter_TL: 180,          // linha 9 col 0
        cornerOuter_TR: 182,          // linha 9 col 2
        bodyFrames:     [200, 201],   // linha 10 col 0–1
        ...SHARED_INNER,
      },
      floor: {
        face:           210,          // (fallback; floor usa bodyFrames)
        cornerOuter_TL: 210,
        cornerOuter_TR: 210,
        bodyFrames:     [210, 211, 212, 213, 214, 215],  // Floor.png linha 10
      },
    },
  },

  // Mine.tmx — terra/minério
  // Wall.png linhas 6–8 (frames 120–175) · Floor.png linhas 18–19 (frames 378–402)
  mine: {
    autoTileSets: {
      wall: {
        face:           136,          // linha 6 col 16
        cornerOuter_TL: 135,          // linha 6 col 15
        cornerOuter_TR: 137,          // linha 6 col 17
        bodyFrames:     [155, 175],   // linha 7 col 15 + linha 8 col 15
        ...SHARED_INNER,
      },
      floor: {
        face:           378,
        cornerOuter_TL: 378,
        cornerOuter_TR: 378,
        bodyFrames:     [378, 379, 380, 381, 399, 400, 401, 402],  // Floor.png linhas 18–19
      },
    },
  },

  // Underworld.tmx — pedra escura + abismo
  // Wall.png linhas 12–14 (frames 240–285) · Floor.png linhas 21–22 (frames 441–465)
  underworld: {
    autoTileSets: {
      wall: {
        face:           261,          // linha 13 col 1
        cornerOuter_TL: 240,          // linha 12 col 0
        cornerOuter_TR: 242,          // linha 12 col 2
        bodyFrames:     [260, 261],   // linha 13 col 0–1
        ...SHARED_INNER,
      },
      floor: {
        face:           441,
        cornerOuter_TL: 441,
        cornerOuter_TR: 441,
        bodyFrames:     [441, 442, 443, 444, 462, 463, 464, 465],  // Floor.png linhas 21–22
      },
    },
  },

  // Underworld boss (andar 7+) — mix abismo + pedra cinza, parede linha 12 mais escura
  underworld_boss: {
    autoTileSets: {
      wall: {
        face:           261,
        cornerOuter_TL: 240,
        cornerOuter_TR: 242,
        bodyFrames:     [260, 280],   // linha 13 col 0 + linha 14 col 0 (mais escuro)
        ...SHARED_INNER,
      },
      floor: {
        face:           441,
        cornerOuter_TL: 441,
        cornerOuter_TR: 441,
        bodyFrames:     [441, 442, 443, 444, 210, 211, 212],  // mix abismo + pedra cinza
      },
    },
  },
};

// ── API pública ───────────────────────────────────────────────────────────────

export function themeForFloor(floor: number): DungeonTheme {
  if (floor <= 2) return THEMES.dungeon;
  if (floor <= 4) return THEMES.mine;
  if (floor <= 6) return THEMES.underworld;
  return THEMES.underworld_boss;
}
