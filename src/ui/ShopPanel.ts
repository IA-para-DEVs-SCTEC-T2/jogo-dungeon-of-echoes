import * as Phaser from 'phaser';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { ShopViewModel } from '../types/viewmodels';

const DEPTH        = 500;
const PANEL_BG     = 0x0a0a1a;
const PANEL_BORDER = 0x4444aa;
const SEL_COLOR    = 0x334477;
const EMPTY_COLOR  = 0x111133;
const AFFORD_COLOR = 0x113311;
const DIM_COLOR    = 0x221111;

const TEXT_BASE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '10px', color: '#e2e8f0', fontFamily: 'monospace',
};
const TEXT_DIM: Phaser.Types.GameObjects.Text.TextStyle = {
  ...TEXT_BASE, color: '#556688',
};
const TEXT_TITLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '11px', color: '#aabbff', fontFamily: 'monospace',
};
const TEXT_HINT: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '9px', color: '#556688', fontFamily: 'monospace',
};
const TEXT_GOLD: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '10px', color: '#ffd700', fontFamily: 'monospace',
};

const RARITY_COLORS: Record<string, string> = {
  common:    '#aaaaaa',
  uncommon:  '#55ff55',
  rare:      '#aaaaff',
  epic:      '#cc44ff',
  legendary: '#ffaa00',
};

export class ShopPanel {
  private _root: Phaser.GameObjects.Container;
  private _dirty  = false;
  private _visible = false;

  private _itemBgs:    Phaser.GameObjects.Rectangle[] = [];
  private _itemTexts:  Phaser.GameObjects.Text[] = [];
  private _itemPrices: Phaser.GameObjects.Text[] = [];

  private _goldLabel!:    Phaser.GameObjects.Text;
  private _detailName!:   Phaser.GameObjects.Text;
  private _detailBonus!:  Phaser.GameObjects.Text;
  private _detailRarity!: Phaser.GameObjects.Text;
  private _detailPrice!:  Phaser.GameObjects.Text;

  private _tabBuyBg!:  Phaser.GameObjects.Rectangle;
  private _tabSellBg!: Phaser.GameObjects.Rectangle;
  private _tabBuyTxt!: Phaser.GameObjects.Text;
  private _tabSellTxt!: Phaser.GameObjects.Text;

  private readonly ITEM_POOL_SIZE = 20;
  private readonly ROW_H = 16;

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
    const padding = 8;
    const listW  = Math.floor(panelW * 0.55);
    const detailW = panelW - listW;
    const rowH    = this.ROW_H;

    const bg     = scene.add.rectangle(ox, oy, panelW, panelH, PANEL_BG, 0.95).setOrigin(0, 0);
    const border = scene.add.rectangle(ox, oy, panelW, panelH).setOrigin(0, 0)
      .setStrokeStyle(2, PANEL_BORDER).setFillStyle(0, 0);
    const title  = scene.add.text(ox + panelW / 2, oy + 10, 'LOJA', TEXT_TITLE).setOrigin(0.5, 0);
    const hint   = scene.add.text(
      ox + panelW / 2, oy + panelH - 16,
      '[←→] Aba  [E/Enter] Comprar  [V] Vender  [ESC] Fechar',
      TEXT_HINT,
    ).setOrigin(0.5, 0);

    // Tab headers
    const tabW = Math.floor(listW / 2) - padding;
    this._tabBuyBg  = scene.add.rectangle(ox + padding, oy + 26, tabW, 14, 0x334477).setOrigin(0, 0);
    this._tabSellBg = scene.add.rectangle(ox + padding + tabW + 4, oy + 26, tabW, 14, EMPTY_COLOR).setOrigin(0, 0);
    this._tabBuyTxt  = scene.add.text(ox + padding + tabW / 2, oy + 28, 'Comprar', { ...TEXT_BASE, fontSize: '9px' }).setOrigin(0.5, 0);
    this._tabSellTxt = scene.add.text(ox + padding + tabW + 4 + tabW / 2, oy + 28, 'Vender', { ...TEXT_DIM, fontSize: '9px' }).setOrigin(0.5, 0);

    const divLine = scene.add.rectangle(ox + listW, oy + 30, 1, panelH - 40, PANEL_BORDER, 0.5).setOrigin(0, 0);
    const detailLabel = scene.add.text(ox + listW + padding, oy + 30, 'DETALHES', { ...TEXT_BASE, color: '#8888cc' });

    for (let i = 0; i < this.ITEM_POOL_SIZE; i++) {
      const y = oy + 48 + i * (rowH + 2);
      const idx = i;
      const itemBg    = scene.add.rectangle(ox + padding, y, listW - padding * 2, rowH, EMPTY_COLOR).setOrigin(0, 0);
      const itemTxt   = scene.add.text(ox + padding + 4, y + 2, '', TEXT_DIM);
      const priceTxt  = scene.add.text(ox + listW - padding - 4, y + 2, '', TEXT_DIM).setOrigin(1, 0);
      itemBg
        .setInteractive()
        .on('pointerover', () => EventBus.emit(EVENTS.SHOP_ITEM_HOVERED, { index: idx }))
        .on('pointerdown', () => EventBus.emit(EVENTS.SHOP_ITEM_SELECTED, { index: idx }));
      this._itemBgs.push(itemBg);
      this._itemTexts.push(itemTxt);
      this._itemPrices.push(priceTxt);
    }

    const dx = ox + listW + padding;
    this._goldLabel   = scene.add.text(dx, oy + 48, '', TEXT_GOLD);
    this._detailName  = scene.add.text(dx, oy + 68, '', { ...TEXT_BASE, color: '#ffffff' });
    this._detailRarity = scene.add.text(dx, oy + 84, '', TEXT_DIM);
    this._detailBonus = scene.add.text(dx, oy + 100, '', { ...TEXT_BASE, color: '#88ffaa', wordWrap: { width: detailW - padding * 2 } });
    this._detailPrice = scene.add.text(dx, oy + 132, '', TEXT_GOLD);

    this._root.add([
      bg, border, title, hint, divLine,
      this._tabBuyBg, this._tabSellBg, this._tabBuyTxt, this._tabSellTxt,
      detailLabel,
      ...this._itemBgs, ...this._itemTexts, ...this._itemPrices,
      this._goldLabel, this._detailName, this._detailRarity, this._detailBonus, this._detailPrice,
    ]);
  }

  show(): void  { this._visible = true;  this._root.setVisible(true);  this._dirty = true; }
  hide(): void  { this._visible = false; this._root.setVisible(false); }
  markDirty():  void { this._dirty = true; }
  isDirty():    boolean { return this._dirty && this._visible; }
  isVisible():  boolean { return this._visible; }

  render(vm: ShopViewModel): void {
    if (!this._dirty) return;
    this._dirty = false;

    this._goldLabel.setText(`Suas moedas: ${vm.playerGold}`);

    // Update tab headers
    const isBuy = vm.tab === 'buy';
    this._tabBuyBg.setFillStyle(isBuy ? 0x334477 : EMPTY_COLOR);
    this._tabSellBg.setFillStyle(!isBuy ? 0x334477 : EMPTY_COLOR);
    this._tabBuyTxt.setStyle({ ...TEXT_BASE, fontSize: '9px', color: isBuy ? '#ffffff' : '#556688' });
    this._tabSellTxt.setStyle({ ...TEXT_BASE, fontSize: '9px', color: !isBuy ? '#ffffff' : '#556688' });

    if (vm.tab === 'sell') {
      const sellItems = vm.sellItems;
      for (let i = 0; i < this.ITEM_POOL_SIZE; i++) {
        const entry = sellItems[i];
        if (!entry) {
          this._itemBgs[i].setFillStyle(EMPTY_COLOR);
          this._itemTexts[i].setText('');
          this._itemPrices[i].setText('');
          continue;
        }
        const col = entry.isSelected ? SEL_COLOR : (entry.canSell ? EMPTY_COLOR : DIM_COLOR);
        this._itemBgs[i].setFillStyle(col);
        this._itemTexts[i]
          .setText(entry.name)
          .setStyle({ ...TEXT_BASE, color: entry.canSell ? (entry.isSelected ? '#ffffff' : '#e2e8f0') : '#443333' });
        this._itemPrices[i]
          .setText(entry.canSell ? `${entry.sellPrice}g` : 'Eqp')
          .setStyle({ ...TEXT_BASE, color: entry.canSell ? '#ffd700' : '#443333' });
      }
      const sel = sellItems[vm.selectedIndex];
      if (sel) {
        this._detailName.setText(sel.name);
        this._detailRarity.setText(sel.canSell ? 'Pode vender' : 'Equipado — não pode vender').setStyle({ ...TEXT_BASE, color: sel.canSell ? '#88ffaa' : '#ff8888' });
        this._detailBonus.setText('');
        this._detailPrice.setText(sel.canSell ? `Venda: ${sel.sellPrice}g` : '');
      } else {
        this._detailName.setText('');
        this._detailRarity.setText('');
        this._detailBonus.setText('Selecione um item.');
        this._detailPrice.setText('');
      }
    } else {
      const buyItems = vm.buyItems ?? vm.items;
      for (let i = 0; i < this.ITEM_POOL_SIZE; i++) {
        const entry = buyItems[i];
        if (!entry) {
          this._itemBgs[i].setFillStyle(EMPTY_COLOR);
          this._itemTexts[i].setText('');
          this._itemPrices[i].setText('');
          continue;
        }

        const col = entry.isSelected
          ? SEL_COLOR
          : (entry.canAfford ? AFFORD_COLOR : EMPTY_COLOR);
        this._itemBgs[i].setFillStyle(col);
        const rarityColor = RARITY_COLORS[entry.rarity] ?? '#aaaaaa';
        this._itemTexts[i]
          .setText(entry.name)
          .setStyle({ ...TEXT_BASE, color: entry.isSelected ? '#ffffff' : rarityColor });
        this._itemPrices[i]
          .setText(`${entry.price}g`)
          .setStyle({ ...TEXT_BASE, color: entry.canAfford ? '#ffd700' : '#885533' });
      }

      const sel = (buyItems)[vm.selectedIndex];
      if (sel) {
        this._detailName.setText(sel.name);
        this._detailRarity.setText(`Raridade: ${sel.rarity}`).setStyle({ ...TEXT_BASE, color: RARITY_COLORS[sel.rarity] ?? '#aaaaaa' });
        this._detailBonus.setText(sel.bonusText !== '—' ? `Bônus: ${sel.bonusText}` : 'Sem bônus');
        this._detailPrice.setText(`Preço: ${sel.price}g`);
      } else {
        this._detailName.setText('');
        this._detailRarity.setText('');
        this._detailBonus.setText('Selecione um item.');
        this._detailPrice.setText('');
      }
    }
  }
}
