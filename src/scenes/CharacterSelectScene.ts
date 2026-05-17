import * as Phaser from 'phaser';
import { PLAYER_CLASSES, type PlayerClassDef } from '../config/player-classes.config';
import {
  GLOBAL_DIFFICULTY_CONFIGS,
  type GlobalDifficultyLevel,
} from '../config/global-difficulty.config';

// ── Visual constants ──────────────────────────────────────────────────────────
const C = {
  DARK_BG:  0x070712,
  PANEL_BG: 0x0e0e24,
  CARD_BG:  0x14143a,
  CARD_SEL: 0x1e1e52,
  CARD_HOV: 0x181842,
  BORDER:   0x2a2a5a,
  GOLD:     0xffd700,
  GOLD_DIM: 0xb8a020,
} as const;

const DIFF_STYLE: Record<GlobalDifficultyLevel, {
  bg: number; border: number; borderSel: number; textColor: string; symbol: string;
}> = {
  easy:   { bg: 0x0a1a0a, border: 0x2a622a, borderSel: 0x44cc44, textColor: '#44cc66', symbol: '◆' },
  medium: { bg: 0x1a1400, border: 0x997700, borderSel: 0xffd700, textColor: '#ffd700', symbol: '●' },
  hard:   { bg: 0x1a0505, border: 0x991111, borderSel: 0xff4444, textColor: '#cc3333', symbol: '■' },
};

const CLASS_TAGS: Record<string, string> = {
  'Aventureiro': 'Equilibrado · Sorte aumentada',
  'Guerreiro':   'Alta força · Resistência máxima',
  'Arqueiro':    'Alcance · Precisão à distância',
  'Mago':        'Arcano · 4 slots de magia',
};

const DIFFICULTY_ORDER: GlobalDifficultyLevel[] = ['easy', 'medium', 'hard'];

// ── Internal card types ───────────────────────────────────────────────────────
type ClassCardEntry = {
  x: number; y: number; w: number; h: number;
  bg: Phaser.GameObjects.Rectangle;
  border: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;
  tagText: Phaser.GameObjects.Text;
  def: PlayerClassDef;
};

type DiffCardEntry = {
  x: number; y: number; w: number; h: number;
  bg: Phaser.GameObjects.Rectangle;
  border: Phaser.GameObjects.Graphics;
  symbol: Phaser.GameObjects.Text;
  labelText: Phaser.GameObjects.Text;
  desc: Phaser.GameObjects.Text;
  level: GlobalDifficultyLevel;
};

// ── Layout constants ──────────────────────────────────────────────────────────
const PREVIEW_SCALE = 8;

// Left panel
const PL_X = 12;
const PL_Y = 68;
const PL_W = 330;
const PL_H = 318; // was 402 — reduced ~21% to make room for diff/footer

// Right panel
const PR_X = 348;
const PR_Y = 68;
const PR_W = 440;
const PR_H = 318;
const PR_CX = PR_X + PR_W / 2; // 568

// Class cards
const CARD_W = PL_W - 20; // 310
const CARD_H = 62;         // was 80
const CARD_GAP = 8;        // was 10
const CARD_START_Y = PL_Y + 28;

// Sprite position (feet at SPRITE_Y)
const SPRITE_Y = PR_Y + 168; // was 195

export class CharacterSelectScene extends Phaser.Scene {
  private _selectedIdx = 0;
  private _selectedDifficulty: GlobalDifficultyLevel = 'medium';
  private _transitioning = false;
  private _escKey!: Phaser.Input.Keyboard.Key;

  private _classCards: ClassCardEntry[] = [];
  private _diffCards:  DiffCardEntry[]  = [];

  private _previewSprite!: Phaser.GameObjects.Sprite;
  private _previewGlow!:   Phaser.GameObjects.Rectangle;
  private _previewName!:   Phaser.GameObjects.Text;
  private _previewDesc!:   Phaser.GameObjects.Text;

  private _animTimer?: Phaser.Time.TimerEvent;
  private _animFrame = 0;
  private _animCurrentFrame = PLAYER_CLASSES[0].frame;
  private _bobTween?: Phaser.Tweens.Tween;
  private _glowTween?: Phaser.Tweens.Tween;

  private get _selected(): PlayerClassDef { return PLAYER_CLASSES[this._selectedIdx]; }

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    // Reset mutable state (class instance is reused between visits)
    this._classCards = [];
    this._diffCards  = [];
    this._animTimer  = undefined;
    this._animFrame  = 0;
    this._animCurrentFrame = PLAYER_CLASSES[0].frame;
    this._transitioning = false;
    this._selectedDifficulty = 'medium';

    this._buildBackground();
    this._buildHeader();
    this._buildClassPanel();
    this._buildPreviewPanel();
    this._buildDifficultyPanel();
    this._buildFooter();

    // Apply initial selection state
    this._applyClassSelection();
    this._applyDiffSelection();
    this._startIdleAnims();

    // Keyboard
    this._escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.input.keyboard!.on('keydown-UP',    () => this._moveSelection(-1));
    this.input.keyboard!.on('keydown-DOWN',  () => this._moveSelection(+1));
    this.input.keyboard!.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard!.on('keydown-SPACE', () => this._confirm());

    this.events.once('shutdown', () => {
      this._stopAnim();
      this._stopIdleAnims();
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
      this._stopIdleAnims();
      this.scene.start('MainMenuScene');
    }
  }

  // ── Builders ────────────────────────────────────────────────────────────────

  private _buildBackground(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // Base dark fill
    this.add.rectangle(0, 0, W, H, C.DARK_BG).setOrigin(0);

    // Try game_bg if texture exists
    if (this.textures.exists('game_bg')) {
      this.add.image(W / 2, H / 2, 'game_bg')
        .setDisplaySize(W, H)
        .setAlpha(0.18);
    }

    // Vignette — dark gradient edges via overlapping semi-transparent rects
    const VIG = 180;
    this.add.rectangle(0, 0, W, VIG, 0x000000).setOrigin(0).setAlpha(0.55);
    this.add.rectangle(0, H - VIG, W, VIG, 0x000000).setOrigin(0).setAlpha(0.55);

    // Dust motes
    for (let i = 0; i < 10; i++) {
      const mx = Math.round(Math.random() * W);
      const my = Math.round(Math.random() * H);
      const mote = this.add.rectangle(mx, my, 2, 2, 0xaaaaff).setAlpha(0.22);
      this.tweens.add({
        targets: mote,
        y: my - Math.round(30 + Math.random() * 40),
        alpha: { from: 0.22, to: 0 },
        duration: 3000 + Math.random() * 3000,
        delay: Math.random() * 4000,
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          mote.setPosition(Math.round(Math.random() * W), Math.round(60 + Math.random() * (H - 120)));
          mote.setAlpha(0.22);
        },
      });
    }
  }

  private _buildHeader(): void {
    const W = this.scale.width;

    this.add.text(W / 2, 18, 'DUNGEON OF ECHOES', {
      fontSize: '26px',
      color: '#ffd700',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, 47, 'Escolha sua classe e dificuldade', {
      fontSize: '12px',
      color: '#7777aa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Decorative separator line
    const g = this.add.graphics();
    g.lineStyle(1, C.BORDER, 0.8);
    g.lineBetween(20, 62, W - 20, 62);
  }

  private _buildClassPanel(): void {
    // Panel background
    const panel = this.add.rectangle(PL_X, PL_Y, PL_W, PL_H, C.PANEL_BG).setOrigin(0);
    panel.setAlpha(0.92);
    this._drawStaticBorder(PL_X, PL_Y, PL_W, PL_H, C.BORDER, 1);
    this._drawCornerAccents(PL_X, PL_Y, PL_W, PL_H, C.GOLD_DIM);

    // Section label
    this.add.text(PL_X + PL_W / 2, PL_Y + 14, 'CLASSE', {
      fontSize: '11px',
      color: '#666699',
      fontFamily: 'monospace',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Class cards
    PLAYER_CLASSES.forEach((def, i) => {
      const cx = PL_X + 10;
      const cy = CARD_START_Y + i * (CARD_H + CARD_GAP);
      const entry = this._makeClassCard(i, cx, cy, CARD_W, CARD_H, def);
      this._classCards.push(entry);
    });
  }

  private _buildPreviewPanel(): void {
    // Panel background
    const panel = this.add.rectangle(PR_X, PR_Y, PR_W, PR_H, C.PANEL_BG).setOrigin(0);
    panel.setAlpha(0.92);
    this._drawStaticBorder(PR_X, PR_Y, PR_W, PR_H, C.BORDER, 1);
    this._drawCornerAccents(PR_X, PR_Y, PR_W, PR_H, C.GOLD_DIM);

    // Section label
    this.add.text(PR_CX, PR_Y + 14, 'PREVIEW', {
      fontSize: '11px',
      color: '#666699',
      fontFamily: 'monospace',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Glow rect behind sprite (animated alpha)
    this._previewGlow = this.add.rectangle(PR_CX, SPRITE_Y - 52, 90, 90, 0x3333cc)
      .setAlpha(0.0);

    // Decorative frame around sprite area
    const frameG = this.add.graphics();
    frameG.lineStyle(1, C.GOLD_DIM, 0.22);
    frameG.strokeRect(PR_CX - 72, SPRITE_Y - 116, 144, 144);

    // Pedestal ellipse
    const pedestalG = this.add.graphics();
    pedestalG.fillStyle(0x1a1a3a, 0.9);
    pedestalG.fillEllipse(PR_CX, SPRITE_Y + 8, 128, 20);
    pedestalG.lineStyle(1, 0x22224a, 1);
    pedestalG.strokeEllipse(PR_CX, SPRITE_Y + 8, 128, 20);

    // Preview sprite (origin bottom-center so feet land on SPRITE_Y)
    this._previewSprite = this.add.sprite(PR_CX, SPRITE_Y, 'player', this._selected.frame)
      .setScale(PREVIEW_SCALE)
      .setOrigin(0.5, 1);

    // Name
    this._previewName = this.add.text(PR_CX, PR_Y + 242, '', {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Thin separator
    const sepG = this.add.graphics();
    sepG.lineStyle(1, C.BORDER, 0.5);
    sepG.lineBetween(PR_X + 40, PR_Y + 260, PR_X + PR_W - 40, PR_Y + 260);

    // Description
    this._previewDesc = this.add.text(PR_CX, PR_Y + 268, '', {
      fontSize: '11px',
      color: '#9999bb',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: 380 },
    }).setOrigin(0.5, 0);
  }

  private _buildDifficultyPanel(): void {
    const W = this.scale.width;
    const SEP_Y = 394;

    const sepG = this.add.graphics();
    sepG.lineStyle(1, C.BORDER, 0.6);
    sepG.lineBetween(20, SEP_Y, W - 20, SEP_Y);

    this.add.text(W / 2, SEP_Y + 10, 'DIFICULDADE', {
      fontSize: '11px',
      color: '#666699',
      fontFamily: 'monospace',
      letterSpacing: 4,
    }).setOrigin(0.5);

    const CARD_W_D = 218;
    const CARD_H_D = 58;
    const CARD_Y_D = SEP_Y + 26;
    const totalW   = CARD_W_D * 3 + 16 * 2;
    const startX   = Math.round((W - totalW) / 2);

    DIFFICULTY_ORDER.forEach((level, i) => {
      const dx = startX + i * (CARD_W_D + 16);
      const entry = this._makeDiffCard(i, dx, CARD_Y_D, CARD_W_D, CARD_H_D, level);
      this._diffCards.push(entry);
    });
  }

  private _buildFooter(): void {
    const W = this.scale.width;
    const SEP_Y = 494;

    const sepG = this.add.graphics();
    sepG.lineStyle(1, C.BORDER, 0.6);
    sepG.lineBetween(20, SEP_Y, W - 20, SEP_Y);

    this._makeFooterBtn(200, 518, 'Voltar', () => {
      if (this._transitioning) return;
      this._transitioning = true;
      this._stopAnim();
      this._stopIdleAnims();
      this.scene.start('MainMenuScene');
    }, false);

    this._makeFooterBtn(576, 518, 'Confirmar', () => this._confirm(), true);
  }

  // ── Factories ────────────────────────────────────────────────────────────────

  private _makeClassCard(
    idx: number, x: number, y: number, w: number, h: number, def: PlayerClassDef,
  ): ClassCardEntry {
    const bg = this.add.rectangle(x, y, w, h, C.CARD_BG).setOrigin(0);

    const border = this.add.graphics();

    // Sprite icon (left side)
    const icon = this.add.sprite(x + 32, y + h / 2, 'player', def.frame)
      .setScale(3)
      .setOrigin(0.5);

    // Name
    const nameText = this.add.text(x + 70, y + 18, def.label, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0);

    // Tag line
    const tag = CLASS_TAGS[def.label] ?? '';
    const tagText = this.add.text(x + 70, y + 42, tag, {
      fontSize: '11px',
      color: '#7777aa',
      fontFamily: 'monospace',
    }).setOrigin(0, 0);

    // Hit area
    const hitZone = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
    hitZone.on('pointerover', () => this._onCardHover(idx, true));
    hitZone.on('pointerout',  () => this._onCardHover(idx, false));
    hitZone.on('pointerdown', () => { this._selectedIdx = idx; this._applyClassSelection(); });

    return { x, y, w, h, bg, border, icon, nameText, tagText, def };
  }

  private _makeDiffCard(
    _idx: number, x: number, y: number, w: number, h: number, level: GlobalDifficultyLevel,
  ): DiffCardEntry {
    const style = DIFF_STYLE[level];
    const cfg   = GLOBAL_DIFFICULTY_CONFIGS[level];

    const bg = this.add.rectangle(x, y, w, h, style.bg).setOrigin(0).setAlpha(0.85);
    const border = this.add.graphics();

    const symbol = this.add.text(x + 16, y + h / 2, style.symbol, {
      fontSize: '18px',
      color: style.textColor,
      fontFamily: 'monospace',
    }).setOrigin(0, 0.5);

    const labelText = this.add.text(x + 40, y + 14, cfg.label, {
      fontSize: '15px',
      color: style.textColor,
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0);

    const desc = this.add.text(x + 40, y + 36, cfg.description, {
      fontSize: '10px',
      color: '#888899',
      fontFamily: 'monospace',
      wordWrap: { width: w - 50 },
    }).setOrigin(0, 0);

    const hitZone = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
    hitZone.on('pointerdown', () => {
      this._selectedDifficulty = level;
      this._applyDiffSelection();
    });

    return { x, y, w, h, bg, border, symbol, labelText, desc, level };
  }

  private _makeFooterBtn(
    cx: number, cy: number, label: string, onClick: () => void, primary: boolean,
  ): void {
    const BW = 160;
    const BH = 36;
    const x  = Math.round(cx - BW / 2);
    const y  = Math.round(cy - BH / 2);

    const bg = this.add.rectangle(x, y, BW, BH, primary ? 0x1a1a4a : 0x0e0e24).setOrigin(0);

    const border = this.add.graphics();
    border.lineStyle(primary ? 2 : 1, primary ? C.GOLD : C.BORDER, 1);
    border.strokeRect(x, y, BW, BH);

    const txt = this.add.text(cx, cy, label, {
      fontSize: '16px',
      color: primary ? '#ffd700' : '#aaaacc',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const hitZone = this.add.zone(x, y, BW, BH).setOrigin(0).setInteractive({ useHandCursor: true });
    hitZone.on('pointerover', () => {
      bg.setFillStyle(primary ? 0x28286a : 0x181830);
      txt.setStyle({ color: '#ffffff' });
    });
    hitZone.on('pointerout', () => {
      bg.setFillStyle(primary ? 0x1a1a4a : 0x0e0e24);
      txt.setStyle({ color: primary ? '#ffd700' : '#aaaacc' });
    });
    hitZone.on('pointerdown', onClick);
  }

  // ── State updaters ───────────────────────────────────────────────────────────

  private _applyClassSelection(): void {
    for (let i = 0; i < this._classCards.length; i++) {
      this._applyClassCardStyle(this._classCards[i], i === this._selectedIdx);
    }
    this._previewName.setText(this._selected.label);
    this._previewDesc.setText(this._selected.description);
    this._startAnim(this._selected.frame);
  }

  private _applyClassCardStyle(entry: ClassCardEntry, selected: boolean): void {
    entry.bg.setFillStyle(selected ? C.CARD_SEL : C.CARD_BG);
    entry.nameText.setStyle({ color: selected ? '#ffd700' : '#ffffff' });

    entry.border.clear();
    if (selected) {
      entry.border.lineStyle(2, C.GOLD, 1);
    } else {
      entry.border.lineStyle(1, C.BORDER, 0.8);
    }
    entry.border.strokeRect(entry.x, entry.y, entry.w, entry.h);
  }

  private _onCardHover(idx: number, hovered: boolean): void {
    const entry = this._classCards[idx];
    const isSelected = idx === this._selectedIdx;

    if (hovered) {
      if (!isSelected) {
        entry.bg.setFillStyle(C.CARD_HOV);
        entry.border.clear();
        entry.border.lineStyle(1, C.GOLD_DIM, 0.7);
        entry.border.strokeRect(entry.x, entry.y, entry.w, entry.h);
      }
      // Update preview to hovered class without changing selection
      this._previewName.setText(entry.def.label);
      this._previewDesc.setText(entry.def.description);
      this._startAnim(entry.def.frame);
    } else {
      if (!isSelected) {
        this._applyClassCardStyle(entry, false);
      }
      // Restore selected class preview
      this._previewName.setText(this._selected.label);
      this._previewDesc.setText(this._selected.description);
      this._startAnim(this._selected.frame);
    }
  }

  private _applyDiffSelection(): void {
    for (const entry of this._diffCards) {
      this._applyDiffCardStyle(entry, entry.level === this._selectedDifficulty);
    }
  }

  private _applyDiffCardStyle(entry: DiffCardEntry, selected: boolean): void {
    const style = DIFF_STYLE[entry.level];
    entry.bg.setAlpha(selected ? 0.95 : 0.7);

    entry.border.clear();
    entry.border.lineStyle(selected ? 2 : 1, selected ? style.borderSel : style.border, 1);
    entry.border.strokeRect(entry.x, entry.y, entry.w, entry.h);
  }

  // ── Animation ────────────────────────────────────────────────────────────────

  private _startIdleAnims(): void {
    this._bobTween = this.tweens.add({
      targets: this._previewSprite,
      y: SPRITE_Y - 3,
      duration: 1400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this._glowTween = this.tweens.add({
      targets: this._previewGlow,
      alpha: { from: 0, to: 0.14 },
      duration: 2200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private _stopIdleAnims(): void {
    this._bobTween?.destroy();
    this._bobTween = undefined;
    this._glowTween?.destroy();
    this._glowTween = undefined;
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

  // ── Graphic helpers ──────────────────────────────────────────────────────────

  private _drawStaticBorder(
    x: number, y: number, w: number, h: number, color: number, thickness: number,
  ): void {
    const g = this.add.graphics();
    g.lineStyle(thickness, color, 0.9);
    g.strokeRect(x, y, w, h);
  }

  private _drawCornerAccents(
    x: number, y: number, w: number, h: number, color: number,
  ): void {
    const L = 10; // accent length in pixels
    const g = this.add.graphics();
    g.lineStyle(2, color, 0.7);

    // Top-left
    g.beginPath(); g.moveTo(x, y + L); g.lineTo(x, y); g.lineTo(x + L, y); g.strokePath();
    // Top-right
    g.beginPath(); g.moveTo(x + w - L, y); g.lineTo(x + w, y); g.lineTo(x + w, y + L); g.strokePath();
    // Bottom-left
    g.beginPath(); g.moveTo(x, y + h - L); g.lineTo(x, y + h); g.lineTo(x + L, y + h); g.strokePath();
    // Bottom-right
    g.beginPath(); g.moveTo(x + w - L, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y + h - L); g.strokePath();
  }

  // ── Core logic (preserved) ───────────────────────────────────────────────────

  private _moveSelection(delta: number): void {
    this._selectedIdx = (this._selectedIdx + delta + PLAYER_CLASSES.length) % PLAYER_CLASSES.length;
    this._applyClassSelection();
  }

  private _confirm(): void {
    if (this._transitioning) return;
    this._transitioning = true;
    this._stopAnim();
    this._stopIdleAnims();
    this.scene.start('GameScene', {
      playerClass: this._selected.id,
      difficulty:  this._selectedDifficulty,
    });
  }
}
