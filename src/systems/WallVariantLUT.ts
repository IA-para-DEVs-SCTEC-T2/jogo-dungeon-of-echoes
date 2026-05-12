import { getTileSemantics } from './TileSemanticsProvider';

// Bitmask de 8 vizinhos. Bit SET (1) = vizinho NÃO é visualmente aberto (sólido ou OOB).
// NW=1   N=2   NE=4
// W=8          E=16
// SW=32  S=64  SE=128
export const BIT = { NW: 1, N: 2, NE: 4, W: 8, E: 16, SW: 32, S: 64, SE: 128 } as const;

// Variantes — apenas as que possuem sprite DawnLike confirmado.
// PILLAR e CROSS são raros em mapas BSP e colapsados em equivalentes.
export const enum WallVariant {
  FACE,      // borda reta frontal (sul aberto)
  FACE_END_W, // extremidade esquerda (sul+oeste abertos)
  FACE_END_E, // extremidade direita (sul+leste abertos)
  FACE_T,    // T-junction sul (sul+leste+oeste abertos) — colapsa em FACE visualmente
  INNER_NW,  // canto côncavo NW (sul fechado, leste+SE abertos)
  INNER_NE,  // canto côncavo NE (sul fechado, oeste+SW abertos)
  BODY,      // corpo sólido — sem cardinais abertos, 1 frame fixo
}

// Sanitização: diagonal só pode ser ABERTA (bit 0) se AMBOS os cardinais adjacentes
// também forem abertos. Caso contrário, força o bit diagonal para fechado (1).
// Evita artefatos visuais em cantos apertados.
export function sanitizeMask(raw: number): number {
  let m = raw;
  if ((m & BIT.N) || (m & BIT.W)) m |= BIT.NW;
  if ((m & BIT.N) || (m & BIT.E)) m |= BIT.NE;
  if ((m & BIT.S) || (m & BIT.W)) m |= BIT.SW;
  if ((m & BIT.S) || (m & BIT.E)) m |= BIT.SE;
  return m;
}

// Função pura — sem chain de overwrites, sem estado.
// Cada mask resolve para exatamente uma variante de forma determinística.
function classifyVariant(mask: number): WallVariant {
  const s_open = !(mask & BIT.S);
  const e_open = !(mask & BIT.E);
  const w_open = !(mask & BIT.W);
  const se_open = !(mask & BIT.SE);
  const sw_open = !(mask & BIT.SW);

  // Sul aberto = tile na fronteira visível (borda jogável)
  if (s_open) {
    if (w_open && e_open) return WallVariant.FACE_T;
    if (w_open)           return WallVariant.FACE_END_W;
    if (e_open)           return WallVariant.FACE_END_E;
    return WallVariant.FACE;
  }

  // Sul fechado — detectar cantos côncavos.
  // Após sanitização, SE só é aberto se S e E também forem abertos.
  // Então aqui SE_open implica E_open (mas S já confirmado fechado → diagonal edge).
  if (e_open && se_open) return WallVariant.INNER_NW;
  if (w_open && sw_open) return WallVariant.INNER_NE;

  return WallVariant.BODY;
}

function buildWallVariantLUT(): WallVariant[] {
  return Array.from({ length: 256 }, (_, raw) => classifyVariant(sanitizeMask(raw)));
}

export const WALL_VARIANT_LUT = buildWallVariantLUT();

// Calcula o bitmask raw de 8 vizinhos para o tile (x, y).
// Usa isVisuallyOpen do TileSemanticsProvider — atlas-agnostic.
export function computeRawMask(grid: number[][], x: number, y: number): number {
  const H = grid.length;
  const W = grid[0]?.length ?? 0;

  function isSolid(nx: number, ny: number): boolean {
    if (ny < 0 || ny >= H || nx < 0 || nx >= W) return true; // OOB = sólido
    return !getTileSemantics(grid[ny][nx]).isVisuallyOpen;
  }

  let m = 0;
  if (isSolid(x - 1, y - 1)) m |= BIT.NW;
  if (isSolid(x,     y - 1)) m |= BIT.N;
  if (isSolid(x + 1, y - 1)) m |= BIT.NE;
  if (isSolid(x - 1, y    )) m |= BIT.W;
  if (isSolid(x + 1, y    )) m |= BIT.E;
  if (isSolid(x - 1, y + 1)) m |= BIT.SW;
  if (isSolid(x,     y + 1)) m |= BIT.S;
  if (isSolid(x + 1, y + 1)) m |= BIT.SE;
  return m;
}
