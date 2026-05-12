import * as Phaser from 'phaser';
import { SPRITES, DAWNLIKE_FRAMES, UI } from '../utils/constants';
import type { ItemType } from '../entities/Item';

const SLOT_COUNT = 9;
const SLOT_SIZE  = 20;
const SLOT_GAP   = 3;
const DEPTH      = 200;
const PANEL_H    = SLOT_SIZE + 16;

type SlotGraphics = {
  bg:   Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Sprite;
};

export class ActionBarPanel {
  private _root:  Phaser.GameObjects.Container;
  private _slots: SlotGraphics[] = [];

  constructor(scene: Phaser.Scene) {
    const screenW = scene.scale.width;
    const screenH = scene.scale.height;
    const totalW  = SLOT_COUNT * (SLOT_SIZE + SLOT_GAP) - SLOT_GAP;
    const startX  = Math.floor((screenW - totalW) / 2);
    const barY    = screenH - PANEL_H;

    this._root = scene.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH);

    // Fundo compacto apenas para a barra (largura total da tela)
    const bg = scene.add
      .rectangle(0, barY, screenW, PANEL_H, 0x111122, 0.90)
      .setOrigin(0, 0);
    const border = scene.add
      .rectangle(0, barY, screenW, 1, 0x334466, 1.0)
      .setOrigin(0, 0);

    this._root.add([bg, border]);

    for (let i = 0; i < SLOT_COUNT; i++) {
      const x = startX + i * (SLOT_SIZE + SLOT_GAP);
      const y = barY + Math.floor((PANEL_H - SLOT_SIZE) / 2);

      const slotBg = scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, 0x222244)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x4455aa);

      const icon = scene.add
        .sprite(x + SLOT_SIZE / 2, y + SLOT_SIZE / 2, SPRITES.POTION, 0)
        .setVisible(false)
        .setScale(0.8);

      const key = scene.add.text(x + 2, y + 2, String(i + 1), {
        fontSize: '6px', color: '#667799', fontFamily: 'monospace',
      });

      this._root.add([slotBg, icon, key]);
      this._slots.push({ bg: slotBg, icon });
    }
  }

  getHeight(): number {
    return PANEL_H;
  }

  setItem(slotIndex: number, type: ItemType): void {
    const slot = this._slots[slotIndex];
    if (!slot) return;
    const { texture, frame } = this._getItemVisual(type);
    slot.icon.setTexture(texture, frame).setVisible(true);
    slot.bg.setStrokeStyle(1, 0xffd700);
  }

  clearItem(slotIndex: number): void {
    const slot = this._slots[slotIndex];
    if (!slot) return;
    slot.icon.setVisible(false);
    slot.bg.setStrokeStyle(1, 0x4455aa);
  }

  private _getItemVisual(type: ItemType): { texture: string; frame: number } {
    switch (type) {
      case 'potion_heal_light':
      case 'potion_heal':
      case 'potion_heal_high':  return { texture: SPRITES.POTION, frame: DAWNLIKE_FRAMES.POTION_HEAL };
      case 'potion_mana_light':
      case 'potion_mana':
      case 'potion_mana_high':  return { texture: SPRITES.POTION, frame: DAWNLIKE_FRAMES.POTION_MANA };
      case 'gold':              return { texture: SPRITES.MONEY,  frame: DAWNLIKE_FRAMES.GOLD };
    }
  }
}
