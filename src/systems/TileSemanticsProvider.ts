import { TILE } from '../utils/constants';

// Desacopla semântica visual de semântica de colisão.
// O bitmask usa isVisuallyOpen — não hardcoda === TILE.FLOOR.
// Futuras categorias (water, lava, chasm, glass) definem suas próprias flags aqui.
export interface TileSemantics {
  isVisuallyOpen: boolean; // contribui para silhueta (bitmask)
  isWalkable:     boolean; // jogador pode caminhar
  isSolid:        boolean; // bloqueia projéteis/LOS
}

const TILE_SEMANTICS: Record<number, TileSemantics> = {
  [TILE.FLOOR]: { isVisuallyOpen: true,  isWalkable: true,  isSolid: false },
  [TILE.WALL]:  { isVisuallyOpen: false, isWalkable: false, isSolid: true  },
};

const FALLBACK_SEMANTICS: TileSemantics = { isVisuallyOpen: false, isWalkable: false, isSolid: true };

export function getTileSemantics(tileValue: number): TileSemantics {
  return TILE_SEMANTICS[tileValue] ?? FALLBACK_SEMANTICS;
}
