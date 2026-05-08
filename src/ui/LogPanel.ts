import * as Phaser from 'phaser';
import { UI } from '../utils/constants';
import type { LogViewModel } from '../types/viewmodels';

const PADDING = 6;
const LINE_H  = 13;
const FONT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '10px',
  color: '#aaffaa',
  fontFamily: 'monospace',
  wordWrap: { width: 0 },
};

export class LogPanel {
  private _root:     Phaser.GameObjects.Container;
  private _bg:       Phaser.GameObjects.Rectangle;
  private _border:   Phaser.GameObjects.Rectangle;
  private _textPool: Phaser.GameObjects.Text[];
  private _panelW  = 0;
  private _textX   = PADDING;
  private _boxY    = 0;
  private _boxH    = 0;

  constructor(scene: Phaser.Scene) {
    this._root     = scene.add.container(0, 0).setScrollFactor(0).setDepth(190);
    this._bg       = scene.add.rectangle(0, 0, 10, 10, UI.LOG_BG_COLOR, UI.LOG_ALPHA).setOrigin(0, 0);
    this._border   = scene.add.rectangle(0, 0, 10, 10).setOrigin(0, 0).setStrokeStyle(1, UI.LOG_BORDER_COLOR).setFillStyle(0, 0);
    this._textPool = [];

    for (let i = 0; i < UI.LOG_VISIBLE_LINES; i++) {
      this._textPool.push(scene.add.text(0, 0, '', FONT_STYLE).setScrollFactor(0).setVisible(false));
    }

    this._root.add([this._bg, this._border, ...this._textPool]);
    this.layout(scene.scale.width, scene.scale.height);
  }

  layout(screenW: number, screenH: number, reservedBottomHeight = 0): void {
    this._panelW = Math.floor(screenW * UI.LOG_PANEL_WIDTH_FRACTION);
    const wrapW  = this._panelW - PADDING * 2;
    this._boxH   = UI.LOG_VISIBLE_LINES * LINE_H + PADDING * 2;
    this._boxY   = screenH - reservedBottomHeight - this._boxH;
    this._textX  = PADDING;

    this._bg.setPosition(0, this._boxY).setSize(this._panelW, this._boxH);
    this._border.setPosition(0, this._boxY).setSize(this._panelW, this._boxH);

    this._textPool.forEach(t => {
      t.setPosition(this._textX, this._boxY);
      t.setStyle({ ...FONT_STYLE, wordWrap: { width: wrapW } });
      t.setVisible(false);
    });
  }

  render(vm: LogViewModel): void {
    this._textPool.forEach(t => t.setVisible(false));
    let y = this._boxY + this._boxH - PADDING;
    let poolIdx = 0;
    for (let i = vm.entries.length - 1; i >= 0 && poolIdx < this._textPool.length; i--) {
      const entry = vm.entries[i];
      const text  = this._textPool[poolIdx];
      text.setText(entry.text).setAlpha(entry.alpha);
      // After setText, text.height reflects actual wrapped height
      y -= text.height + 2;
      if (y < this._boxY + PADDING) break;
      text.setPosition(this._textX, y);
      text.setVisible(true);
      poolIdx++;
    }
  }

  setVisible(visible: boolean): void {
    this._root.setVisible(visible);
  }
}
