export interface SpawnPoint {
  id: string;
  mapId: string;
  gridX: number;
  gridY: number;
}

export interface TransitionPoint {
  id: string;
  fromMapId: string;
  toMapId: string;
  fromGridX: number;
  fromGridY: number;
  targetSpawnId: string;
}

export interface TransitionResolution {
  transitionId: string;
  targetMapId: string;
  targetSpawn: SpawnPoint;
  transitionType: 'instant' | 'fade' | 'async';
  floor: number;
  preloadAssets?: string[];
  metadata: Record<string, unknown>;
}
