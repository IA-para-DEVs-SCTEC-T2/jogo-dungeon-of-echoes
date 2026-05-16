import * as Phaser from 'phaser';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import { AIService } from '../ai/AIService';
import { NarrativeService } from '../ai/NarrativeService';
import { AI_CONFIG } from '../ai/config';
import type { GameEvent } from '../systems/EventMemory';

interface GameOverData {
  level:          number;
  xp:             number;
  events?:        GameEvent[];
  // Métricas da partida
  turnsSurvived?: number;
  damageDealt?:   number;
  damageTaken?:   number;
  enemiesKilled?: number;
  itemsUsed?:     number;
  floorsReached?: number;
}

export class GameOverScene extends Phaser.Scene {
  private playerData!: GameOverData;
  private _storyText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.playerData = data ?? { level: 1, xp: 0, events: [] };
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Fundo escuro
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.95);

    // ─── Título ───────────────────────────────────────────────────────────
    this.add.text(cx, 40, '☠  VOCÊ MORREU  ☠', {
      fontSize: '32px', color: '#ff4444', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ─── Painel de estatísticas ───────────────────────────────────────────
    const panelW = Math.min(420, width * 0.85);
    const panelH = 220;
    const panelX = cx - panelW / 2;
    const panelY = 90;

    // Fundo e borda do painel
    this.add.rectangle(cx, panelY + panelH / 2, panelW, panelH, 0x111122, 0.9);
    this.add.rectangle(cx, panelY + panelH / 2, panelW, panelH)
      .setStrokeStyle(1, 0x4444aa);

    const stats = [
      { label: 'Nível alcançado',     value: this.playerData.level },
      { label: 'XP total',            value: this.playerData.xp },
      { label: 'Andares explorados',  value: this.playerData.floorsReached ?? 1 },
      { label: 'Inimigos mortos',     value: this.playerData.enemiesKilled ?? 0 },
      { label: 'Dano causado',        value: this.playerData.damageDealt ?? 0 },
      { label: 'Dano recebido',       value: this.playerData.damageTaken ?? 0 },
      { label: 'Turnos sobrevividos', value: this.playerData.turnsSurvived ?? 0 },
      { label: 'Itens usados',        value: this.playerData.itemsUsed ?? 0 },
    ];

    const colLabelX = panelX + 20;
    const colValueX = panelX + panelW - 20;
    const lineH     = 24;
    const startY    = panelY + 16;

    stats.forEach((stat, i) => {
      const y = startY + i * lineH;
      this.add.text(colLabelX, y, stat.label, {
        fontSize: '13px', color: '#aaaacc', fontFamily: 'monospace',
      }).setOrigin(0, 0);
      this.add.text(colValueX, y, String(stat.value), {
        fontSize: '13px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(1, 0);
    });

    // ─── Área da história narrativa ───────────────────────────────────────
    const storyY = panelY + panelH + 16;

    this.add.text(cx, storyY, '— A sua história —', {
      fontSize: '11px', color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this._storyText = this.add.text(cx, storyY + 18, 'Gerando narrativa...', {
      fontSize: '11px',
      color: '#cccccc',
      fontFamily: 'monospace',
      fontStyle: 'italic',
      wordWrap: { width: panelW },
      align: 'center',
    }).setOrigin(0.5, 0);

    // ─── Botão de reinício ────────────────────────────────────────────────
    const btnY = height - 50;
    const btn = this.add.text(cx, btnY, '[ Jogar Novamente ]', {
      fontSize: '20px', color: '#00ff88', fontFamily: 'monospace',
      backgroundColor: '#003322', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout',  () => btn.setColor('#00ff88'));
    btn.on('pointerdown', () => this._restart());

    this.input.keyboard!.once('keydown-ENTER', () => this._restart());
    this.input.keyboard!.once('keydown-SPACE', () => this._restart());

    // ─── Gerar narrativa de morte ─────────────────────────────────────────
    this._generateDeathStory();

    EventBus.on(EVENTS.DEATH_STORY_GENERATED, (data: { story: string }) => {
      this._setStory(data.story);
    }, this);
  }

  shutdown(): void {
    EventBus.off(EVENTS.DEATH_STORY_GENERATED, undefined, this);
  }

  private _generateDeathStory(): void {
    const events = this.playerData.events ?? [];

    if (events.length === 0) {
      this._setStory('Uma jornada sombria chegou ao fim nas profundezas da masmorra.');
      return;
    }

    const aiService        = new AIService(AI_CONFIG.API_KEY);
    const narrativeService = new NarrativeService(aiService);

    narrativeService.generateDeathStory(events)
      .then((story) => this._setStory(story))
      .catch(()     => this._setStory('Uma jornada sombria chegou ao fim nas profundezas da masmorra.'));
  }

  private _setStory(story: string): void {
    if (this._storyText?.active) {
      this._storyText.setText(story);
    }
  }

  private _restart(): void {
    this.scene.start('MainMenuScene');
  }
}
