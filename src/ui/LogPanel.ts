import * as Phaser from 'phaser';
import { UI } from '../utils/constants';
import type { LogViewModel } from '../types/viewmodels';

const PADDING    = 8;
const LINE_H     = 13;
const FONT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '10px',
  color: '#aaffaa',
  fontFamily: 'monospace',
  wordWrap: { width: 0 },  // updated on layout
};

export class LogPanel {
  private _root: Phaser.GameObjects.Container;
  private _bg: Phaser.GameObjects.Rectangle;
  private _border: Phaser.GameObjects.Rectangle;
  private _textPool: Phaser.GameObjects.Text[];
  private _dirty = false;
  private _panelW = 0;
  private _panelH = 0;

  constructor(scene: Phaser.Scene) {
    this._root      = scene.add.container(0, 0).setScrollFactor(0).setDepth(190);
    this._bg        = scene.add.rectangle(0, 0, 10, 10, UI.LOG_BG_COLOR, UI.LOG_ALPHA).setOrigin(0, 0);
    this._border    = scene.add.rectangle(0, 0, 10, 10).setOrigin(0, 0).setStrokeStyle(1, UI.LOG_BORDER_COLOR).setFillStyle(0, 0);
    this._textPool  = [];

    for (let i = 0; i < UI.LOG_VISIBLE_LINES; i++) {
      this._textPool.push(scene.add.text(PADDING, 0, '', FONT_STYLE).setScrollFactor(0));
    }

    this._root.add([this._bg, this._border, ...this._textPool]);
    this.layout(scene.scale.width, scene.scale.height);
  }

  layout(screenW: number, screenH: number, reservedBottomHeight = 0): void {
    this._panelW = Math.floor(screenW * UI.LOG_PANEL_WIDTH_FRACTION);
    this._panelH = screenH - reservedBottomHeight;
    this._bg.setSize(this._panelW, this._panelH);
    this._border.setSize(this._panelW, this._panelH);

    const wrapW = this._panelW - PADDING * 2;
    const startY = this._panelH - PADDING - UI.LOG_VISIBLE_LINES * LINE_H;

    this._textPool.forEach((t, i) => {
      t.setPosition(PADDING, startY + i * LINE_H);
      t.setStyle({ ...FONT_STYLE, wordWrap: { width: wrapW } });
    });
    this._dirty = true;
  }

  markDirty(): void {
    this._dirty = true;
  }

  isDirty(): boolean {
    return this._dirty;
  }

  render(vm: LogViewModel): void {
    if (!this._dirty) return;
    this._dirty = false;

    const entries = vm.entries;
    const offset  = UI.LOG_VISIBLE_LINES - entries.length;

    this._textPool.forEach((t, i) => {
      const entry = entries[i - offset];
      if (entry) {
        t.setText(entry.text).setAlpha(entry.alpha);
      } else {
        t.setText('').setAlpha(1);
      }
    });
  }

  setVisible(visible: boolean): void {
    this._root.setVisible(visible);
  }
}
