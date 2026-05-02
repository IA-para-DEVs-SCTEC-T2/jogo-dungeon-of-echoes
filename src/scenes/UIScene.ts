import * as Phaser from 'phaser';
import { EVENTS, COLORS } from '../utils/constants';
import { EventBus } from '../utils/EventBus';

const BAR_W      = 120;
const BAR_H      = 8;
const PANEL_X    = 8;
const PANEL_Y    = 8;
const LOG_LINES  = 5;
const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '9px',
  color: '#e2e8f0',
  fontFamily: 'monospace',
};

export class UIScene extends Phaser.Scene {
  // Barra de HP
  private _hpBarBg!: Phaser.GameObjects.Rectangle;
  private _hpBar!: Phaser.GameObjects.Rectangle;
  private _hpLabel!: Phaser.GameObjects.Text;

  // Barra de Mana
  private _mpBarBg!: Phaser.GameObjects.Rectangle;
  private _mpBar!: Phaser.GameObjects.Rectangle;
  private _mpLabel!: Phaser.GameObjects.Text;

  // Labels de status
  private _levelLabel!: Phaser.GameObjects.Text;
  private _xpLabel!: Phaser.GameObjects.Text;

  // Log de mensagens
  private _logLines: Phaser.GameObjects.Text[] = [];
  private _logBuffer: string[] = [];

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this._createTopPanel();
    this._createMessageLog();
    this._registerEvents();
  }

  shutdown(): void {
    EventBus.off(EVENTS.PLAYER_HP_CHANGED,   this._onHPChanged,   this);
    EventBus.off(EVENTS.PLAYER_MANA_CHANGED, this._onManaChanged, this);
    EventBus.off(EVENTS.PLAYER_XP_CHANGED,   this._onXPChanged,   this);
    EventBus.off(EVENTS.PLAYER_LEVELED_UP,   this._onLevelUp,     this);
    EventBus.off(EVENTS.UI_LOG,              this._onLog,         this);
  }

  // ─── Criação ─────────────────────────────────────────────────────────────

  private _createTopPanel(): void {
    const depth = 200;

    // Fundo semi-transparente
    this.add
      .rectangle(PANEL_X - 4, PANEL_Y - 4, BAR_W + 70, 56, 0x000000, 0.65)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth);

    // ── HP bar ──
    const hpY = PANEL_Y + 4;
    this.add.text(PANEL_X, hpY, 'HP', { ...TEXT_STYLE, color: '#f87171' })
      .setScrollFactor(0).setDepth(depth + 1);

    this._hpBarBg = this.add
      .rectangle(PANEL_X + 18, hpY + 4, BAR_W, BAR_H, 0x330000)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth + 1);

    this._hpBar = this.add
      .rectangle(PANEL_X + 18, hpY + 4, BAR_W, BAR_H, 0x22cc44)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth + 2);

    this._hpLabel = this.add
      .text(PANEL_X + 18 + BAR_W + 4, hpY, '', TEXT_STYLE)
      .setScrollFactor(0).setDepth(depth + 2);

    // ── Mana bar ──
    const mpY = PANEL_Y + 18;
    this.add.text(PANEL_X, mpY, 'MP', { ...TEXT_STYLE, color: '#60a5fa' })
      .setScrollFactor(0).setDepth(depth + 1);

    this._mpBarBg = this.add
      .rectangle(PANEL_X + 18, mpY + 4, BAR_W, BAR_H, 0x001133)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth + 1);

    this._mpBar = this.add
      .rectangle(PANEL_X + 18, mpY + 4, BAR_W, BAR_H, 0x2244ff)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth + 2);

    this._mpLabel = this.add
      .text(PANEL_X + 18 + BAR_W + 4, mpY, '', TEXT_STYLE)
      .setScrollFactor(0).setDepth(depth + 2);

    // ── Nível + XP ──
    const xpY = PANEL_Y + 32;
    this._levelLabel = this.add
      .text(PANEL_X, xpY, 'Nv 1  ATK 10', TEXT_STYLE)
      .setScrollFactor(0).setDepth(depth + 1);

    this._xpLabel = this.add
      .text(PANEL_X, xpY + 12, 'XP: 0 / 100', TEXT_STYLE)
      .setScrollFactor(0).setDepth(depth + 1);
  }

  private _createMessageLog(): void {
    const depth    = 200;
    const { height } = this.scale;
    const logH    = LOG_LINES * 13 + 10;
    const logY    = height - logH - 4;

    this.add
      .rectangle(4, logY, this.scale.width - 8, logH, 0x000000, 0.55)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth);

    for (let i = 0; i < LOG_LINES; i++) {
      this._logLines.push(
        this.add
          .text(10, logY + 5 + i * 13, '', { ...TEXT_STYLE, color: '#94a3b8' })
          .setScrollFactor(0)
          .setDepth(depth + 1),
      );
    }
  }

  // ─── Handlers de Evento ──────────────────────────────────────────────────

  private _registerEvents(): void {
    EventBus.on(EVENTS.PLAYER_HP_CHANGED,   this._onHPChanged,   this);
    EventBus.on(EVENTS.PLAYER_MANA_CHANGED, this._onManaChanged, this);
    EventBus.on(EVENTS.PLAYER_XP_CHANGED,   this._onXPChanged,   this);
    EventBus.on(EVENTS.PLAYER_LEVELED_UP,   this._onLevelUp,     this);
    EventBus.on(EVENTS.UI_LOG,              this._onLog,         this);
  }

  private _onHPChanged(data: { hp: number; maxHp: number }): void {
    if (!this.sys.isActive() || !this._hpBar?.active) return;
    const ratio = data.maxHp > 0 ? data.hp / data.maxHp : 0;
    const w = Math.max(0.1, BAR_W * ratio);
    this._hpBar.setSize(w, BAR_H);
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
    if (this._logBuffer.length > LOG_LINES) {
      this._logBuffer.shift();
    }
    this._logLines.forEach((line, i) => {
      line.setText(this._logBuffer[i] ?? '');
    });
  }
}
