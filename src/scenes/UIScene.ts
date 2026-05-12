import * as Phaser from 'phaser';
import { EVENTS, UI } from '../utils/constants';
import { EventBus } from '../utils/EventBus';
import { Item } from '../entities/Item';
import { LogSystem } from '../systems/LogSystem';
import { LogPanel } from '../ui/LogPanel';
import { InventoryPanel } from '../ui/InventoryPanel';
import { ShopPanel } from '../ui/ShopPanel';
import { DialogPanel } from '../ui/DialogPanel';
import { ActionBarPanel } from '../ui/ActionBarPanel';
import { StatusPanel } from '../ui/StatusPanel';
import { SpellsPanel } from '../ui/SpellsPanel';
import type { ShopViewModel, StatusViewModel, SpellsViewModel } from '../types/viewmodels';
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
  private _goldLabel!: Phaser.GameObjects.Text;

  // Log
  private _logSystem!: LogSystem;
  private _logPanel!: LogPanel;

  // Inventory overlay
  private _inventoryPanel!: InventoryPanel;
  private _statusPanel!:    StatusPanel;
  private _spellsPanel!:    SpellsPanel;
  private _shopPanel!: ShopPanel;
  private _dialogPanel!: DialogPanel;
  private _actionBar!: ActionBarPanel;
  private _inventoryData: { items: unknown[]; equipped: Record<string, string | null>; identifiedItems: Record<string, boolean>; selectedIndex?: number } | null = null;
  private _selectedInventoryIndex = 0;
  private _shopData: ShopViewModel | null = null;
  private _statusData: StatusViewModel | null = null;
  private _spellsData: SpellsViewModel | null = null;

  // Abas do painel I
  private _activeTab: 'inventory' | 'status' | 'spells' = 'status';
  private _tabContainer: Phaser.GameObjects.Container | null = null;
  private _tabBtnBgs:  Phaser.GameObjects.Rectangle[] = [];
  private _tabBtnTxts: Phaser.GameObjects.Text[]      = [];

  // Barra de magias (lado direito)
  private _spellBarContainer: Phaser.GameObjects.Container | null = null;
  private _spellBarSlots: Array<{
    bg: Phaser.GameObjects.Rectangle;
    keyTxt: Phaser.GameObjects.Text;
    nameTxt: Phaser.GameObjects.Text;
    cdBar: Phaser.GameObjects.Rectangle;
    cdBarFill: Phaser.GameObjects.Rectangle;
  }> = [];

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
    this._statusPanel    = new StatusPanel(this);
    this._spellsPanel    = new SpellsPanel(this);
    this._shopPanel      = new ShopPanel(this);
    this._dialogPanel    = new DialogPanel(this);

    this._buildTabButtons();
    this._buildSpellBar();

    // LogPanel deve parar antes da action bar
    this._logPanel.layout(this.scale.width, this.scale.height, this._actionBar.getHeight());

    this._createStatsPanel();
    this._registerEvents();
  }

  private _spellBarTick = 0;

  update(time: number): void {
    // Atualizar SpellBar cooldown a cada ~200ms
    if (this._spellsData && time - this._spellBarTick > 200) {
      this._spellBarTick = time;
      EventBus.emit(EVENTS.SPELLS_STATE_REQUESTED, { timestamp: time });
    }

    if (this._logSystem.isDirty()) {
      const vm = this._logSystem.buildViewModel(UI.LOG_VISIBLE_LINES);
      this._logPanel.render(vm);
    }
    if (this._inventoryPanel.isDirty() && this._inventoryData) {
      const vm = this._buildInventoryViewModel();
      this._inventoryPanel.render(vm);
    }
    if (this._statusPanel.isDirty() && this._statusData) {
      this._statusPanel.render(this._statusData);
    }
    if (this._spellsPanel.isDirty() && this._spellsData) {
      this._spellsPanel.render(this._spellsData);
    }
    if (this._shopPanel.isDirty() && this._shopData) {
      this._shopPanel.render(this._shopData);
    }
    if (this._dialogPanel.isDirty()) {
      this._dialogPanel.render();
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
    EventBus.off(EVENTS.ITEM_EQUIPPED,              undefined,            this);
    EventBus.off(EVENTS.ITEM_UNEQUIPPED,            undefined,            this);
    EventBus.off(EVENTS.PLAYER_GOLD_CHANGED,        undefined,            this);
    EventBus.off(EVENTS.INVENTORY_SELECTION_CHANGED,undefined,            this);
    EventBus.off(EVENTS.SHOP_OPENED,                undefined,            this);
    EventBus.off(EVENTS.SHOP_UPDATED,               undefined,            this);
    EventBus.off(EVENTS.SHOP_CLOSED,                undefined,            this);
    EventBus.off(EVENTS.DIALOG_OPENED,              undefined,            this);
    EventBus.off(EVENTS.DIALOG_CLOSED,              undefined,            this);
    EventBus.off(EVENTS.STATUS_STATE_RESPONSE,      undefined,            this);
    EventBus.off(EVENTS.SPELLS_STATE_RESPONSE,      undefined,            this);
    EventBus.off(EVENTS.STAT_POINT_SPENT,           undefined,            this);
    EventBus.off(EVENTS.SPELL_UNLOCKED,             undefined,            this);
    EventBus.off(EVENTS.SPELL_CAST,                 undefined,            this);
  }

  // ─── Spell Bar (lado direito) ─────────────────────────────────────────────

  private _buildSpellBar(): void {
    const sw = this.scale.width;
    const sh = this.scale.height;
    const barH   = this._actionBar.getHeight();
    const slotH  = 28;
    const slotW  = 110;
    const pad    = 6;
    const x      = sw - slotW - 8;
    const DEPTH_SPELL_BAR = 205;

    this._spellBarContainer = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH_SPELL_BAR);

    const slotKeys = ['J', 'K'] as const;
    this._spellBarSlots = [];

    slotKeys.forEach((key, i) => {
      const y = sh - barH - (slotKeys.length - i) * (slotH + 4) - 4;

      // Fundo do slot
      const bg = this.add
        .rectangle(x, y, slotW, slotH, 0x111122, 0.92)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x334466);

      // Tecla de atalho (J / K)
      const keyTxt = this.add.text(x + pad, y + slotH / 2, `[${key}]`, {
        fontSize: '9px', color: '#4499ff', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      // Nome da magia
      const nameTxt = this.add.text(x + pad + 24, y + slotH / 2 - 4, '—', {
        fontSize: '8px', color: '#667799', fontFamily: 'monospace',
      }).setOrigin(0, 0.5);

      // Barra de cooldown (fundo)
      const cdBar = this.add
        .rectangle(x + pad, y + slotH - 6, slotW - pad * 2, 3, 0x222244)
        .setOrigin(0, 0);

      // Barra de cooldown (preenchimento)
      const cdBarFill = this.add
        .rectangle(x + pad, y + slotH - 6, 0, 3, 0x4499ff)
        .setOrigin(0, 0);

      this._spellBarContainer!.add([bg, keyTxt, nameTxt, cdBar, cdBarFill]);
      this._spellBarSlots.push({ bg, keyTxt, nameTxt, cdBar, cdBarFill });
    });
  }

  updateSpellBar(slots: Array<{ spellId: string | null; spellName: string; cooldownRatio: number }>): void {
    if (!this._spellBarContainer) return;
    const maxW = 110 - 12; // slotW - pad*2
    slots.forEach((slot, i) => {
      const s = this._spellBarSlots[i];
      if (!s) return;

      const hasSpell = !!slot.spellId;
      s.nameTxt.setText(hasSpell ? slot.spellName : '—');
      s.nameTxt.setStyle({ ...s.nameTxt.style, color: hasSpell ? '#aaddff' : '#445566' });

      const fillW = hasSpell && slot.cooldownRatio > 0
        ? Math.round(maxW * slot.cooldownRatio)
        : 0;
      s.cdBarFill.setSize(fillW, 3);
      const ready = !hasSpell || slot.cooldownRatio === 0;
      s.bg.setStrokeStyle(1, ready && hasSpell ? 0x4488cc : 0x334466);
    });
  }

  // ─── Tab System ──────────────────────────────────────────────────────────

  private _buildTabButtons(): void {
    const sw = this.scale.width;
    const sh = this.scale.height;
    const panelW = Math.floor(sw * 0.85);
    const panelH = Math.floor(sh * 0.80);
    const ox     = Math.floor((sw - panelW) / 2);
    const oy     = Math.floor((sh - panelH) / 2);

    const DEPTH_TAB = 512;
    const tabs: Array<{ label: string; tab: 'inventory' | 'status' | 'spells'; shortcut: string }> = [
      { label: 'STATUS',     tab: 'status',    shortcut: '' },
      { label: 'INVENTÁRIO', tab: 'inventory', shortcut: '' },
      { label: 'MAGIAS',     tab: 'spells',    shortcut: '' },
    ];

    const tabW  = 100;
    const tabH  = 24;
    // Abas encaixadas no topo do painel (sobrepostas)
    const tabY  = oy;
    const startX = ox + 8;

    this._tabContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH_TAB).setVisible(false);
    this._tabBtnBgs  = [];
    this._tabBtnTxts = [];

    tabs.forEach(({ label, tab }, i) => {
      const tx = startX + i * (tabW + 6);

      const bg = this.add
        .rectangle(tx, tabY, tabW, tabH, 0x0d1b2e)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x334488);

      const txt = this.add.text(tx + tabW / 2, tabY + tabH / 2, label, {
        fontSize: '10px', color: '#4466bb', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        if (this._activeTab !== tab) bg.setFillStyle(0x162236);
      });
      bg.on('pointerout', () => {
        if (this._activeTab !== tab) bg.setFillStyle(0x0d1b2e);
      });
      bg.on('pointerdown', () => this._switchTab(tab));

      this._tabBtnBgs.push(bg);
      this._tabBtnTxts.push(txt);
      this._tabContainer!.add([bg, txt]);
    });
  }

  private _updateTabHighlight(): void {
    const tabOrder = ['status', 'inventory', 'spells'];
    this._tabBtnBgs.forEach((bg, i) => {
      const isActive = tabOrder[i] === this._activeTab;
      bg.setFillStyle(isActive ? 0x1a3a5c : 0x0d1b2e);
      bg.setStrokeStyle(2, isActive ? 0x4499ff : 0x334488);
      this._tabBtnTxts[i].setStyle({
        fontSize: '10px',
        color: isActive ? '#ffffff' : '#4466bb',
        fontFamily: 'monospace',
        fontStyle: isActive ? 'bold' : 'normal',
      });
    });
  }

  private _switchTab(tab: 'inventory' | 'status' | 'spells'): void {
    this._activeTab = tab;
    this._updateTabHighlight();

    this._inventoryPanel.isVisible() && this._inventoryPanel.hide();
    this._statusPanel.isVisible()    && this._statusPanel.hide();
    this._spellsPanel.isVisible()    && this._spellsPanel.hide();

    if (tab === 'inventory') {
      this._inventoryPanel.show();
      EventBus.emit(EVENTS.INVENTORY_STATE_REQUESTED, { timestamp: Date.now() });
    } else if (tab === 'status') {
      this._statusPanel.show();
      EventBus.emit(EVENTS.STATUS_STATE_REQUESTED, { timestamp: Date.now() });
    } else if (tab === 'spells') {
      this._spellsPanel.show();
      EventBus.emit(EVENTS.SPELLS_STATE_REQUESTED, { timestamp: Date.now() });
    }

    EventBus.emit(EVENTS.INVENTORY_TAB_CHANGED, { tab });
  }

  private _showOverlayPanels(): void {
    this._tabContainer?.setVisible(true);
    this._switchTab(this._activeTab);
  }

  private _hideOverlayPanels(): void {
    this._tabContainer?.setVisible(false);
    this._inventoryPanel.hide();
    this._statusPanel.hide();
    this._spellsPanel.hide();
    this._activeTab = 'status';
  }

  // ─── InventoryViewModel builder ──────────────────────────────────────────

  private _buildInventoryViewModel(): InventoryViewModel {
    const data     = this._inventoryData!;
    const selIdx   = this._selectedInventoryIndex;
    const equipped = data.equipped;
    const equippedIds = new Set(Object.values(equipped).filter(Boolean));

    const rawItems = data.items as Array<{ id: string; type: string; slotId?: string; getDisplayName: (m: Record<string, boolean>) => string } | null>;
    const items: InventoryItemViewModel[] = rawItems.map((item, index) => {
      if (!item) return { index, id: null, displayName: '—', type: '', isEquipped: false, isSelected: false };
      const isEquipped = equippedIds.has(item.id);
      return {
        index,
        id:          item.id,
        displayName: item.getDisplayName(data.identifiedItems),
        type:        item.type,
        isEquipped,
        isSelected:  index === selIdx,
        slotId:      item.slotId as EquipmentSlotId | undefined,
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
      ? (() => {
          const isEquipped = equippedIds.has(selectedItem.id!);
          const hasSlot = !!selectedItem.slotId;
          const actions: Array<'equip' | 'unequip' | 'use' | 'drop'> = hasSlot
            ? (isEquipped ? ['unequip', 'drop'] : ['equip', 'drop'])
            : ['use', 'drop'];
          return {
            name:        selectedItem.displayName,
            description: `Tipo: ${selectedItem.type}`,
            actions:     actions as Array<'equip' | 'use' | 'drop'>,
          };
        })()
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
    this._goldLabel = this.add
      .text(PANEL_X, xpY + 24, 'Ouro: 500', { ...TEXT_STYLE, color: '#ffd700' })
      .setScrollFactor(0).setDepth(d + 1);

    // Ajustar altura do fundo do painel de stats para acomodar nova linha
    this.add
      .rectangle(0, 0, panelW, 70, 0x000000, 0.55)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(d - 1);
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
      this._showOverlayPanels();
    }, this);

    EventBus.on(EVENTS.INVENTORY_STATE_RESPONSE, (data: {
      items: unknown[];
      equipped: Record<string, string | null>;
      identifiedItems: Record<string, boolean>;
      selectedIndex?: number;
    }) => {
      if (!this.sys.isActive()) return;
      this._inventoryData = data;
      if (data.selectedIndex !== undefined) {
        this._selectedInventoryIndex = data.selectedIndex;
      }
      if (this._inventoryPanel.isVisible()) {
        this._inventoryPanel.markDirty();
      }
    }, this);

    EventBus.on(EVENTS.INVENTORY_CLOSED, () => {
      if (!this.sys.isActive()) return;
      this._hideOverlayPanels();
    }, this);

    EventBus.on(EVENTS.ITEM_EQUIPPED,   () => { this._inventoryPanel.markDirty(); }, this);
    EventBus.on(EVENTS.ITEM_UNEQUIPPED, () => { this._inventoryPanel.markDirty(); }, this);

    EventBus.on(EVENTS.PLAYER_GOLD_CHANGED, (data: { gold: number }) => {
      if (!this.sys.isActive() || !this._goldLabel?.active) return;
      this._goldLabel.setText(`Ouro: ${data.gold}`);
    }, this);

    EventBus.on(EVENTS.INVENTORY_SELECTION_CHANGED, (data: { selectedIndex: number }) => {
      if (!this.sys.isActive()) return;
      this._selectedInventoryIndex = data.selectedIndex;
      this._inventoryPanel.markDirty();
    }, this);

    EventBus.on(EVENTS.SHOP_OPENED, () => {
      if (!this.sys.isActive()) return;
      this._shopPanel.show();
    }, this);

    EventBus.on(EVENTS.SHOP_UPDATED, (data: ShopViewModel) => {
      if (!this.sys.isActive()) return;
      this._shopData = data;
      this._shopPanel.markDirty();
    }, this);

    EventBus.on(EVENTS.SHOP_CLOSED, () => {
      if (!this.sys.isActive()) return;
      this._shopPanel.hide();
    }, this);

    EventBus.on(EVENTS.STATUS_STATE_RESPONSE, (data: StatusViewModel) => {
      if (!this.sys.isActive()) return;
      this._statusData = data;
      this._statusPanel.markDirty();
    }, this);

    EventBus.on(EVENTS.SPELLS_STATE_RESPONSE, (data: SpellsViewModel) => {
      if (!this.sys.isActive()) return;
      this._spellsData = data;
      this._spellsPanel.markDirty();
      // Atualizar barra lateral de magias
      this.updateSpellBar(data.activeSlots);
    }, this);

    // Atualizar SpellBar quando uma magia for usada (cooldown inicia)
    EventBus.on(EVENTS.SPELL_CAST, () => {
      if (!this.sys.isActive()) return;
      EventBus.emit(EVENTS.SPELLS_STATE_REQUESTED, { timestamp: Date.now() });
    }, this);

    EventBus.on(EVENTS.STAT_POINT_SPENT, () => {
      if (!this.sys.isActive()) return;
      EventBus.emit(EVENTS.STATUS_STATE_REQUESTED, { timestamp: Date.now() });
    }, this);

    EventBus.on(EVENTS.SPELL_UNLOCKED, () => {
      if (!this.sys.isActive()) return;
      if (this._spellsPanel.isVisible()) {
        EventBus.emit(EVENTS.SPELLS_STATE_REQUESTED, { timestamp: Date.now() });
      }
      this._spellsPanel.markDirty();
    }, this);

    // SpellsPanel envia pedido de equipar → GameScene executa
    EventBus.on(EVENTS.SPELL_EQUIPPED, (data: { slotIndex: 0 | 1; spellId: string | null; action?: string }) => {
      if (!this.sys.isActive()) return;
      if (data.action === 'equip') {
        EventBus.emit(EVENTS.SPELL_EQUIP_REQUEST, { slotIndex: data.slotIndex, spellId: data.spellId });
      }
      // Sempre atualizar SpellBar e painel de magias após equipar
      EventBus.emit(EVENTS.SPELLS_STATE_REQUESTED, { timestamp: Date.now() });
    }, this);

    EventBus.on(EVENTS.INVENTORY_ITEM_CLICKED, (data: { source?: string; index: number }) => {
      if (!this.sys.isActive()) return;
      if (data.source === 'spells' && this._spellsData) {
        this._spellsPanel.selectByIndex(data.index, this._spellsData);
      }
    }, this);

    EventBus.on(EVENTS.DIALOG_OPENED, (data: { title: string; options: Array<{ id: string; label: string; content: string; action?: string; goldCost?: number }> }) => {
      if (!this.sys.isActive()) return;
      this._dialogPanel.show(data.title, data.options);
    }, this);

    EventBus.on(EVENTS.DIALOG_CLOSED, () => {
      if (!this.sys.isActive()) return;
      this._dialogPanel.hide();
    }, this);
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

  private _onLevelUp(data: { level: number; maxHp: number; attack: number; freePoints?: number }): void {
    if (!this.sys.isActive()) return;
    this._levelLabel.setText(`Nv ${data.level}  ATK ${data.attack}`);
    if (this._statusPanel.isVisible()) {
      EventBus.emit(EVENTS.STATUS_STATE_REQUESTED, { timestamp: Date.now() });
    }
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
