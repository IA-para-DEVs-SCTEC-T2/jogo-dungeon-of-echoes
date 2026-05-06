import { Item } from '../entities/Item';
import { DungeonGenerator } from '../generators/DungeonGenerator';
import { TILE, TOWN } from '../utils/constants';

/**
 * TownMap — mapa fixo da cidade. Estende DungeonGenerator para compatibilidade
 * com TurnManager e EnemySystem sem alterar suas assinaturas.
 */
export class TownMap extends DungeonGenerator {
  constructor() {
    const { WIDTH: W, HEIGHT: H } = TOWN;
    super(W, H);
    this.grid = Array.from({ length: H }, (_, y) =>
      Array.from({ length: W }, (_, x) => {
        if (x === 0 || x === W - 1 || y === 0 || y === H - 1) return TILE.WALL;
        return TILE.FLOOR;
      })
    );
    this.rooms = [];
    this.startPos = { x: TOWN.START_X, y: TOWN.START_Y };
  }
}

export type DungeonState = {
  dungeon: DungeonGenerator;
  items: Item[];
  floorFrame: number;
};

class WorldSystem {
  private static _inst: WorldSystem;
  static get instance(): WorldSystem { return (this._inst ??= new WorldSystem()); }

  private _dungeon: DungeonState | null = null;

  hasDungeon(): boolean   { return this._dungeon !== null; }
  saveDungeon(s: DungeonState): void { this._dungeon = s; }
  loadDungeon(): DungeonState | null  { return this._dungeon; }
  clearDungeon(): void    { this._dungeon = null; }
}

export const worldSystem = WorldSystem.instance;
