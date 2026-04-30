/**
 * DungeonSystem.js — Geração procedural da dungeon
 * Spec: specs/dungeon.spec.md
 *
 * Algoritmo: Salas aleatórias + corredores em L
 * Grid: array 2D onde 0 = WALL, 1 = FLOOR
 */

import { DUNGEON, TILE } from '../config/constants.js';

export class DungeonSystem {
  /**
   * @param {number} width  - Largura do grid em tiles
   * @param {number} height - Altura do grid em tiles
   */
  constructor(width = DUNGEON.WIDTH, height = DUNGEON.HEIGHT) {
    this.width = width;
    this.height = height;
    this.grid = [];
    this.rooms = [];
    this.startPos = { x: 0, y: 0 };
  }

  /**
   * Gera a dungeon completa.
   * Regra R1: bordas sempre WALL
   * Regra R3: todas as salas conectadas
   * Regra R4: startPos sempre em FLOOR
   */
  generate(roomCount = DUNGEON.ROOM_COUNT) {
    this._initGrid();
    this._generateRooms(roomCount);
    this._connectRooms();

    // Fallback: se nenhuma sala foi gerada, cria uma sala central
    if (this.rooms.length === 0) {
      this._createFallbackRoom();
    }

    // startPos = centro da primeira sala
    const firstRoom = this.rooms[0];
    this.startPos = {
      x: Math.floor(firstRoom.x + firstRoom.width / 2),
      y: Math.floor(firstRoom.y + firstRoom.height / 2),
    };

    return this;
  }

  /**
   * Retorna o tipo do tile na posição (x, y).
   * Regra: fora dos limites retorna WALL (0) sem erro.
   */
  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return TILE.WALL;
    }
    return this.grid[y][x];
  }

  /**
   * Verifica se a posição é caminhável (FLOOR).
   */
  isWalkable(x, y) {
    return this.getTile(x, y) === TILE.FLOOR;
  }

  // ─── Métodos Privados ────────────────────────────────────────────────────

  /** Inicializa todo o grid como WALL */
  _initGrid() {
    this.grid = [];
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = new Array(this.width).fill(TILE.WALL);
    }
  }

  /** Tenta gerar `count` salas aleatórias sem sobreposição */
  _generateRooms(count) {
    for (let attempt = 0; attempt < count * 3; attempt++) {
      if (this.rooms.length >= count) break;

      const w = this._rand(DUNGEON.ROOM_MIN_W, DUNGEON.ROOM_MAX_W);
      const h = this._rand(DUNGEON.ROOM_MIN_H, DUNGEON.ROOM_MAX_H);
      // Margem de 1 tile para manter borda de WALL
      const x = this._rand(1, this.width - w - 1);
      const y = this._rand(1, this.height - h - 1);

      const newRoom = { x, y, width: w, height: h };

      if (!this._overlaps(newRoom)) {
        this._carveRoom(newRoom);
        this.rooms.push(newRoom);
      }
    }
  }

  /** Verifica se uma sala sobrepõe alguma sala existente (com margem de 1 tile) */
  _overlaps(room) {
    return this.rooms.some((r) => {
      return (
        room.x <= r.x + r.width &&
        room.x + room.width >= r.x &&
        room.y <= r.y + r.height &&
        room.y + room.height >= r.y
      );
    });
  }

  /** Preenche os tiles internos de uma sala com FLOOR */
  _carveRoom(room) {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.grid[y][x] = TILE.FLOOR;
      }
    }
  }

  /** Conecta salas consecutivas com corredores em L */
  _connectRooms() {
    for (let i = 1; i < this.rooms.length; i++) {
      const prev = this._roomCenter(this.rooms[i - 1]);
      const curr = this._roomCenter(this.rooms[i]);
      // Corredor horizontal primeiro, depois vertical
      this._carveHCorridor(prev.x, curr.x, prev.y);
      this._carveCorridor(prev.y, curr.y, curr.x);
    }
  }

  /** Corredor horizontal de x1 até x2 na linha y */
  _carveHCorridor(x1, x2, y) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      if (y > 0 && y < this.height - 1) {
        this.grid[y][x] = TILE.FLOOR;
      }
    }
  }

  /** Corredor vertical de y1 até y2 na coluna x */
  _carveCorridor(y1, y2, x) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      if (x > 0 && x < this.width - 1) {
        this.grid[y][x] = TILE.FLOOR;
      }
    }
  }

  /** Centro de uma sala */
  _roomCenter(room) {
    return {
      x: Math.floor(room.x + room.width / 2),
      y: Math.floor(room.y + room.height / 2),
    };
  }

  /** Fallback: cria uma sala central mínima se nenhuma foi gerada */
  _createFallbackRoom() {
    const cx = Math.floor(this.width / 2) - 3;
    const cy = Math.floor(this.height / 2) - 3;
    const fallback = { x: cx, y: cy, width: 6, height: 6 };
    this._carveRoom(fallback);
    this.rooms.push(fallback);
  }

  /** Número inteiro aleatório entre min e max (inclusive) */
  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Retorna uma posição FLOOR aleatória dentro de uma sala.
   * Útil para posicionar inimigos.
   */
  getRandomFloorPosition(excludePos = null) {
    const maxAttempts = 100;
    for (let i = 0; i < maxAttempts; i++) {
      const room = this.rooms[this._rand(0, this.rooms.length - 1)];
      const x = this._rand(room.x, room.x + room.width - 1);
      const y = this._rand(room.y, room.y + room.height - 1);

      if (excludePos && excludePos.x === x && excludePos.y === y) continue;
      if (this.isWalkable(x, y)) return { x, y };
    }
    // Fallback: retorna startPos
    return { ...this.startPos };
  }
}
