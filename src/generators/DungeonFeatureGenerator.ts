import { DungeonGenerator } from './DungeonGenerator';
import type { GridPos } from './DungeonGenerator';
import { TILE } from '../utils/constants';
import type { StairConnection, FloorConnectionData } from '../types/dungeon';

export type FeatureType = 'stairDown' | 'stairUp' | 'trap' | 'shrine' | 'portal' | 'chest';

export interface DungeonFeature {
  type: FeatureType;
  gridX: number;
  gridY: number;
  connection?: StairConnection;
  metadata?: Record<string, unknown>;
}

export interface FeatureOptions {
  excludePositions?: GridPos[];
}

const MIN_STAIR_DISTANCE = 5;

export class DungeonFeatureGenerator {
  /**
   * Gera features do andar. Sempre produz stairUp + stairDown.
   * Floor 1: stairUp.targetFloor = 'town'
   * Floor N>1: stairUp.targetFloor = N-1
   * targetPosition é preenchido pela GameScene após o floor vizinho ser gerado.
   */
  generate(dungeon: DungeonGenerator, floor: number, options: FeatureOptions = {}): DungeonFeature[] {
    const features: DungeonFeature[] = [];
    const excluded = new Set<string>([
      `${dungeon.startPos.x},${dungeon.startPos.y}`,
      ...(options.excludePositions ?? []).map(p => `${p.x},${p.y}`),
    ]);

    // stairUp: preferencialmente em room diferente do stairDown
    const upRoomIdx   = 0;
    const downRoomIdx = dungeon.rooms.length > 1 ? dungeon.rooms.length - 1 : 0;

    const upPos = this._findPositionInRoom(dungeon, upRoomIdx, excluded);
    if (upPos) {
      excluded.add(`${upPos.x},${upPos.y}`);
      const upConn: StairConnection = {
        targetFloor:    floor === 1 ? 'town' : floor - 1,
        sourcePosition: { x: upPos.x, y: upPos.y },
        targetPosition: { x: 0, y: 0 }, // preenchido depois
      };
      features.push({ type: 'stairUp', gridX: upPos.x, gridY: upPos.y, connection: upConn });
    }

    // stairDown: em room diferente, respeitando distância mínima
    const downPos = this._findPositionInRoomWithMinDistance(
      dungeon, downRoomIdx, excluded,
      upPos ? [upPos] : [],
    );
    if (downPos) {
      const downConn: StairConnection = {
        targetFloor:    floor + 1,
        sourcePosition: { x: downPos.x, y: downPos.y },
        targetPosition: { x: 0, y: 0 }, // preenchido depois
      };
      features.push({ type: 'stairDown', gridX: downPos.x, gridY: downPos.y, connection: downConn });
    }

    // Baús: 1-2 por andar, em rooms intermediárias (evitando a primeira e a última)
    const chestCount = 1 + Math.floor(Math.random() * 2);
    const midRooms = dungeon.rooms.length > 2
      ? dungeon.rooms.slice(1, dungeon.rooms.length - 1)
      : dungeon.rooms;

    for (let i = 0; i < chestCount; i++) {
      const roomIdx = Math.floor(Math.random() * midRooms.length);
      const absoluteRoomIdx = dungeon.rooms.indexOf(midRooms[roomIdx]);
      const pos = this._findPositionInRoom(dungeon, absoluteRoomIdx, excluded);
      if (!pos) continue;
      excluded.add(`${pos.x},${pos.y}`);
      features.push({
        type: 'chest',
        gridX: pos.x,
        gridY: pos.y,
        metadata: { opened: false },
      });
    }

    return features;
  }

  /** Extrai FloorConnectionData das features geradas. */
  extractConnections(features: DungeonFeature[]): FloorConnectionData {
    const data: FloorConnectionData = {};
    for (const f of features) {
      if (f.type === 'stairUp'   && f.connection) data.stairsUp   = f.connection;
      if (f.type === 'stairDown' && f.connection) data.stairsDown = f.connection;
    }
    return data;
  }

  private _findPositionInRoom(
    dungeon: DungeonGenerator,
    roomIdx: number,
    excluded: Set<string>,
  ): GridPos | null {
    if (dungeon.rooms.length === 0) return null;
    const room = dungeon.rooms[Math.min(roomIdx, dungeon.rooms.length - 1)];

    for (let dy = 0; dy < room.height; dy++) {
      for (let dx = 0; dx < room.width; dx++) {
        const x = room.x + dx;
        const y = room.y + dy;
        if (!excluded.has(`${x},${y}`) && dungeon.getTile(x, y) === TILE.FLOOR) {
          return { x, y };
        }
      }
    }
    return null;
  }

  private _findPositionInRoomWithMinDistance(
    dungeon: DungeonGenerator,
    roomIdx: number,
    excluded: Set<string>,
    mustBeDistantFrom: GridPos[],
  ): GridPos | null {
    if (dungeon.rooms.length === 0) return null;
    const room = dungeon.rooms[Math.min(roomIdx, dungeon.rooms.length - 1)];

    for (let dy = 0; dy < room.height; dy++) {
      for (let dx = 0; dx < room.width; dx++) {
        const x = room.x + dx;
        const y = room.y + dy;
        if (excluded.has(`${x},${y}`)) continue;
        if (dungeon.getTile(x, y) !== TILE.FLOOR) continue;
        const tooClose = mustBeDistantFrom.some(p => this._dist(p, { x, y }) < MIN_STAIR_DISTANCE);
        if (!tooClose) return { x, y };
      }
    }

    // Fallback: aceita qualquer tile walkable na room, ignorando distância mínima
    return this._findPositionInRoom(dungeon, roomIdx, excluded);
  }

  private _dist(a: GridPos, b: GridPos): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
}
