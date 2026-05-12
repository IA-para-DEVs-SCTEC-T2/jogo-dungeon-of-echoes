import * as Phaser from 'phaser';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import { AIService } from '../ai/AIService';
import { NarrativeService } from '../ai/NarrativeService';
import { AI_CONFIG } from '../ai/config';
import type { GameEvent } from '../systems/EventMemory';

interface GameOverData {
  level: number;
  xp: number;
  events?: GameEvent[];
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
    const cy = height / 2;

    this.add.rectangle(cx, cy, width, height, 0x000000, 0.92);

    this.add.text(cx, cy - 110, 'GAME OVER', {
      fontSize: '36px', color: '#ff4444', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 65, `Nível atingido: ${this.playerData.level}`, {
      fontSize: '18px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 40, `XP total: ${this.playerData.xp}`, {
      fontSize: '18px', color: '#ffdd00', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ─── Área da história narrativa ───────────────────────────────────────
    this.add.text(cx, cy - 10, '— A sua história —', {
      fontSize: '12px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this._storyText = this.add.text(cx, cy + 10, 'Gerando narrativa...', {
      fontSize: '11px',
      color: '#cccccc',
      fontFamily: 'monospace',
      fontStyle: 'italic',
      wordWrap: { width: width * 0.75 },
      align: 'center',
    }).setOrigin(0.5, 0);

    // ─── Botão de reinício ────────────────────────────────────────────────
    const btn = this.add.text(cx, cy + 110, '[ Jogar Novamente ]', {
      fontSize: '20px', color: '#00ff88', fontFamily: 'monospace',
      backgroundColor: '#003322', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#00ff88'));
    btn.on('pointerdown', () => this._restart());

    this.input.keyboard!.once('keydown-ENTER', () => this._restart());
    this.input.keyboard!.once('keydown-SPACE', () => this._restart());

    // ─── Gerar narrativa de morte ─────────────────────────────────────────
    this._generateDeathStory();

    // Ouvir se a GameScene já gerou a história antes desta cena abrir
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

    const aiService       = new AIService(AI_CONFIG.API_KEY);
    const narrativeService = new NarrativeService(aiService);

    narrativeService.generateDeathStory(events)
      .then((story) => {
        this._setStory(story);
      })
      .catch(() => {
        this._setStory('Uma jornada sombria chegou ao fim nas profundezas da masmorra.');
      });
  }

  private _setStory(story: string): void {
    if (this._storyText?.active) {
      this._storyText.setText(story);
    }
  }

  private _restart(): void {
    this.scene.start('GameScene');
  }
}
