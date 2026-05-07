import * as Phaser from 'phaser';
import { EVENTS, UI } from '../utils/constants';
import { EventBus } from '../utils/EventBus';
import { Item } from '../entities/Item';
import { LogSystem } from '../systems/LogSystem';
import { LogPanel } from '../ui/LogPanel';
import { InventoryPanel } from '../ui/InventoryPanel';
import { ActionBarPanel } from '../ui/ActionBarPanel';
import { EQUIPMENT_SLOT_ORDER, EQUIPMENT_SLOT_LABELS, type EquipmentSlotId } from '../types/equipment';
import type { InventoryViewModel, InventoryItemViewModel, EquipmentSlotViewModel } from '../types/viewmodels';

const BAR_W    = 100;
const BAR_H    = 8;
const PANEL_X  = 8;
const PANEL_Y  = 8;
const DEPTH    = 200;

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '9px',
  color: '#e2e8f0',
  fontFamily: 'monospace',
};


export class UIScene extends Phaser.Scene {
  // HP bar
  private _hpBarBg!: Phaser.GameObjects.Rectangle;
  private _hpBar!: Phaser.GameObjects.Rectangle;
  private _hpLabel!: Phaser.GameObjects.Text;

  // Mana bar
  private _mpBarBg!: Phaser.GameObjects.Rectangle;
  private _mpBar!: Phaser.GameObjects.Rectangle;
  private _mpLabel!: Phaser.GameObjects.Text;

  // Status labels
  private _levelLabel!: Phaser.GameObjects.Text;
  private _xpLabel!: Phaser.GameObjects.Text;

  // Log
  private _logSystem!: LogSystem;
  private _logPanel!: LogPanel;

  // Inventory overlay
  private _inventoryPanel!: InventoryPanel;
  private _actionBar!: ActionBarPanel;
  private _inventoryData: { items: unknown[]; equipped: Record<string, string | null>; identifiedItems: Record<string, boolean> } | null = null;
  private _selectedInventoryIndex = 0;

  // _slots removido — gerenciado por ActionBarPanel

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this._logSystem = new LogSystem();
    this._logSystem.bindEventBus();

    this._actionBar      = new ActionBarPanel(this);
    this._logPanel       = new LogPanel(this);
    this._inventoryPanel = new InventoryPanel(this);

    // LogPanel deve parar antes da action bar
    this._logPanel.layout(this.scale.width, this.scale.height, this._actionBar.getHeight());

    this._createStatsPanel();
    this._registerEvents();
  }

  update(): void {
    if (this._logPanel.isDirty()) {
      const vm = this._logSystem.buildViewModel(UI.LOG_VISIBLE_LINES);
      this._logPanel.render(vm);
    }
    if (this._inventoryPanel.isDirty() && this._inventoryData) {
      const vm = this._buildInventoryViewModel();
      this._inventoryPanel.render(vm);
    }
  }

  shutdown(): void {
    EventBus.off(EVENTS.PLAYER_HP_CHANGED,        this._onHPChanged,    this);
    EventBus.off(EVENTS.PLAYER_MANA_CHANGED,      this._onManaChanged,  this);
    EventBus.off(EVENTS.PLAYER_XP_CHANGED,        this._onXPChanged,    this);
    EventBus.off(EVENTS.PLAYER_LEVELED_UP,        this._onLevelUp,      this);
    EventBus.off(EVENTS.ITEM_PICKED_UP,           this._onItemPickedUp, this);
    EventBus.off(EVENTS.ITEM_USED,                this._onItemUsed,     this);
    EventBus.off(EVENTS.INVENTORY_OPENED,         undefined,            this);
    EventBus.off(EVENTS.INVENTORY_STATE_RESPONSE, undefined,            this);
    EventBus.off(EVENTS.INVENTORY_CLOSED,         undefined,            this);
    EventBus.off(EVENTS.ITEM_EQUIPPED,            undefined,            this);
    EventBus.off(EVENTS.ITEM_UNEQUIPPED,          undefined,            this);
  }

  // ─── InventoryViewModel builder ──────────────────────────────────────────

  private _buildInventoryViewModel(): InventoryViewModel {
    const data     = this._inventoryData!;
    const selIdx   = this._selectedInventoryIndex;
    const equipped = data.equipped;
    const equippedIds = new Set(Object.values(equipped).filter(Boolean));

    const items: InventoryItemViewModel[] = (data.items as Array<{ id: string; type: string; getDisplayName: (m: Record<string, boolean>) => string } | null>).map((item, index) => {
      if (!item) return { index, id: null, displayName: '—', type: '', isEquipped: false, isSelected: false };
      const isEquipped = equippedIds.has(item.id);
      return {
        index,
        id:          item.id,
        displayName: item.getDisplayName(data.identifiedItems),
        type:        item.type,
        isEquipped,
        isSelected:  index === selIdx,
      };
    });

    const slots: EquipmentSlotViewModel[] = EQUIPMENT_SLOT_ORDER.map(slotId => {
      const equippedId = equipped[slotId] ?? null;
      const equippedItem = equippedId
        ? (data.items as Array<{ id: string; getDisplayName: (m: Record<string, boolean>) => string } | null>).find(i => i?.id === equippedId)
        : null;
      return {
        id:              slotId as EquipmentSlotId,
        label:           EQUIPMENT_SLOT_LABELS[slotId as EquipmentSlotId],
        equippedItemId:  equippedId,
        equippedItemName: equippedItem ? equippedItem.getDisplayName(data.identifiedItems) : '',
        isSelected:      false,
      };
    });

    const selectedItem = items[selIdx];
    const selectedItemDetail = selectedItem?.id
      ? {
          name:        selectedItem.displayName,
          description: `Tipo: ${selectedItem.type}`,
          actions:     (['use', 'drop'] as Array<'equip' | 'use' | 'drop'>),
        }
      : null;

    return { items, slots, selectedItemDetail };
  }

  // ─── Stats Panel (dentro do painel esquerdo 33%) ─────────────────────────

  private _createStatsPanel(): void {
    const panelW = Math.floor(this.scale.width * UI.LOG_PANEL_WIDTH_FRACTION);
    const d = DEPTH;

    // Fundo do painel de stats (topo do painel esquerdo)
    this.add
      .rectangle(0, 0, panelW, 56, 0x000000, 0.55)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(d);

    const hpY = PANEL_Y + 4;
    this.add.text(PANEL_X, hpY, 'HP', { ...TEXT_STYLE, color: '#f87171' })
      .setScrollFactor(0).setDepth(d + 1);
    this._hpBarBg = this.add
      .rectangle(PANEL_X + 18, hpY + 4, BAR_W, BAR_H, 0x330000)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 1);
    this._hpBar = this.add
      .rectangle(PANEL_X + 18, hpY + 4, BAR_W, BAR_H, 0x22cc44)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 2);
    this._hpLabel = this.add
      .text(PANEL_X + 18 + BAR_W + 4, hpY, '', TEXT_STYLE)
      .setScrollFactor(0).setDepth(d + 2);

    const mpY = PANEL_Y + 18;
    this.add.text(PANEL_X, mpY, 'MP', { ...TEXT_STYLE, color: '#60a5fa' })
      .setScrollFactor(0).setDepth(d + 1);
    this._mpBarBg = this.add
      .rectangle(PANEL_X + 18, mpY + 4, BAR_W, BAR_H, 0x001133)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 1);
    this._mpBar = this.add
      .rectangle(PANEL_X + 18, mpY + 4, BAR_W, BAR_H, 0x2244ff)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 2);
    this._mpLabel = this.add
      .text(PANEL_X + 18 + BAR_W + 4, mpY, '', TEXT_STYLE)
      .setScrollFactor(0).setDepth(d + 2);

    const xpY = PANEL_Y + 32;
    this._levelLabel = this.add
      .text(PANEL_X, xpY, 'Nv 1  ATK 10', TEXT_STYLE)
      .setScrollFactor(0).setDepth(d + 1);
    this._xpLabel = this.add
      .text(PANEL_X, xpY + 12, 'XP: 0 / 100', TEXT_STYLE)
      .setScrollFactor(0).setDepth(d + 1);
  }

  // ─── Registro de Eventos ──────────────────────────────────────────────────

  private _registerEvents(): void {
    EventBus.on(EVENTS.PLAYER_HP_CHANGED,   this._onHPChanged,    this);
    EventBus.on(EVENTS.PLAYER_MANA_CHANGED, this._onManaChanged,  this);
    EventBus.on(EVENTS.PLAYER_XP_CHANGED,   this._onXPChanged,    this);
    EventBus.on(EVENTS.PLAYER_LEVELED_UP,   this._onLevelUp,      this);
    EventBus.on(EVENTS.ITEM_PICKED_UP,      this._onItemPickedUp, this);
    EventBus.on(EVENTS.ITEM_USED,           this._onItemUsed,     this);

    EventBus.on(EVENTS.INVENTORY_OPENED, () => {
      if (!this.sys.isActive()) return;
      EventBus.emit(EVENTS.INVENTORY_STATE_REQUESTED, { timestamp: Date.now() });
    }, this);

    EventBus.on(EVENTS.INVENTORY_STATE_RESPONSE, (data: {
      items: unknown[];
      equipped: Record<string, string | null>;
      identifiedItems: Record<string, boolean>;
    }) => {
      if (!this.sys.isActive()) return;
      this._inventoryData = data;
      this._selectedInventoryIndex = 0;
      this._inventoryPanel.show();
      this._inventoryPanel.markDirty();
    }, this);

    EventBus.on(EVENTS.INVENTORY_CLOSED, () => {
      if (!this.sys.isActive()) return;
      this._inventoryPanel.hide();
    }, this);

    EventBus.on(EVENTS.ITEM_EQUIPPED,   () => { this._inventoryPanel.markDirty(); }, this);
    EventBus.on(EVENTS.ITEM_UNEQUIPPED, () => { this._inventoryPanel.markDirty(); }, this);
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  private _onHPChanged(data: { hp: number; maxHp: number }): void {
    if (!this.sys.isActive() || !this._hpBar?.active) return;
    const ratio = data.maxHp > 0 ? data.hp / data.maxHp : 0;
    this._hpBar.setSize(Math.max(0.1, BAR_W * ratio), BAR_H);
    this._hpLabel.setText(`${data.hp}/${data.maxHp}`);
    this._hpBar.setFillStyle(ratio < 0.3 ? 0xef4444 : 0x22cc44);
  }

  private _onManaChanged(data: { mana: number; maxMana: number }): void {
    if (!this.sys.isActive() || !this._mpBar?.active) return;
    const ratio = data.maxMana > 0 ? data.mana / data.maxMana : 0;
    this._mpBar.setSize(Math.max(0.1, BAR_W * ratio), BAR_H);
    this._mpLabel.setText(`${data.mana}/${data.maxMana}`);
  }

  private _onXPChanged(data: { xp: number; xpNext: number }): void {
    if (!this.sys.isActive()) return;
    this._xpLabel.setText(`XP: ${data.xp} / ${data.xpNext}`);
  }

  private _onLevelUp(data: { level: number; maxHp: number; attack: number }): void {
    if (!this.sys.isActive()) return;
    this._levelLabel.setText(`Nv ${data.level}  ATK ${data.attack}`);
  }

  private _onItemPickedUp(data: { item: Item; slotIndex: number }): void {
    if (!this.sys.isActive()) return;
    this._actionBar.setItem(data.slotIndex, data.item.type);
  }

  private _onItemUsed(data: { itemIndex: number }): void {
    if (!this.sys.isActive()) return;
    this._actionBar.clearItem(data.itemIndex);
  }
}
