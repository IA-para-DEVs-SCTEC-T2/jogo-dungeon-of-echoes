export type BiomeType = 'urban' | 'natural' | 'interior' | 'transition';
export type TileLayerName = 'ground' | 'world' | 'overhead';
export type NPCStateId = 'idle' | 'wander';
export type InteractiveType = 'door' | 'sign' | 'chest';

export interface DialogMenuOption {
  id: string;
  label: string;
  content: string;
  action?: 'rest';
  goldCost?: number;
}

export interface ResolvedTile { sprite: string; frame: number; biome: BiomeType; }

export interface ProcessedTownLayout {
  width: number; height: number;
  collisionGrid: number[][];
  groundTiles:  ResolvedTile[][];
  worldObjects: WorldObjectDef[];
  npcs:         NPCInstanceDef[];
  interactive:  InteractiveObjectDef[];
  spawnPos:     { x: number; y: number };
  exitPos:      { x: number; y: number };
}

export interface WorldObjectDef {
  gridX: number; gridY: number;
  sprite: string; frame: number;
  solid: boolean;
  layer: TileLayerName;
}

export interface NPCInstanceDef {
  id: string;
  gridX: number; gridY: number;
  sprite: string; frame: number;
  name: string;
  state: NPCStateId;
  wanderBounds?: { minX: number; maxX: number; minY: number; maxY: number };
  houseBounds?: { x: number; y: number; w: number; h: number };
  interactRange?: number;
  interaction?: {
    type: 'dialogue' | 'shop' | 'menu';
    message: string;
    menuOptions?: DialogMenuOption[];
  };
}

export interface InteractiveObjectDef {
  gridX: number; gridY: number;
  type: InteractiveType;
  label?: string;
  properties?: Record<string, unknown>;
}
