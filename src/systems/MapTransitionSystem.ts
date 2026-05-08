import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { SpawnPoint, TransitionPoint, TransitionResolution } from '../types/transitions';

export class MapTransitionSystem {
  private _spawnPoints  = new Map<string, SpawnPoint>();
  private _transitions  = new Map<string, TransitionPoint>();
  private _lastTransitionId:  string | null = null;
  private _lastFromMapId:     string | null = null;
  private _currentFloor = 1;

  registerSpawn(point: SpawnPoint): void {
    this._spawnPoints.set(point.id, point);
  }

  registerTransition(point: TransitionPoint): void {
    this._transitions.set(point.id, point);
  }

  setCurrentFloor(floor: number): void {
    this._currentFloor = floor;
  }

  requestTransition(transitionId: string): TransitionResolution | null {
    const transition = this._transitions.get(transitionId);
    if (!transition) {
      EventBus.emit(EVENTS.UI_LOG, `[ERRO] Transição não encontrada: ${transitionId}`);
      return null;
    }

    const targetSpawn = this._spawnPoints.get(transition.targetSpawnId);
    if (!targetSpawn) {
      EventBus.emit(EVENTS.UI_LOG, `[ERRO] SpawnPoint não encontrado: ${transition.targetSpawnId}`);
      return null;
    }

    this._lastTransitionId = transitionId;
    this._lastFromMapId    = transition.fromMapId;

    const resolution: TransitionResolution = {
      transitionId,
      targetMapId:    transition.toMapId,
      targetSpawn,
      transitionType: 'instant',
      floor:          this._currentFloor,
      metadata:       { fromMapId: transition.fromMapId },
    };

    EventBus.emit(EVENTS.MAP_TRANSITION_STARTED, { transitionId, timestamp: Date.now() });
    return resolution;
  }

  completeTransition(resolution: TransitionResolution): void {
    EventBus.emit(EVENTS.MAP_TRANSITION_COMPLETED, {
      targetMapId:  resolution.targetMapId,
      targetSpawn:  resolution.targetSpawn,
      floor:        resolution.floor,
      timestamp:    Date.now(),
    });
  }

  getReturnSpawnFor(toMapId: string): SpawnPoint | null {
    if (!this._lastTransitionId || !this._lastFromMapId) return null;

    // Procura transição reversa: de toMapId para lastFromMapId
    for (const [, t] of this._transitions) {
      if (t.fromMapId === toMapId && t.toMapId === this._lastFromMapId) {
        const spawn = this._spawnPoints.get(t.targetSpawnId);
        return spawn ?? null;
      }
    }
    return null;
  }
}
