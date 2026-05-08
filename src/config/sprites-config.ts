// Créditos: DragonDePlatino — Dawnlike 16×16 (CC-BY 4.0)
import type { BiomeType } from '../types/town';

// ─── Definição Visual Unificada ───────────────────────────────────────────────

export interface VisualDef {
  imageFile:   string;   // nome real do arquivo (ex: 'Ground0.png')
  subfolder:   string;   // pasta dentro de assets/dawnlike/ (ex: 'Objects')
  textureKey:  string;   // chave registrada no Phaser (this.load.spritesheet)
  frames:      number[];
  weights:     number[]; // soma deve ser 1.0; um elemento = peso fixo 1.0
  description: string;
}

// ─── Biomas de Chão ───────────────────────────────────────────────────────────
// Ground0.png — 8 colunas × 7 linhas
// linha 0 (frames  0– 7): pedra/cinza
// linha 1 (frames  8–15): terra/marrom
// linha 2 (frames 16–23): grama/verde
// linha 3 (frames 24–31): areia
// linha 4 (frames 32–39): lama
// linha 5 (frames 40–47): neve
// linha 6 (frames 48–55): vulcânico

export const FLOOR_ATLAS: Record<BiomeType, VisualDef> = {
  urban: {
    imageFile:   'Floor.png',
    subfolder:   'Objects',
    textureKey:  'floor_urban', 
    // Pedra cinza da linha 1 (IDs reais do Floor.png fatiado em 16x16)
    frames:      [21, 22, 23], 
    weights:     [1.0],
    description: 'Caminho de pedra cinza',
  },
  natural: {
    imageFile:   'Floor.png',
    subfolder:   'Objects',
    textureKey:  'floor_urban',
    // Grama verde da linha 6 (IDs reais do Floor.png)
    frames:      [126, 127], 
    weights:     [0.80, 0.20],
    description: 'Grama verde vibrante',
  },
  interior: {
    imageFile:   'Ground0.png',
    subfolder:   'Objects',
    textureKey:  'ground', // Chave diferente para não confundir o Phaser
    // Tijolos clássicos da dungeon (IDs baixos para Ground0.png)
    frames:      [0, 1, 2], 
    weights:     [0.70, 0.30, 0.10],
    description: 'Piso da dungeon (Tijolo cinza)',
  },
  transition: {
    imageFile:   'Ground0.png',
    subfolder:   'Objects',
    textureKey:  'ground',
    // Terra/Areia da linha 1 do Ground0.png
    frames:      [17, 18], 
    weights:     [0.50, 0.50],
    description: 'Terra de transição',
  },
};
// ─── Objetos do Mundo ─────────────────────────────────────────────────────────
// Tree0.png   — 8 colunas, cada variante de árvore ocupa 8 frames por linha
// Decor0.png  — objetos decorativos variados (barris, caixas, sinais, portas)

export const OBJECT_ATLAS: Record<string, VisualDef> = {
  tree: {
    imageFile:   'Tree0.png',
    subfolder:   'Objects',
    textureKey:  'tree0',
    frames:      [0, 8, 16],
    weights:     [0.60, 0.30, 0.10],
    description: 'Árvore — 3 variantes de copa (linhas 0, 1 e 2 do Tree0.png)',
  },
  barrel: {
    imageFile:   'Decor0.png',
    subfolder:   'Objects',
    textureKey:  'decor0',
    frames:      [1, 2],
    weights:     [0.70, 0.30],
    description: 'Barril de madeira — frames 1 e 2 do Decor0.png',
  },
  crate: {
    imageFile:   'Decor0.png',
    subfolder:   'Objects',
    textureKey:  'decor0',
    frames:      [3, 4],
    weights:     [0.60, 0.40],
    description: 'Caixote — frames 3 e 4 do Decor0.png',
  },
  decor_plaza: {
    imageFile:   'Decor0.png',
    subfolder:   'Objects',
    textureKey:  'decor0',
    frames:      [32, 33],
    weights:     [0.50, 0.50],
    description: 'Decoração de praça — frames 32 e 33 do Decor0.png',
  },
  door_wood: {
    imageFile:   'Decor0.png',
    subfolder:   'Objects',
    textureKey:  'decor0',
    frames:      [8],
    weights:     [1.0],
    description: 'Porta de madeira — frame 8 do Decor0.png',
  },
  sign: {
    imageFile:   'Decor0.png',
    subfolder:   'Objects',
    textureKey:  'decor0',
    frames:      [40],
    weights:     [1.0],
    description: 'Placa de madeira — frame 40 do Decor0.png',
  },
};

// ─── NPCs ─────────────────────────────────────────────────────────────────────
// Humanoid0.png — cada conjunto de 8 frames é uma classe de personagem
// Cat0.png      — sprite do gato

export type NPCVisualDef = Omit<VisualDef, 'frames' | 'weights'> & { frame: number };

export const NPC_ATLAS: Record<string, NPCVisualDef> = {
  merchant: {
    imageFile:   'Humanoid0.png',
    subfolder:   'Characters',
    textureKey:  'humanoid0',
    frame:       0,
    description: 'Mercador — primeiro conjunto (frames 0–7) do Humanoid0.png',
  },
  innkeeper: {
    imageFile:   'Humanoid0.png',
    subfolder:   'Characters',
    textureKey:  'humanoid0',
    frame:       8,
    description: 'Estalajadeiro — segundo conjunto (frames 8–15) do Humanoid0.png',
  },
  guard: {
    imageFile:   'Humanoid0.png',
    subfolder:   'Characters',
    textureKey:  'humanoid0',
    frame:       16,
    description: 'Guarda — terceiro conjunto (frames 16–23) do Humanoid0.png',
  },
  townsperson: {
    imageFile:   'Humanoid0.png',
    subfolder:   'Characters',
    textureKey:  'humanoid0',
    frame:       24,
    description: 'Citadino genérico — quarto conjunto (frames 24–31) do Humanoid0.png',
  },
  cat: {
    imageFile:   'Cat0.png',
    subfolder:   'Characters',
    textureKey:  'cat0',
    frame:       0,
    description: 'Gato — frame 0 do Cat0.png',
  },
};

// ─── Constantes de Profundidade (Depth Layers) ────────────────────────────────

export const LAYER_GROUND     = 0;
export const LAYER_WORLD_BASE = 100;  // + gridY * 10 para Y-sort
export const LAYER_OVERHEAD   = 500;
export const LAYER_UI_LABELS  = 600;
