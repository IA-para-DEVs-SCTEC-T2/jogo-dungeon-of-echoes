import * as Phaser from 'phaser';
import { EVENTS, SPRITES, DAWNLIKE_FRAMES } from '../utils/constants';
import { EventBus } from '../utils/EventBus';
import { Item, ItemType } from '../entities/Item';

const BAR_W     = 120;
const BAR_H     = 8;
const PANEL_X   = 8;
const PANEL_Y   = 8;
const LOG_LINES = 5;
const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '9px',
  color: '#e2e8f0',
  fontFamily: 'monospace',
};

// Action bar
const SLOT_COUNT = 9;
const SLOT_SIZE  = 24;
const SLOT_GAP   = 4;
const SLOT_DEPTH = 200;

type SlotGraphics = {
  bg:   Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Sprite;
  key:  Phaser.GameObjects.Text;
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

  // Message log
  private _logLines: Phaser.GameObjects.Text[] = [];
  private _logBuffer: string[] = [];

  // Inventory action bar
  private _slots: SlotGraphics[] = [];

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this._createTopPanel();
    this._createActionBar();
    this._createMessageLog();
    this._registerEvents();
  }

  shutdown(): void {
    EventBus.off(EVENTS.PLAYER_HP_CHANGED,   this._onHPChanged,   this);
    EventBus.off(EVENTS.PLAYER_MANA_CHANGED, this._onManaChanged, this);
    EventBus.off(EVENTS.PLAYER_XP_CHANGED,   this._onXPChanged,   this);
    EventBus.off(EVENTS.PLAYER_LEVELED_UP,   this._onLevelUp,     this);
    EventBus.off(EVENTS.UI_LOG,              this._onLog,         this);
    EventBus.off(EVENTS.ITEM_PICKED_UP,      this._onItemPickedUp, this);
    EventBus.off(EVENTS.ITEM_USED,           this._onItemUsed,    this);
  }

  // ─── Criação ─────────────────────────────────────────────────────────────

  private _createTopPanel(): void {
    const d = SLOT_DEPTH;

    this.add
      .rectangle(PANEL_X - 4, PANEL_Y - 4, BAR_W + 70, 56, 0x000000, 0.65)
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

  private _createActionBar(): void {
    const { width, height } = this.scale;
    const totalW = SLOT_COUNT * (SLOT_SIZE + SLOT_GAP) - SLOT_GAP;
    const startX = Math.floor((width - totalW) / 2);
    const barY   = height - SLOT_SIZE - 10;

    // Fundo da barra
    this.add
      .rectangle(startX - 6, barY - 4, totalW + 12, SLOT_SIZE + 8, 0x000000, 0.7)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(SLOT_DEPTH);

    for (let i = 0; i < SLOT_COUNT; i++) {
      const x = startX + i * (SLOT_SIZE + SLOT_GAP);

      const bg = this.add
        .rectangle(x, barY, SLOT_SIZE, SLOT_SIZE, 0x222244)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(SLOT_DEPTH + 1)
        .setStrokeStyle(1, 0x4455aa);

      // Ícone: sprite real do item (invisível até ter item no slot)
      const icon = this.add
        .sprite(x + SLOT_SIZE / 2, barY + SLOT_SIZE / 2, SPRITES.POTION, 0)
        .setScrollFactor(0).setDepth(SLOT_DEPTH + 2)
        .setVisible(false);

      // Tecla de atalho (1–9)
      const key = this.add
        .text(x + 2, barY + 2, String(i + 1), { fontSize: '7px', color: '#667799', fontFamily: 'monospace' })
        .setScrollFactor(0).setDepth(SLOT_DEPTH + 3);

      this._slots.push({ bg, icon, key });
    }
  }

  private _createMessageLog(): void {
    const { width, height } = this.scale;
    const logH = LOG_LINES * 13 + 10;
    // Posiciona acima da action bar
    const logY = height - logH - SLOT_SIZE - 20;

    this.add
      .rectangle(4, logY, width - 8, logH, 0x000000, 0.55)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(SLOT_DEPTH);

    for (let i = 0; i < LOG_LINES; i++) {
      this._logLines.push(
        this.add
          .text(10, logY + 5 + i * 13, '', { ...TEXT_STYLE, color: '#94a3b8' })
          .setScrollFactor(0).setDepth(SLOT_DEPTH + 1),
      );
    }
  }

  // ─── Registro de Eventos ──────────────────────────────────────────────────

  private _registerEvents(): void {
    EventBus.on(EVENTS.PLAYER_HP_CHANGED,   this._onHPChanged,    this);
    EventBus.on(EVENTS.PLAYER_MANA_CHANGED, this._onManaChanged,  this);
    EventBus.on(EVENTS.PLAYER_XP_CHANGED,   this._onXPChanged,    this);
    EventBus.on(EVENTS.PLAYER_LEVELED_UP,   this._onLevelUp,      this);
    EventBus.on(EVENTS.UI_LOG,              this._onLog,          this);
    EventBus.on(EVENTS.ITEM_PICKED_UP,      this._onItemPickedUp, this);
    EventBus.on(EVENTS.ITEM_USED,           this._onItemUsed,     this);
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

  private _onLog(message: string): void {
    if (!this.sys.isActive()) return;
    this._logBuffer.push(`> ${message}`);
    if (this._logBuffer.length > LOG_LINES) this._logBuffer.shift();
    this._logLines.forEach((line, i) => line.setText(this._logBuffer[i] ?? ''));
  }

  private _getItemVisual(type: ItemType): { texture: string; frame: number } {
    switch (type) {
      case 'potion_heal':   return { texture: SPRITES.POTION, frame: DAWNLIKE_FRAMES.POTION_HEAL };
      case 'potion_poison': return { texture: SPRITES.POTION, frame: DAWNLIKE_FRAMES.POTION_POISON };
      case 'gold':          return { texture: SPRITES.MONEY,  frame: DAWNLIKE_FRAMES.GOLD };
    }
  }

  private _onItemPickedUp(data: { item: Item; slotIndex: number }): void {
    if (!this.sys.isActive()) return;
    const slot = this._slots[data.slotIndex];
    if (!slot) return;
    const { texture, frame } = this._getItemVisual(data.item.type);
    slot.icon.setTexture(texture, frame).setVisible(true);
    slot.bg.setStrokeStyle(1, 0xffd700);
  }

  private _onItemUsed(data: { itemIndex: number }): void {
    if (!this.sys.isActive()) return;
    const slot = this._slots[data.itemIndex];
    if (!slot) return;
    slot.icon.setVisible(false);
    slot.bg.setStrokeStyle(1, 0x4455aa);
  }
}
