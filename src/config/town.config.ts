import { SPRITES, TILE, TOWN } from '../utils/constants';
import type { BiomeType, DialogMenuOption } from '../types/town';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface TownTileVisual {
  sprite: string;
  frame:  number;
}

export interface TownPropDef {
  x:      number;
  y:      number;
  sprite: string;
  frame:  number;
  depth:  number;
}

export interface TownNPCDef {
  x:           number;
  y:           number;
  sprite:      string;
  frame:       number;
  name:        string;
  houseBounds?: { x: number; y: number; w: number; h: number };
  customWanderBounds?: { minX: number; maxX: number; minY: number; maxY: number };
  interaction?: { type: 'dialogue' | 'shop' | 'menu'; message: string; menuOptions?: DialogMenuOption[] };
}

export interface TownLabelDef {
  x:     number;
  y:     number;
  text:  string;
  color: string;
  depth: number;
}

export interface TownConfig {
  width:  number;
  height: number;
  startX: number;
  startY: number;
  exitX:  number;
  exitY:  number;
  /** Grid de colisão: 0 = sólido (WALL), 1 = caminhável (FLOOR) */
  grid: number[][];
  /** Visuais alternativos por posição "x,y" — sobrescreve tile padrão */
  tileVisuals: Record<string, TownTileVisual>;
  /** Substituições de bioma por posição "x,y" — sobrescreve detecção automática */
  biomeOverrides?: Record<string, BiomeType>;
  props:  TownPropDef[];
  npcs:   TownNPCDef[];
  labels: TownLabelDef[];
}

// ─── Grid de Colisão (24 × 20) ───────────────────────────────────────────────
// 0 = WALL (sólido), 1 = FLOOR (caminhável)
// Edifícios: paredes externas = 0, interior = 1, portas = 1
// Árvores: marcadas como 0 na grid (sólidas), mas com visual override de Tree0
//
// Layout:
//   Norte: Loja (x 2-7, y 2-6) | Centro aberto | Pousada (x 16-21, y 2-6)
//   Central: praça + caminho de pedra (cols 11-12)
//   Sul: Taverna (x 2-7, y 10-13) | Caminho | Casa (x 16-21, y 10-13)
//   Saída dungeon: (12, 18)

const W = TILE.WALL;
const F = TILE.FLOOR;

const GRID: number[][] = [
  // x: 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
  [  W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // y=0  border
  [  W, W, F, F, F, F, F, F, F, W, F, F, F, F, W, F, F, F, F, F, F, F, W, W ], // y=1  árvores em (1),(9),(14),(22)
  [  W, F, W, W, W, W, W, W, W, F, F, F, F, F, F, W, W, W, W, W, W, W, F, W ], // y=2  fachadas shop+inn
  [  W, F, W, F, F, F, F, F, W, F, F, F, F, F, F, W, F, F, F, F, F, W, F, W ], // y=3  interiores
  [  W, F, W, F, F, F, F, F, W, F, F, F, F, F, F, W, F, F, F, F, F, W, F, W ], // y=4
  [  W, F, W, F, F, F, F, F, W, F, F, F, F, F, F, W, F, F, F, F, F, W, F, W ], // y=5
  [  W, F, W, W, W, F, W, W, W, F, F, F, F, F, F, W, W, W, F, W, W, W, F, W ], // y=6  portas: (5,6) e (18,6)
  [  W, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, W ], // y=7  praça — árvores em (1),(22)
  [  W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W ], // y=8  SPAWN (12,8)
  [  W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W ], // y=9
  [  W, F, W, W, W, W, W, W, F, F, F, F, F, F, F, F, W, W, W, W, W, W, F, W ], // y=10 fachadas taverna+casa
  [  W, F, W, F, F, F, F, W, F, F, F, F, F, F, F, F, W, F, F, F, F, W, F, W ], // y=11 interiores
  [  W, F, W, F, F, F, F, W, F, F, F, F, F, F, F, F, W, F, F, F, F, W, F, W ], // y=12
  [  W, F, W, W, W, F, W, W, F, F, F, F, F, F, F, F, W, W, F, W, W, W, F, W ], // y=13 portas: (5,13) e (18,13)
  [  W, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, W ], // y=14 árvores em (1),(22)
  [  W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W ], // y=15
  [  W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W ], // y=16
  [  W, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, W ], // y=17 árvores em (1),(22)
  [  W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W ], // y=18 EXIT (12,18)
  [  W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // y=19 border
];

// ─── Posições de árvores (sólidas — WALL na grid acima) ───────────────────
const TREE_POSITIONS = [
  // Bordas norte e sul da praça
  { x: 1,  y: 1  }, { x: 22, y: 1  },
  { x: 9,  y: 1  }, { x: 14, y: 1  },
  // Lados da praça central
  { x: 1,  y: 7  }, { x: 22, y: 7  },
  // Flancos do caminho sul
  { x: 1,  y: 14 }, { x: 22, y: 14 },
  { x: 9,  y: 14 }, { x: 14, y: 14 },
  // Flancos da saída para dungeon
  { x: 1,  y: 17 }, { x: 22, y: 17 },
];

// ─── Visual Overrides ────────────────────────────────────────────────────────

function buildTileVisuals(): Record<string, TownTileVisual> {
  const visuals: Record<string, TownTileVisual> = {};

  // Caminho de pedra central (cols 11–12, rows 7–18)
  for (let y = 7; y <= 18; y++) {
    for (const x of [11, 12]) {
      visuals[`${x},${y}`] = { sprite: SPRITES.FLOOR, frame: TOWN.STONE_PATH_FRAME };
    }
  }

  // Árvores: posições marcadas como WALL na grid mas com visual de árvore
  for (const pos of TREE_POSITIONS) {
    visuals[`${pos.x},${pos.y}`] = { sprite: SPRITES.TREE0, frame: 0 };
  }

  return visuals;
}

// ─── Props decorativos ───────────────────────────────────────────────────────

const PROPS: TownPropDef[] = [
  // Barris fora da loja (lado leste da fachada)
  { x: 8, y: 3, sprite: SPRITES.DECOR0, frame: 1,  depth: 3 },
  { x: 8, y: 4, sprite: SPRITES.DECOR0, frame: 1,  depth: 3 },
  // Barris fora da pousada (lado oeste)
  { x: 15, y: 3, sprite: SPRITES.DECOR0, frame: 1, depth: 3 },
  { x: 15, y: 4, sprite: SPRITES.DECOR0, frame: 1, depth: 3 },
  // Decoração central da praça (entre cols 10-13, row 7)
  { x: 10, y: 7, sprite: SPRITES.DECOR0, frame: 32, depth: 3 },
  { x: 13, y: 7, sprite: SPRITES.DECOR0, frame: 32, depth: 3 },
];

// ─── NPCs ─────────────────────────────────────────────────────────────────────

const NPCS: TownNPCDef[] = [
  // Mercador — centro do interior da loja (x:3-7, y:3-5)
  {
    x: 5, y: 4,
    sprite: SPRITES.HUMANOID0, frame: 0, name: 'Mercador',
    houseBounds: { x: 3, y: 3, w: 5, h: 3 },
    interaction: { type: 'shop', message: 'Bem-vindo à minha loja! O que deseja?' },
  },
  // Taberneiro — centro do interior da pousada (x:17-20, y:3-5)
  {
    x: 18, y: 4,
    sprite: SPRITES.HUMANOID0, frame: 8, name: 'Taberneiro',
    houseBounds: { x: 17, y: 3, w: 4, h: 3 },
    interaction: {
      type: 'menu',
      message: 'Bem-vindo à pousada!',
      menuOptions: [
        { id: 'rest', label: 'Repousar (20 ouros)', content: 'Recupera toda sua vida e mana por 20 moedas de ouro.', action: 'rest', goldCost: 20 },
        { id: 'bye', label: 'Até mais', content: 'Volte quando precisar descansar.' },
      ],
    },
  },
  // Guarda — centro da praça, ao norte do spawn (sem houseBounds — acessível externamente)
  {
    x: 12, y: 6,
    sprite: SPRITES.HUMANOID0, frame: 16, name: 'Guarda',
    interaction: {
      type: 'menu',
      message: 'Saudações, aventureiro.',
      menuOptions: [
        { id: 'objectives', label: 'Objetivos do jogo', content: 'Explore a dungeon, colete itens, suba de nível e sobreviva o máximo que puder.' },
        { id: 'how_to_play', label: 'Como jogar', content: 'Use ↑↓←→ ou WASD para mover. Enfrente inimigos andando até eles. Colete itens andando sobre eles.' },
        { id: 'controls', label: 'Controles', content: '[I] Inventário  [E] Equipar/Comprar  [U] Usar  [D] Dropar  [T] Interagir  [ESC] Fechar' },
        { id: 'tips', label: 'Dicas iniciais', content: 'Visite o Mercador para equipamentos. Descanse na Taverna para recuperar HP/MP. Cuidado com o andar 3+.' },
      ],
    },
  },
  // Gato — lado sul da cidade (sem houseBounds — acessível externamente)
  {
    x: 3, y: 9,
    sprite: SPRITES.CAT0, frame: 0, name: 'Gato',
    customWanderBounds: { minX: 1, maxX: 6, minY: 7, maxY: 12 },
    interaction: { type: 'dialogue', message: 'Miau.' },
  },
];

// ─── Labels de texto ─────────────────────────────────────────────────────────

const LABELS: TownLabelDef[] = [
  { x: 4,  y: 2,  text: '[ Loja ]',    color: '#ffd700', depth: 4 },
  { x: 18, y: 2,  text: '[ Pousada ]', color: '#ffd700', depth: 4 },
  { x: 4,  y: 10, text: '[ Taverna ]', color: '#ffd700', depth: 4 },
  { x: 18, y: 10, text: '[ Casa ]',    color: '#ffd700', depth: 4 },
  { x: 12, y: 17, text: '▼ DUNGEON',   color: '#ff8800', depth: 4 },
];

// ─── Exportação ──────────────────────────────────────────────────────────────

export const TOWN_CONFIG: TownConfig = {
  width:  TOWN.WIDTH,
  height: TOWN.HEIGHT,
  startX: TOWN.START_X,
  startY: TOWN.START_Y,
  exitX:  TOWN.EXIT_X,
  exitY:  TOWN.EXIT_Y,
  grid:   GRID,
  tileVisuals: buildTileVisuals(),
  props:  PROPS,
  npcs:   NPCS,
  labels: LABELS,
};
