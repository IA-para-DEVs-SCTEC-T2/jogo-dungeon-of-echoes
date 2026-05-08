export interface GridPos {
  x: number;
  y: number;
}

export interface EnemySerializedState {
  id: number;
  gridX: number;
  gridY: number;
  hp: number;
  maxHp: number;
  attack: number;
  alive: boolean;
}

export interface ItemSerializedState {
  id: string;
  type: string;
  gridX: number;
  gridY: number;
  identified: boolean;
}

export interface StairConnection {
  targetFloor: number | 'town';
  sourcePosition: GridPos;
  targetPosition: GridPos;
}

export interface FloorConnectionData {
  stairsUp?: StairConnection;
  stairsDown?: StairConnection;
}

export interface DungeonFloorState {
  floor: number;
  seed: number;
  discovered: boolean;
  connections: FloorConnectionData;
  enemyStates: EnemySerializedState[];
  itemStates: ItemSerializedState[];
}

export interface DungeonMetadata {
  currentFloor: number;
  maxFloorReached: number;
}
