import * as Phaser from 'phaser';
import { EQUIPMENT_SLOT_ORDER, EQUIPMENT_SLOT_LABELS } from '../types/equipment';
import type { InventoryViewModel, InventoryItemViewModel, EquipmentSlotViewModel } from '../types/viewmodels';

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
const TEXT_DIM: Phaser.Types.GameObjects.Text.TextStyle = {
  ...TEXT_BASE,
  color: '#556688',
};
const TEXT_TITLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '11px',
  color: '#aabbff',
  fontFamily: 'monospace',
};
const TEXT_HINT: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '9px',
  color: '#556688',
  fontFamily: 'monospace',
};

export class InventoryPanel {
  private _root: Phaser.GameObjects.Container;
  private _dirty = false;
  private _visible = false;

  // Itens — pool fixo de texto reutilizável
  private _itemTexts: Phaser.GameObjects.Text[] = [];
  private _itemBgs: Phaser.GameObjects.Rectangle[] = [];

  // Equipamentos
  private _slotBgs: Phaser.GameObjects.Rectangle[]  = [];
  private _slotTexts: Phaser.GameObjects.Text[]  = [];
  private _slotValueTexts: Phaser.GameObjects.Text[] = [];

  // Detalhes
  private _detailName!: Phaser.GameObjects.Text;
  private _detailDesc!: Phaser.GameObjects.Text;
  private _detailActions!: Phaser.GameObjects.Text;

  private readonly ITEM_POOL_SIZE = 20;
  private readonly SLOT_COUNT     = 6;

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

    const eqW      = Math.floor(panelW * 0.30);
    const itemW    = Math.floor(panelW * 0.38);
    const detailW  = panelW - eqW - itemW;
    const innerH   = panelH - 40;
    const rowH     = 16;
    const padding  = 8;

    // Fundo e borda principal
    const bg = scene.add.rectangle(ox, oy, panelW, panelH, PANEL_BG, 0.95).setOrigin(0, 0);
    const border = scene.add.rectangle(ox, oy, panelW, panelH).setOrigin(0, 0)
      .setStrokeStyle(2, PANEL_BORDER).setFillStyle(0, 0);
    const title = scene.add.text(ox + panelW / 2, oy + 10, 'INVENTÁRIO', TEXT_TITLE).setOrigin(0.5, 0);
    const hint  = scene.add.text(ox + panelW / 2, oy + panelH - 16,
      '[E] Equipar  [U] Usar  [D] Dropar  [ESC/I] Fechar', TEXT_HINT).setOrigin(0.5, 0);

    // Divisórias
    const divX1 = ox + eqW;
    const divX2 = ox + eqW + itemW;
    const divLine1 = scene.add.rectangle(divX1, oy + 30, 1, innerH, PANEL_BORDER, 0.5).setOrigin(0, 0);
    const divLine2 = scene.add.rectangle(divX2, oy + 30, 1, innerH, PANEL_BORDER, 0.5).setOrigin(0, 0);

    // Subtítulos das colunas
    const eqLabel     = scene.add.text(ox + padding, oy + 30, 'EQUIPAMENTOS', { ...TEXT_BASE, color: '#8888cc' });
    const itemLabel   = scene.add.text(divX1 + padding, oy + 30, 'ITENS', { ...TEXT_BASE, color: '#8888cc' });
    const detailLabel = scene.add.text(divX2 + padding, oy + 30, 'DETALHES', { ...TEXT_BASE, color: '#8888cc' });

    // Pool de slots de equipamento
    for (let i = 0; i < this.SLOT_COUNT; i++) {
      const y = oy + 48 + i * (rowH + 4);
      const bg2 = scene.add.rectangle(ox + padding, y, eqW - padding * 2, rowH, EMPTY_COLOR).setOrigin(0, 0);
      const label = scene.add.text(ox + padding + 4, y + 2, '', TEXT_DIM);
      const value = scene.add.text(ox + eqW - padding - 4, y + 2, '', TEXT_DIM).setOrigin(1, 0);
      this._slotBgs.push(bg2);
      this._slotTexts.push(label);
      this._slotValueTexts.push(value);
    }

    // Pool de itens do inventário
    for (let i = 0; i < this.ITEM_POOL_SIZE; i++) {
      const y = oy + 48 + i * (rowH + 2);
      const itemBg = scene.add.rectangle(divX1 + padding, y, itemW - padding * 2, rowH, EMPTY_COLOR).setOrigin(0, 0);
      const itemTxt = scene.add.text(divX1 + padding + 4, y + 2, '', TEXT_DIM);
      this._itemBgs.push(itemBg);
      this._itemTexts.push(itemTxt);
    }

    // Área de detalhes
    this._detailName    = scene.add.text(divX2 + padding, oy + 48, '', { ...TEXT_BASE, color: '#ffffff' });
    this._detailDesc    = scene.add.text(divX2 + padding, oy + 66, '', {
      ...TEXT_BASE, color: '#aabbcc',
      wordWrap: { width: detailW - padding * 2 },
    });
    this._detailActions = scene.add.text(divX2 + padding, oy + panelH - 60, '', {
      ...TEXT_BASE, color: '#ffdd88',
    });

    this._root.add([
      bg, border, title, hint, divLine1, divLine2,
      eqLabel, itemLabel, detailLabel,
      ...this._slotBgs, ...this._slotTexts, ...this._slotValueTexts,
      ...this._itemBgs, ...this._itemTexts,
      this._detailName, this._detailDesc, this._detailActions,
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

  toggle(): void {
    this._visible ? this.hide() : this.show();
  }

  isVisible(): boolean {
    return this._visible;
  }

  markDirty(): void {
    this._dirty = true;
  }

  isDirty(): boolean {
    return this._dirty && this._visible;
  }

  render(vm: InventoryViewModel): void {
    if (!this._dirty) return;
    this._dirty = false;

    this._renderEquipmentSlots(vm.slots);
    this._renderItems(vm.items);
    this._renderDetail(vm);
  }

  private _renderEquipmentSlots(slots: EquipmentSlotViewModel[]): void {
    for (let i = 0; i < this.SLOT_COUNT; i++) {
      const slot = slots[i];
      if (!slot) {
        this._slotTexts[i].setText('');
        this._slotValueTexts[i].setText('');
        continue;
      }
      const hasItem = slot.equippedItemId !== null;
      const col = slot.isSelected ? SEL_COLOR : (hasItem ? 0x1a2a3a : EMPTY_COLOR);
      this._slotBgs[i].setFillStyle(col, 1);
      this._slotTexts[i]
        .setText(slot.label)
        .setStyle({ ...TEXT_BASE, color: hasItem ? '#aaddff' : '#445566' });
      this._slotValueTexts[i]
        .setText(hasItem ? slot.equippedItemName : '—')
        .setStyle({ ...TEXT_BASE, color: hasItem ? '#ffffff' : '#334455' });
    }
  }

  private _renderItems(items: InventoryItemViewModel[]): void {
    for (let i = 0; i < this.ITEM_POOL_SIZE; i++) {
      const item = items[i];
      if (!item || item.id === null) {
        this._itemBgs[i].setFillStyle(EMPTY_COLOR, 1);
        this._itemTexts[i].setText('').setStyle(TEXT_DIM);
        continue;
      }
      const col = item.isSelected ? SEL_COLOR : (item.isEquipped ? 0x1a3a1a : EMPTY_COLOR);
      this._itemBgs[i].setFillStyle(col, 1);
      const prefix = item.isEquipped ? '[E] ' : '     ';
      this._itemTexts[i]
        .setText(`${prefix}${item.displayName}`)
        .setStyle({ ...TEXT_BASE, color: item.isSelected ? '#ffffff' : '#99bbcc' });
    }
  }

  private _renderDetail(vm: InventoryViewModel): void {
    if (!vm.selectedItemDetail) {
      this._detailName.setText('');
      this._detailDesc.setText('Selecione um item para ver detalhes.');
      this._detailActions.setText('');
      return;
    }
    const d = vm.selectedItemDetail;
    this._detailName.setText(d.name);
    this._detailDesc.setText(d.description || '(Sem descrição)');

    const actionMap: Record<string, string> = {
      equip:   '[E] Equipar',
      unequip: '[E] Desequipar',
      use:     '[U] Usar',
      drop:    '[D] Dropar',
    };
    this._detailActions.setText(d.actions.map(a => actionMap[a]).join('\n'));
  }
}
