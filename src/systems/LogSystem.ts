import { EventBus } from '../utils/EventBus';
import { EVENTS, UI } from '../utils/constants';
import type { LogViewModel, LogEntryViewModel } from '../types/viewmodels';

export type LogCategory = 'combat' | 'item' | 'system' | 'floor';

export interface LogEntry {
  message: string;
  timestamp: number;
  category?: LogCategory;
}

export class LogSystem {
  private _buffer: LogEntry[] = [];
  private readonly _maxEntries: number;

  constructor(maxEntries = UI.LOG_MAX_HISTORY) {
    this._maxEntries = maxEntries;
  }

  add(message: string, category?: LogCategory): void {
    this._buffer.push({ message, timestamp: Date.now(), category });
    if (this._buffer.length > this._maxEntries) {
      this._buffer.shift();
    }
  }

  getVisible(count: number): LogEntry[] {
    return this._buffer.slice(-count);
  }

  buildViewModel(visibleCount: number): LogViewModel {
    const entries = this.getVisible(visibleCount);
    const total = entries.length;
    const result: LogEntryViewModel[] = entries.map((entry, i) => {
      const age = total - 1 - i;
      const alpha = Math.max(0.4, 1 - age * 0.06);
      return { text: `> ${entry.message}`, alpha };
    });
    return { entries: result };
  }

  clear(): void {
    this._buffer = [];
  }

  bindEventBus(): void {
    EventBus.on(EVENTS.UI_LOG, (message: string) => {
      this.add(message);
    });
  }
}
