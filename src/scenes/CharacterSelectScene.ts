import * as Phaser from 'phaser';
import { PLAYER_CLASSES, type PlayerClassDef } from '../config/player-classes.config';
import {
  GLOBAL_DIFFICULTY_CONFIGS,
  type GlobalDifficultyLevel,
} from '../config/global-difficulty.config';

const PREVIEW_SCALE = 6;

const DIFFICULTY_ORDER: GlobalDifficultyLevel[] = ['easy', 'medium', 'hard'];

export class CharacterSelectScene extends Phaser.Scene {
  private _selectedIdx = 0;
  private _previewSprite!: Phaser.GameObjects.Sprite;
  private _descText!: Phaser.GameObjects.Text;
  private _buttons: Array<{ btn: Phaser.GameObjects.Text; def: PlayerClassDef }> = [];
  private _animTimer?: Phaser.Time.TimerEvent;
  private _animFrame = 0;
  private _animCurrentFrame = PLAYER_CLASSES[0].frame;
  private _transitioning = false;
  private _escKey!: Phaser.Input.Keyboard.Key;

  private _selectedDifficulty: GlobalDifficultyLevel = 'medium';
  private _difficultyButtons: Array<{ btn: Phaser.GameObjects.Text; level: GlobalDifficultyLevel }> = [];
  private _difficultyDescText!: Phaser.GameObjects.Text;

  private get _selected(): PlayerClassDef { return PLAYER_CLASSES[this._selectedIdx]; }

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Reset state from previous visit
    this._buttons = [];
    this._difficultyButtons = [];
    this._animTimer = undefined;
    this._animFrame = 0;
    this._animCurrentFrame = PLAYER_CLASSES[0].frame;
    this._transitioning = false;
    this._selectedDifficulty = 'medium';

    // Fundo
    this.add.rectangle(0, 0, width, height, 0x0d0d1e).setOrigin(0);

    // Título
    this.add.text(width / 2, height * 0.08, 'Dungeon of Echoes', {
      fontSize: '32px',
      color: '#ffd700',
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.18, 'Bem-vindo, herói!\nEscolha sua classe para começar a jornada.', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'monospace',
      align: 'center',
    }).setOrigin(0.5);

    // Preview sprite (lado direito)
    const previewX = width * 0.72;
    const previewY = height * 0.45;

    this.add.text(previewX, height * 0.28, 'Preview', {
      fontSize: '13px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this._previewSprite = this.add.sprite(previewX, previewY, 'player', this._selected.frame)
      .setScale(PREVIEW_SCALE);

    this._descText = this.add.text(previewX, previewY + 72, '', {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: 200 },
    }).setOrigin(0.5);

    // Botões de classe
    const btnStartY = height * 0.32;
    const btnGapY   = 60;
    const btnX      = width * 0.28;

    PLAYER_CLASSES.forEach((def, i) => {
      const btn = this.add.text(btnX, btnStartY + i * btnGapY, def.label, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#2a2a4a',
        padding: { x: 18, y: 10 },
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => this._hover(def, btn));
      btn.on('pointerout',  () => this._unhover(btn));
      btn.on('pointerdown', () => { this._selectedIdx = i; this._applySelection(); });

      this._buttons.push({ btn, def });
    });

    // ── Seção de Dificuldade ─────────────────────────────────────────────────
    this.add.line(width / 2, height * 0.77, 0, 0, width * 0.8, 0, 0x444466).setOrigin(0.5);

    this.add.text(width / 2, height * 0.80, 'Dificuldade', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const diffBtnY    = height * 0.855;
    const diffSpacing = width * 0.18;
    const diffStartX  = width / 2 - diffSpacing;

    DIFFICULTY_ORDER.forEach((level, i) => {
      const cfg = GLOBAL_DIFFICULTY_CONFIGS[level];
      const bx  = diffStartX + i * diffSpacing;
      const btn = this.add.text(bx, diffBtnY, cfg.label, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#2a2a4a',
        padding: { x: 14, y: 7 },
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this._selectedDifficulty = level;
        this._applyDifficultySelection();
      });
      btn.on('pointerover', () => {
        if (this._selectedDifficulty !== level) btn.setStyle({ color: '#ffd700' });
      });
      btn.on('pointerout', () => {
        if (this._selectedDifficulty !== level) btn.setStyle({ color: '#ffffff' });
      });

      this._difficultyButtons.push({ btn, level });
    });

    this._difficultyDescText = this.add.text(width / 2, height * 0.905, '', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
      align: 'center',
    }).setOrigin(0.5);

    this.add.line(width / 2, height * 0.935, 0, 0, width * 0.8, 0, 0x444466).setOrigin(0.5);

    // Botões de ação
    this._makeActionBtn(width * 0.34, height * 0.965, 'Voltar', () => {
      if (this._transitioning) return;
      this._transitioning = true;
      this._stopAnim();
      this.scene.start('MainMenuScene');
    });

    this._makeActionBtn(width * 0.66, height * 0.965, 'Confirmar', () => this._confirm());

    // Seleciona estado inicial
    this._applySelection();
    this._applyDifficultySelection();

    // Teclado
    this._escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.input.keyboard!.on('keydown-UP',    () => this._moveSelection(-1));
    this.input.keyboard!.on('keydown-DOWN',  () => this._moveSelection(+1));
    this.input.keyboard!.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard!.on('keydown-SPACE', () => this._confirm());

    this.events.once('shutdown', () => {
      this._stopAnim();
      this.input.removeAllListeners();
      this.input.keyboard?.removeAllListeners();
      this.input.keyboard?.clearCaptures();
    });
  }

  update(): void {
    if (this._transitioning) return;
    if (Phaser.Input.Keyboard.JustDown(this._escKey)) {
      this._transitioning = true;
      this._stopAnim();
      this.scene.start('MainMenuScene');
    }
  }

  private _hover(def: PlayerClassDef, btn: Phaser.GameObjects.Text): void {
    const idx = PLAYER_CLASSES.indexOf(def);
    if (idx !== this._selectedIdx) {
      btn.setStyle({ color: '#ffd700' });
    }
    this._startAnim(def.frame);
    this._descText.setText(def.description);
  }

  private _unhover(btn: Phaser.GameObjects.Text): void {
    const entry = this._buttons.find(b => b.btn === btn);
    if (entry && entry.def.id !== this._selected.id) {
      btn.setStyle({ color: '#ffffff' });
    }
    this._startAnim(this._selected.frame);
    this._descText.setText(this._selected.description);
  }

  private _moveSelection(delta: number): void {
    this._selectedIdx = (this._selectedIdx + delta + PLAYER_CLASSES.length) % PLAYER_CLASSES.length;
    this._applySelection();
  }

  private _applySelection(): void {
    for (const { btn } of this._buttons) {
      btn.setStyle({ color: '#ffffff', backgroundColor: '#2a2a4a' });
    }
    this._buttons[this._selectedIdx].btn.setStyle({ color: '#ffd700', backgroundColor: '#3a3a6a' });
    this._descText.setText(this._selected.description);
    this._startAnim(this._selected.frame);
  }

  private _applyDifficultySelection(): void {
    for (const { btn, level } of this._difficultyButtons) {
      if (level === this._selectedDifficulty) {
        btn.setStyle({ color: '#ffd700', backgroundColor: '#3a3a6a' });
      } else {
        btn.setStyle({ color: '#ffffff', backgroundColor: '#2a2a4a' });
      }
    }
    this._difficultyDescText.setText(
      GLOBAL_DIFFICULTY_CONFIGS[this._selectedDifficulty].description,
    );
  }

  private _confirm(): void {
    if (this._transitioning) return;
    this._transitioning = true;
    this._stopAnim();
    this.scene.start('GameScene', {
      playerClass: this._selected.id,
      difficulty:  this._selectedDifficulty,
    });
  }

  private _startAnim(frame: number): void {
    if (frame === this._animCurrentFrame && this._animTimer) return;
    this._stopAnim();
    this._animCurrentFrame = frame;
    this._animFrame = 0;
    this._previewSprite.setTexture('player', frame);

    this._animTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this._animFrame = 1 - this._animFrame;
        const tex = this._animFrame === 0 ? 'player' : 'player1';
        this._previewSprite.setTexture(tex, frame);
      },
    });
  }

  private _stopAnim(): void {
    if (this._animTimer) {
      this._animTimer.destroy();
      this._animTimer = undefined;
    }
  }

  private _makeActionBtn(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#333355',
      padding: { x: 20, y: 10 },
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#ffd700' }));
    btn.on('pointerout',  () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown', onClick);
  }
}
