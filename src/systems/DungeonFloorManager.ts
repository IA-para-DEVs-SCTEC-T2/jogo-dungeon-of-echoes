import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { DungeonFloorState, DungeonMetadata, FloorConnectionData } from '../types/dungeon';

export class DungeonFloorManager {
  private _floors      = new Map<number, DungeonFloorState>();
  private _connections = new Map<number, FloorConnectionData>();
  private _meta: DungeonMetadata = { currentFloor: 1, maxFloorReached: 1 };

  get currentFloor(): number {
    return this._meta.currentFloor;
  }

  get maxFloorReached(): number {
    return this._meta.maxFloorReached;
  }

  saveFloor(state: DungeonFloorState): void {
    this._floors.set(state.floor, state);
  }

  loadFloor(floor: number): DungeonFloorState | null {
    return this._floors.get(floor) ?? null;
  }

  hasFloor(floor: number): boolean {
    return this._floors.has(floor);
  }

  descend(): void {
    const previousFloor = this._meta.currentFloor;
    this._meta.currentFloor++;
    if (this._meta.currentFloor > this._meta.maxFloorReached) {
      this._meta.maxFloorReached = this._meta.currentFloor;
    }
    const floor = this._meta.currentFloor;
    EventBus.emit(EVENTS.FLOOR_DESCEND,  { floor, timestamp: Date.now() });
    EventBus.emit(EVENTS.FLOOR_CHANGED,  { floor, previousFloor, timestamp: Date.now() });
    EventBus.emit(EVENTS.UI_LOG, `Você desce para o andar ${floor}…`);
  }

  ascend(): void {
    if (this._meta.currentFloor <= 1) return;
    const previousFloor = this._meta.currentFloor;
    this._meta.currentFloor--;
    const floor = this._meta.currentFloor;
    EventBus.emit(EVENTS.FLOOR_ASCEND,  { floor, timestamp: Date.now() });
    EventBus.emit(EVENTS.FLOOR_CHANGED, { floor, previousFloor, timestamp: Date.now() });
    EventBus.emit(EVENTS.UI_LOG, `Você sobe para o andar ${floor}.`);
  }

  saveFloorConnections(floor: number, data: FloorConnectionData): void {
    this._connections.set(floor, data);
  }

  getFloorConnections(floor: number): FloorConnectionData | null {
    return this._connections.get(floor) ?? null;
  }

  reset(): void {
    this._floors.clear();
    this._connections.clear();
    this._meta = { currentFloor: 1, maxFloorReached: 1 };
  }
}
