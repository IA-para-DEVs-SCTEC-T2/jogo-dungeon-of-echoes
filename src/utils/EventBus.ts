// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = { fn: (data: any) => void; ctx: unknown };

class SimpleEventEmitter {
  private _map: Map<string, Listener[]> = new Map();

  on<T = unknown>(event: string, fn: (data: T) => void, ctx?: unknown): this {
    const list = this._map.get(event) ?? [];
    list.push({ fn, ctx: ctx ?? null });
    this._map.set(event, list);
    return this;
  }

  off<T = unknown>(event: string, fn: (data: T) => void, ctx?: unknown): this {
    const list = this._map.get(event);
    if (!list) return this;
    this._map.set(
      event,
      list.filter((l) => !(l.fn === fn && l.ctx === (ctx ?? null))),
    );
    return this;
  }

  emit(event: string, ...args: unknown[]): this {
    const list = this._map.get(event);
    if (list) {
      [...list].forEach(({ fn, ctx }) => fn.call(ctx, args[0]));
    }
    return this;
  }
}

export const EventBus = new SimpleEventEmitter();
