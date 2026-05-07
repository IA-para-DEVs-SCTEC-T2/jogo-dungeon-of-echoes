import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { InputMode } from '../types/input';

export type { InputMode };

export class InputModeManager {
  private _mode: InputMode = 'GAMEPLAY';
  private _stack: InputMode[] = [];

  get current(): InputMode {
    return this._mode;
  }

  set(mode: InputMode): void {
    const previousMode = this._mode;
    this._mode = mode;
    EventBus.emit(EVENTS.INPUT_MODE_CHANGED, { mode, previousMode, timestamp: Date.now() });
  }

  is(mode: InputMode): boolean {
    return this._mode === mode;
  }

  push(mode: InputMode): void {
    this._stack.push(this._mode);
    this.set(mode);
  }

  pop(): void {
    const previous = this._stack.pop();
    if (previous !== undefined) {
      this.set(previous);
    }
  }
}
