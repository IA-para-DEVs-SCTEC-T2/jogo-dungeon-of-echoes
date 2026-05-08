import * as Phaser from 'phaser';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';

interface DialogOption {
  id: string;
  label: string;
  content: string;
  action?: string;
  goldCost?: number;
}

const DEPTH = 500;

export class DialogPanel {
  private _root: Phaser.GameObjects.Container;
  private _dirty = false;
  private _visible = false;
  private _titleText!: Phaser.GameObjects.Text;
  private _optionBgs: Phaser.GameObjects.Rectangle[] = [];
  private _optionTexts: Phaser.GameObjects.Text[] = [];
  private _contentText!: Phaser.GameObjects.Text;
  private _selectedIndex = 0;
  private _options: DialogOption[] = [];
  private readonly OPTION_POOL = 8;

  constructor(scene: Phaser.Scene) {
    this._root = scene.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH).setVisible(false);
    this._build(scene);

    EventBus.on(EVENTS.DIALOG_OPTION_SELECTED, (data: { index: number; option: DialogOption }) => {
      if (!this._visible) return;
      this._selectedIndex = data.index;
      this._dirty = true;
    }, this);
  }

  private _build(scene: Phaser.Scene): void {
    const sw = scene.scale.width;
    const sh = scene.scale.height;
    const panelW = Math.floor(sw * 0.7);
    const panelH = Math.floor(sh * 0.65);
    const ox = Math.floor((sw - panelW) / 2);
    const oy = Math.floor((sh - panelH) / 2);
    const padding = 10;
    const listW = Math.floor(panelW * 0.45);
    const rowH = 18;

    const bg     = scene.add.rectangle(ox, oy, panelW, panelH, 0x0a0a1a, 0.95).setOrigin(0, 0);
    const border = scene.add.rectangle(ox, oy, panelW, panelH).setOrigin(0, 0)
      .setStrokeStyle(2, 0x4444aa).setFillStyle(0, 0);
    this._titleText = scene.add.text(ox + panelW / 2, oy + 12, '', {
      fontSize: '12px', color: '#aabbff', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);
    const hint = scene.add.text(
      ox + panelW / 2, oy + panelH - 16,
      '[↑↓] Navegar  [Enter/E] Selecionar  [ESC] Fechar',
      { fontSize: '9px', color: '#556688', fontFamily: 'monospace' },
    ).setOrigin(0.5, 0);
    const divLine = scene.add.rectangle(ox + listW, oy + 35, 1, panelH - 50, 0x4444aa, 0.5).setOrigin(0, 0);

    for (let i = 0; i < this.OPTION_POOL; i++) {
      const y = oy + 40 + i * (rowH + 3);
      const bg2 = scene.add.rectangle(ox + padding, y, listW - padding * 2, rowH, 0x111133).setOrigin(0, 0);
      const txt = scene.add.text(ox + padding + 6, y + 3, '', { fontSize: '10px', color: '#e2e8f0', fontFamily: 'monospace' });
      const idx = i;
      bg2.setInteractive().on('pointerdown', () => {
        if (!this._visible) return;
        EventBus.emit(EVENTS.DIALOG_OPTION_SELECTED, { index: idx, option: this._options[idx] });
      });
      this._optionBgs.push(bg2);
      this._optionTexts.push(txt);
    }

    this._contentText = scene.add.text(
      ox + listW + padding, oy + 50, '',
      { fontSize: '10px', color: '#ccddee', fontFamily: 'monospace', wordWrap: { width: panelW - listW - padding * 2 } },
    );

    this._root.add([
      bg, border, this._titleText, hint, divLine,
      ...this._optionBgs, ...this._optionTexts,
      this._contentText,
    ]);
  }

  show(title: string, options: DialogOption[]): void {
    this._options = options;
    this._selectedIndex = 0;
    this._titleText.setText(title);
    this._visible = true;
    this._root.setVisible(true);
    this._dirty = true;
  }

  hide(): void { this._visible = false; this._root.setVisible(false); }
  markDirty(): void { this._dirty = true; }
  isDirty(): boolean { return this._dirty && this._visible; }
  isVisible(): boolean { return this._visible; }

  render(): void {
    if (!this._dirty) return;
    this._dirty = false;

    for (let i = 0; i < this.OPTION_POOL; i++) {
      const opt = this._options[i];
      if (!opt) {
        this._optionBgs[i].setFillStyle(0x0a0a1a);
        this._optionTexts[i].setText('');
        continue;
      }
      const selected = i === this._selectedIndex;
      this._optionBgs[i].setFillStyle(selected ? 0x334477 : 0x111133);
      this._optionTexts[i]
        .setText(opt.label)
        .setStyle({ fontSize: '10px', color: selected ? '#ffffff' : '#e2e8f0', fontFamily: 'monospace' });
    }

    const sel = this._options[this._selectedIndex];
    this._contentText.setText(sel?.content ?? '');
  }
}
