import { DUNGEON, TILE } from '../utils/constants';

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridPos {
  x: number;
  y: number;
}

export class DungeonGenerator {
  width: number;
  height: number;
  grid: number[][];
  rooms: Room[];
  startPos: GridPos;

  constructor(width = DUNGEON.WIDTH, height = DUNGEON.HEIGHT) {
    this.width = width;
    this.height = height;
    this.grid = [];
    this.rooms = [];
    this.startPos = { x: 0, y: 0 };
  }

  generate(roomCount = DUNGEON.ROOM_COUNT): this {
    this._initGrid();
    this._generateRooms(roomCount);
    this._connectRooms();

    if (this.rooms.length === 0) {
      this._createFallbackRoom();
    }

    const firstRoom = this.rooms[0];
    this.startPos = {
      x: Math.floor(firstRoom.x + firstRoom.width / 2),
      y: Math.floor(firstRoom.y + firstRoom.height / 2),
    };

    return this;
  }

  getTile(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return TILE.WALL;
    }
    return this.grid[y][x];
  }

  isWalkable(x: number, y: number): boolean {
    return this.getTile(x, y) === TILE.FLOOR;
  }

  getRandomFloorPosition(excludePos: GridPos | null = null): GridPos {
    const maxAttempts = 100;
    for (let i = 0; i < maxAttempts; i++) {
      const room = this.rooms[this._rand(0, this.rooms.length - 1)];
      const x = this._rand(room.x, room.x + room.width - 1);
      const y = this._rand(room.y, room.y + room.height - 1);
      if (excludePos && excludePos.x === x && excludePos.y === y) continue;
      if (this.isWalkable(x, y)) return { x, y };
    }
    return { ...this.startPos };
  }

  // ─── Privados ────────────────────────────────────────────────────────────

  private _initGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = new Array(this.width).fill(TILE.WALL);
    }
  }

  private _generateRooms(count: number): void {
    for (let attempt = 0; attempt < count * 3; attempt++) {
      if (this.rooms.length >= count) break;

      const w = this._rand(DUNGEON.ROOM_MIN_W, DUNGEON.ROOM_MAX_W);
      const h = this._rand(DUNGEON.ROOM_MIN_H, DUNGEON.ROOM_MAX_H);
      const x = this._rand(1, this.width - w - 1);
      const y = this._rand(1, this.height - h - 1);
      const newRoom: Room = { x, y, width: w, height: h };

      if (!this._overlaps(newRoom)) {
        this._carveRoom(newRoom);
        this.rooms.push(newRoom);
      }
    }
  }

  private _overlaps(room: Room): boolean {
    return this.rooms.some(
      (r) =>
        room.x <= r.x + r.width &&
        room.x + room.width >= r.x &&
        room.y <= r.y + r.height &&
        room.y + room.height >= r.y,
    );
  }

  private _carveRoom(room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.grid[y][x] = TILE.FLOOR;
      }
    }
  }

  private _connectRooms(): void {
    for (let i = 1; i < this.rooms.length; i++) {
      const prev = this._roomCenter(this.rooms[i - 1]);
      const curr = this._roomCenter(this.rooms[i]);
      this._carveHCorridor(prev.x, curr.x, prev.y);
      this._carveCorridor(prev.y, curr.y, curr.x);
    }
  }

  private _carveHCorridor(x1: number, x2: number, y: number): void {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      if (y > 0 && y < this.height - 1) this.grid[y][x] = TILE.FLOOR;
    }
  }

  private _carveCorridor(y1: number, y2: number, x: number): void {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      if (x > 0 && x < this.width - 1) this.grid[y][x] = TILE.FLOOR;
    }
  }

  private _roomCenter(room: Room): GridPos {
    return {
      x: Math.floor(room.x + room.width / 2),
      y: Math.floor(room.y + room.height / 2),
    };
  }

  private _createFallbackRoom(): void {
    const cx = Math.floor(this.width / 2) - 3;
    const cy = Math.floor(this.height / 2) - 3;
    const fallback: Room = { x: cx, y: cy, width: 6, height: 6 };
    this._carveRoom(fallback);
    this.rooms.push(fallback);
  }

  private _rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Alias para compatibilidade com testes existentes
export { DungeonGenerator as DungeonSystem };
