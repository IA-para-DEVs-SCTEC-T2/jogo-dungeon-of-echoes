import * as Phaser from 'phaser';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { SpellsViewModel, SpellListItemViewModel } from '../types/viewmodels';

const DEPTH        = 500;
const PANEL_BG     = 0x0a0a1a;
const PANEL_BORDER = 0x4444aa;
const SEL_COLOR    = 0x334477;
const EMPTY_COLOR  = 0x111133;
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

const ELEMENT_COLORS: Record<string, string> = {
  fire:   '#ff8844',
  ice:    '#88ccff',
  wind:   '#88ffaa',
  arcane: '#cc88ff',
};

const SLOT_POOL = 4;
const LIST_POOL = 10;

export class SpellsPanel {
  private _root:     Phaser.GameObjects.Container;
  private _dirty     = false;
  private _visible   = false;
  private _selectedId: string | null = null;

  // Slots ativos (J, K)
  private _slotBgs:   Phaser.GameObjects.Rectangle[]  = [];
  private _slotTexts: Phaser.GameObjects.Text[]        = [];

  // Lista de magias desbloqueadas
  private _listBgs:   Phaser.GameObjects.Rectangle[]  = [];
  private _listTexts: Phaser.GameObjects.Text[]        = [];

  // Detalhe da magia selecionada
  private _detailName!: Phaser.GameObjects.Text;
  private _detailDesc!: Phaser.GameObjects.Text;
  private _equipBtns:  Phaser.GameObjects.Rectangle[] = [];
  private _equipTxts:  Phaser.GameObjects.Text[]       = [];

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
    const pad    = 10;
    const rowH   = 16;

    const bg     = scene.add.rectangle(ox, oy, panelW, panelH, PANEL_BG, 0.95).setOrigin(0, 0);
    const border = scene.add.rectangle(ox, oy, panelW, panelH).setOrigin(0, 0)
      .setStrokeStyle(2, PANEL_BORDER).setFillStyle(0, 0);

    // ── Slots ativos ─────────────────────────────────────────────────────────────
    const slotLabels = ['[H]', '[J]', '[K]', '[L]'];
    const slotW = Math.floor(panelW * 0.22);
    for (let i = 0; i < SLOT_POOL; i++) {
      const x = ox + pad + i * (slotW + 4);
      const y = oy + 36; // abaixo das abas
      const bg2 = scene.add.rectangle(x, y, slotW, rowH + 4, EMPTY_COLOR).setOrigin(0, 0);
      const txt  = scene.add.text(x + 4, y + 2, `${slotLabels[i]}: —`, { ...TEXT_BASE, color: '#aaddff' });

      bg2.setInteractive({ useHandCursor: true });
      const idx = i;
      bg2.on('pointerdown', () => {
        if (this._selectedId) {
          EventBus.emit(EVENTS.SPELL_EQUIPPED, { slotIndex: idx, spellId: this._selectedId, action: 'equip' });
        }
      });

      // Slots 2 e 3 iniciam ocultos; o render os ativa apenas para o Mago
      if (i >= 2) {
        bg2.setVisible(false);
        txt.setVisible(false);
      }

      this._slotBgs.push(bg2);
      this._slotTexts.push(txt);
    }

    // ── Lista de magias ───────────────────────────────────────────────────────────
    const listX = ox + pad;
    for (let i = 0; i < LIST_POOL; i++) {
      const y = oy + 70 + i * (rowH + 3);
      const bg2 = scene.add.rectangle(listX, y, Math.floor(panelW * 0.55), rowH, EMPTY_COLOR).setOrigin(0, 0);
      const txt  = scene.add.text(listX + 4, y + 2, '', { ...TEXT_BASE, color: '#99bbcc' });

      bg2.setInteractive({ useHandCursor: true });
      const ii = i;
      bg2.on('pointerdown', () => EventBus.emit(EVENTS.INVENTORY_ITEM_CLICKED, { source: 'spells', index: ii }));
      bg2.on('pointerover', () => { if (this._visible) bg2.setFillStyle(0x223355, 1); });
      bg2.on('pointerout',  () => { if (this._visible) this._dirty = true; });

      this._listBgs.push(bg2);
      this._listTexts.push(txt);
    }

    // ── Detalhe ───────────────────────────────────────────────────────────────────
    const detX = ox + Math.floor(panelW * 0.60);
    this._detailName = scene.add.text(detX, oy + 70, '', { ...TEXT_BASE, color: '#ffffff' });
    this._detailDesc = scene.add.text(detX, oy + 88, '', {
      ...TEXT_BASE, color: '#aabbcc',
      wordWrap: { width: Math.floor(panelW * 0.38) - pad * 2 },
    });

    // Botões equipar slot H/J/K/L (4 slots, visíveis conforme classe)
    const equipKeys = ['H','J','K','L'];
    for (let i = 0; i < SLOT_POOL; i++) {
      const bx  = detX;
      const by  = oy + panelH - 80 + i * (rowH + 4);
      const btn = scene.add.rectangle(bx, by, 90, rowH, 0x224422).setOrigin(0, 0);
      const txt = scene.add.text(bx + 4, by + 2, `Equipar [${equipKeys[i]}]`, { ...TEXT_BASE, color: '#88ff88' });
      btn.setInteractive({ useHandCursor: true });
      const idx = i;
      btn.on('pointerdown', () => {
        if (this._selectedId) {
          EventBus.emit(EVENTS.SPELL_EQUIPPED, { slotIndex: idx, spellId: this._selectedId, action: 'equip' });
        }
      });
      btn.setVisible(false);
      txt.setVisible(false);
      this._equipBtns.push(btn);
      this._equipTxts.push(txt);
    }

    this._root.add([
      bg, border,
      ...this._slotBgs, ...this._slotTexts,
      ...this._listBgs, ...this._listTexts,
      this._detailName, this._detailDesc,
      ...this._equipBtns, ...this._equipTxts,
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

  selectByIndex(index: number, vm: SpellsViewModel): void {
    const spell = vm.unlockedSpells[index];
    if (spell) {
      this._selectedId = spell.id;
      this._dirty = true;
    }
  }

  clearSelection(): void {
    this._selectedId = null;
    this._dirty = true;
  }

  render(vm: SpellsViewModel): void {
    if (!this._dirty) return;
    this._dirty = false;

    // Slots ativos (mostra apenas os slots retornados pela classe)
    for (let i = 0; i < SLOT_POOL; i++) {
      const slot = vm.activeSlots[i];
      const active = !!slot;
      this._slotBgs[i].setVisible(active);
      this._slotTexts[i].setVisible(active);
      if (!slot) continue;
      const label = slot.key;
      const spellName = slot.spellId ? slot.spellName : '—';
      const coolRatio = slot.cooldownRatio;
      const ready = coolRatio === 0;
      const color = ready ? '#aaddff' : '#666688';
      this._slotTexts[i].setText(`[${label}]: ${spellName}`).setStyle({ ...this._slotTexts[i].style, color });
    }

    // Lista
    for (let i = 0; i < LIST_POOL; i++) {
      const spell = vm.unlockedSpells[i] as SpellListItemViewModel | undefined;
      if (!spell) {
        this._listBgs[i].setFillStyle(EMPTY_COLOR, 1);
        this._listTexts[i].setText('');
        continue;
      }
      const isSelected = spell.id === this._selectedId;
      const elemColor  = ELEMENT_COLORS[spell.element] ?? '#ffffff';
      this._listBgs[i].setFillStyle(isSelected ? SEL_COLOR : EMPTY_COLOR, 1);
      this._listTexts[i]
        .setText(`${spell.name}  ${spell.damage}dmg  ${spell.manaCost}mp`)
        .setStyle({ ...TEXT_BASE, color: isSelected ? '#ffffff' : elemColor });
    }

    // Detalhe
    const sel = vm.unlockedSpells.find(s => s.id === this._selectedId);
    const activeSlotCount = vm.activeSlots.length;
    if (sel) {
      this._detailName.setText(sel.name);
      this._detailDesc.setText(`[${sel.element}] Dano:${sel.damage} Mana:${sel.manaCost} CD:${(sel.cooldownMs/1000).toFixed(1)}s`);
      this._equipBtns.forEach((b, i) => b.setVisible(i < activeSlotCount));
      this._equipTxts.forEach((t, i) => t.setVisible(i < activeSlotCount));
    } else {
      this._detailName.setText('');
      this._detailDesc.setText('Selecione uma magia para ver detalhes.');
      this._equipBtns.forEach(b => b.setVisible(false));
      this._equipTxts.forEach(t => t.setVisible(false));
    }
  }
}
