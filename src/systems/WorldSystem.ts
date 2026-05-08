import type { Item } from '../entities/Item';
import { DungeonGenerator } from '../generators/DungeonGenerator';
import { TOWN_CONFIG } from '../config/town.config';

/**
 * TownMap — mapa fixo da cidade. Estende DungeonGenerator para compatibilidade
 * com TurnManager e EnemySystem sem alterar suas assinaturas.
 * Grid e spawn lidos do TOWN_CONFIG (data-driven).
 */
export class TownMap extends DungeonGenerator {
  constructor() {
    super(TOWN_CONFIG.width, TOWN_CONFIG.height);
    // Cópia profunda para evitar mutação do config
    this.grid = TOWN_CONFIG.grid.map(row => [...row]);
    this.rooms = [];
    this.startPos = { x: TOWN_CONFIG.startX, y: TOWN_CONFIG.startY };
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
