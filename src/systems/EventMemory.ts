/**
 * EventMemory.ts — Memória de eventos da partida
 * Fase 6: Narrativa Emergente com IA
 *
 * Registra eventos importantes da run e os disponibiliza
 * para o NarrativeService gerar narrativa contextualizada.
 *
 * PRINCÍPIO: A IA nunca inventa — só narra o que realmente aconteceu.
 */

export type GameEventType =
  | 'PLAYER_DAMAGED'
  | 'PLAYER_HEALED'
  | 'ENEMY_KILLED'
  | 'ITEM_USED'
  | 'ITEM_FOUND'
  | 'FLOOR_CHANGED'
  | 'PLAYER_NEAR_DEATH'
  | 'PLAYER_DEATH'
  | 'ELITE_ENEMY_FOUND';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

/** Eventos considerados "importantes" para a narrativa */
const IMPORTANT_TYPES = new Set<GameEventType>([
  'PLAYER_NEAR_DEATH',
  'PLAYER_DEATH',
  'ELITE_ENEMY_FOUND',
  'FLOOR_CHANGED',
  'ENEMY_KILLED',
  'ITEM_FOUND',
]);

/** Máximo de eventos armazenados na memória */
const MAX_EVENTS = 100;

/** Mínimo de ms entre dois eventos do mesmo tipo (evita spam) */
const DEBOUNCE_MS: Partial<Record<GameEventType, number>> = {
  PLAYER_DAMAGED:    500,
  PLAYER_HEALED:     500,
  ENEMY_KILLED:      200,
};

export class EventMemory {
  private _events: GameEvent[] = [];
  private _lastTimestampByType: Partial<Record<GameEventType, number>> = {};

  // ─── Adicionar ───────────────────────────────────────────────────────────

  addEvent(event: GameEvent): void {
    const debounce = DEBOUNCE_MS[event.type];
    if (debounce !== undefined) {
      const last = this._lastTimestampByType[event.type] ?? 0;
      if (event.timestamp - last < debounce) return; // ignorar duplicata rápida
    }

    this._lastTimestampByType[event.type] = event.timestamp;
    this._events.push(event);

    // Manter tamanho máximo (FIFO)
    if (this._events.length > MAX_EVENTS) {
      this._events.shift();
    }
  }

  // ─── Consulta ────────────────────────────────────────────────────────────

  /** Retorna os N eventos mais recentes */
  getRecentEvents(limit = 10): GameEvent[] {
    return this._events.slice(-limit);
  }

  /**
   * Retorna eventos importantes para a narrativa.
   * Prioriza: morte, quase-morte, elites, mudança de andar, itens raros.
   * Remove eventos repetitivos do mesmo tipo consecutivo.
   */
  getImportantEvents(limit = 10): GameEvent[] {
    const important = this._events.filter(e => IMPORTANT_TYPES.has(e.type));

    // Deduplicar: remover eventos do mesmo tipo consecutivos
    const deduped: GameEvent[] = [];
    let lastType: GameEventType | null = null;
    for (const event of important) {
      if (event.type !== lastType) {
        deduped.push(event);
        lastType = event.type;
      }
    }

    return deduped.slice(-limit);
  }

  /** Retorna todos os eventos (para debug) */
  getAllEvents(): GameEvent[] {
    return [...this._events];
  }

  /** Conta quantas vezes um tipo de evento ocorreu */
  countByType(type: GameEventType): number {
    return this._events.filter(e => e.type === type).length;
  }

  /** Verifica se algum evento do tipo ocorreu */
  hasEvent(type: GameEventType): boolean {
    return this._events.some(e => e.type === type);
  }

  /** Reseta a memória (nova partida) */
  reset(): void {
    this._events = [];
    this._lastTimestampByType = {};
  }

  // ─── Serialização para prompt ─────────────────────────────────────────────

  /**
   * Converte eventos em linhas de texto legíveis para o prompt da IA.
   * Máximo de `limit` eventos, simplificados.
   */
  toPromptLines(limit = 10): string[] {
    const events = this.getImportantEvents(limit);
    return events.map(e => this._eventToText(e));
  }

  private _eventToText(event: GameEvent): string {
    switch (event.type) {
      case 'PLAYER_DAMAGED':
        return `Jogador sofreu ${event.data.damage ?? '?'} de dano`;
      case 'PLAYER_HEALED':
        return `Jogador se curou ${event.data.amount ?? '?'} de HP`;
      case 'ENEMY_KILLED':
        return `Jogador derrotou ${event.data.enemyName ?? 'um inimigo'}`;
      case 'ITEM_USED':
        return `Jogador usou ${event.data.itemName ?? 'um item'}`;
      case 'ITEM_FOUND':
        return `Jogador encontrou ${event.data.itemName ?? 'um item'}`;
      case 'FLOOR_CHANGED':
        return `Jogador desceu para o andar ${event.data.floor ?? '?'}`;
      case 'PLAYER_NEAR_DEATH':
        return `Jogador quase morreu (HP muito baixo: ${event.data.hp ?? '?'})`;
      case 'PLAYER_DEATH':
        return `Jogador morreu no andar ${event.data.floor ?? '?'}`;
      case 'ELITE_ENEMY_FOUND':
        return `Jogador encontrou inimigo elite: ${event.data.name ?? 'desconhecido'}`;
      default:
        return `Evento: ${event.type}`;
    }
  }
}
