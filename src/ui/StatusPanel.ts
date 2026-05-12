import * as Phaser from 'phaser';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { StatusViewModel } from '../types/viewmodels';

const DEPTH        = 500;
const PANEL_BG     = 0x0a0a1a;
const PANEL_BORDER = 0x4444aa;
const TEXT_BASE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '10px',
  color: '#e2e8f0',
  fontFamily: 'monospace',
};
const TEXT_TITLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '11px',
  color: '#aabbff',
  fontFamily: 'monospace',
};
const TEXT_LABEL: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '10px',
  color: '#8888cc',
  fontFamily: 'monospace',
};
const TEXT_VALUE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '10px',
  color: '#ffffff',
  fontFamily: 'monospace',
};
const TEXT_FREE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '10px',
  color: '#ffdd88',
  fontFamily: 'monospace',
};
const BTN_COLOR  = 0x224422;
const BTN_HOVER  = 0x336633;

type SpendableStat = 'str' | 'intel' | 'dex' | 'con' | 'wis';

interface StatRow {
  label: Phaser.GameObjects.Text;
  value: Phaser.GameObjects.Text;
  btn:   Phaser.GameObjects.Rectangle;
  btnTxt:Phaser.GameObjects.Text;
  stat:  SpendableStat;
}

export class StatusPanel {
  private _root: Phaser.GameObjects.Container;
  private _dirty = false;
  private _visible = false;
  private _vm: StatusViewModel | null = null;

  private _levelText!:    Phaser.GameObjects.Text;
  private _xpText!:       Phaser.GameObjects.Text;
  private _hpText!:       Phaser.GameObjects.Text;
  private _manaText!:     Phaser.GameObjects.Text;
  private _atkText!:      Phaser.GameObjects.Text;
  private _freeText!:     Phaser.GameObjects.Text;
  private _statRows:      StatRow[] = [];

  private readonly STAT_ORDER: Array<{ key: SpendableStat; label: string }> = [
    { key: 'str',   label: 'STR' },
    { key: 'intel', label: 'INT' },
    { key: 'dex',   label: 'DEX' },
    { key: 'con',   label: 'VIT' },
    { key: 'wis',   label: 'WIS' },
  ];

  constructor(scene: Phaser.Scene) {
    this._root = scene.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH).setVisible(false);
    this._build(scene);
  }

  private _build(scene: Phaser.Scene): void {
    const sw = scene.scale.width;
    const sh = scene.scale.height;
    const panelW = Math.floor(sw * 0.85);
    const panelH = Math.floor(sh * 0.80);
    const ox     = Math.floor((sw - panelW) / 2);
    const oy     = Math.floor((sh - panelH) / 2);
    const pad    = 12;
    const rowH   = 18;

    const bg     = scene.add.rectangle(ox, oy, panelW, panelH, PANEL_BG, 0.95).setOrigin(0, 0);
    const border = scene.add.rectangle(ox, oy, panelW, panelH).setOrigin(0, 0)
      .setStrokeStyle(2, PANEL_BORDER).setFillStyle(0, 0);

    // Coluna esquerda: atributos
    // Deslocado 32px para baixo das abas (tabH=24 + margem)
    const contentStartY = oy + 36;
    const colX = ox + pad;
    let y = contentStartY;

    for (const { key, label } of this.STAT_ORDER) {
      const lbl  = scene.add.text(colX, y, label + ':', TEXT_LABEL);
      const val  = scene.add.text(colX + 60, y, '0', TEXT_VALUE);
      const btn  = scene.add.rectangle(colX + 100, y + 1, 20, rowH - 4, BTN_COLOR).setOrigin(0, 0);
      const btxt = scene.add.text(colX + 106, y + 1, '+', { ...TEXT_BASE, color: '#88ff88' });

      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setFillStyle(BTN_HOVER, 1));
      btn.on('pointerout',  () => btn.setFillStyle(BTN_COLOR, 1));
      btn.on('pointerdown', () => EventBus.emit(EVENTS.STAT_POINT_SPENT_REQUEST, { stat: key }));

      this._statRows.push({ label: lbl, value: val, btn, btnTxt: btxt, stat: key });
      y += rowH + 4;
    }

    // Coluna direita: stats derivados
    const col2X = ox + panelW / 2;
    this._levelText = scene.add.text(col2X, contentStartY,        'Nível: 1',         { ...TEXT_BASE, color: '#aaddff' });
    this._xpText    = scene.add.text(col2X, contentStartY + 20,   'XP: 0 / 100',      TEXT_BASE);
    this._hpText    = scene.add.text(col2X, contentStartY + 40,   'HP: 0 / 0',        { ...TEXT_BASE, color: '#88ff88' });
    this._manaText  = scene.add.text(col2X, contentStartY + 60,   'Mana: 0 / 0',      { ...TEXT_BASE, color: '#88aaff' });
    this._atkText   = scene.add.text(col2X, contentStartY + 80,   'ATK: 0',           TEXT_BASE);
    this._freeText  = scene.add.text(col2X, contentStartY + 110,  'Pontos livres: 0', TEXT_FREE);

    const allBtns = this._statRows.map(r => r.btn);
    const allBtnTxts = this._statRows.map(r => r.btnTxt);
    const allLabels = this._statRows.map(r => r.label);
    const allValues = this._statRows.map(r => r.value);

    this._root.add([
      bg, border,
      ...allLabels, ...allValues, ...allBtns, ...allBtnTxts,
      this._levelText, this._xpText, this._hpText, this._manaText,
      this._atkText, this._freeText,
    ]);
  }

  show(): void {
    this._visible = true;
    this._root.setVisible(true);
    this._dirty = true;
  }

  hide(): void {
    this._visible = false;
    this._root.setVisible(false);
  }

  isVisible(): boolean { return this._visible; }
  markDirty(): void    { this._dirty = true; }
  isDirty(): boolean   { return this._dirty && this._visible; }

  render(vm: StatusViewModel): void {
    if (!this._dirty) return;
    this._dirty = false;
    this._vm    = vm;

    this._levelText.setText(`Nível: ${vm.level}`);
    this._xpText.setText(`XP: ${vm.xp} / ${vm.xpNext}`);
    this._hpText.setText(`HP: ${vm.hp} / ${vm.maxHp}`);
    this._manaText.setText(`Mana: ${vm.mana} / ${vm.maxMana}`);
    this._atkText.setText(`ATK: ${vm.attack}`);
    this._freeText.setText(`Pontos livres: ${vm.freePoints}`);

    const hasFree = vm.freePoints > 0;
    const valMap: Record<SpendableStat, number> = {
      str:   vm.str,
      intel: vm.intel,
      dex:   vm.dex,
      con:   vm.con,
      wis:   vm.wis,
    };

    for (const row of this._statRows) {
      row.value.setText(String(valMap[row.stat]));
      row.btn.setVisible(hasFree);
      row.btnTxt.setVisible(hasFree);
    }
  }
}
