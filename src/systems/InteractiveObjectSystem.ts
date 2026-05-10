import * as Phaser from 'phaser';
import { TILE_SIZE } from '../utils/constants';
import { LAYER_UI_LABELS } from '../config/sprites-config';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { NPCInstanceDef, InteractiveObjectDef } from '../types/town';
import type { NPCController } from './NPCController';

export class InteractiveObjectSystem {
  private _npcController: NPCController | null = null;
  private _promptText:    Phaser.GameObjects.Text | null = null;
  private _tKey:          Phaser.Input.Keyboard.Key | null = null;
  private _currentTarget: NPCInstanceDef | null = null;

  /**
   * Inicializa o sistema registrando o NPCController e criando o texto de prompt.
   */
  load(
    scene: Phaser.Scene,
    _objects: InteractiveObjectDef[],
    npcController: NPCController,
  ): void {
    this._npcController = npcController;

    this._promptText = scene.add
      .text(0, 0, '[T] Interagir', {
        fontSize:        '7px',
        color:           '#ffffff',
        fontFamily:      'monospace',
        backgroundColor: '#000000',
        padding:         { x: 3, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(LAYER_UI_LABELS)
      .setScrollFactor(1)
      .setVisible(false);

    this._tKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);
  }

  /**
   * Deve ser chamado uma vez por frame a partir de GameScene.update().
   */
  update(playerGridX: number, playerGridY: number): void {
    this._checkProximity(playerGridX, playerGridY);

    if (this._currentTarget && Phaser.Input.Keyboard.JustDown(this._tKey!)) {
      this._interact();
    }
  }

  /**
   * Para NPCs com houseBounds: player deve estar DENTRO do edifício.
   * Para NPCs sem houseBounds: usa adjacência ortogonal clássica.
   */
  private _checkProximity(px: number, py: number): void {
    if (!this._npcController || !this._promptText) return;

    let found: NPCInstanceDef | null = null;

    // Iterar sobre todos os NPCs e checar condição de proximidade
    const allNPCs = this._npcController.getAllNPCs();
    for (const npc of allNPCs) {
      if (this._canInteract(npc, px, py)) {
        found = npc;
        break;
      }
    }

    this._currentTarget = found;

    if (found) {
      const wx = found.gridX * TILE_SIZE + TILE_SIZE / 2;
      const wy = found.gridY * TILE_SIZE;
      this._promptText.setPosition(wx, wy).setVisible(true);
    } else {
      this._promptText.setVisible(false);
    }
  }

  private _canInteract(npc: NPCInstanceDef, px: number, py: number): boolean {
    if (npc.houseBounds) {
      const b = npc.houseBounds;
      return px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h;
    }
    const range = npc.interactRange ?? 1;
    const dx = Math.abs(npc.gridX - px);
    const dy = Math.abs(npc.gridY - py);
    return dx + dy <= range && dx + dy > 0;
  }

  private _interact(): void {
    const npc = this._currentTarget;
    if (!npc?.interaction) return;

    if (npc.interaction.type === 'shop') {
      EventBus.emit(EVENTS.SHOP_OPENED, { npcId: npc.id, shopId: 'merchant' });
    } else if (npc.interaction.type === 'menu') {
      EventBus.emit(EVENTS.DIALOG_OPENED, {
        npcId: npc.id ?? npc.name,
        title: npc.name,
        options: npc.interaction.menuOptions ?? [],
      });
    } else {
      EventBus.emit(EVENTS.UI_LOG, `[${npc.name}]: ${npc.interaction.message}`);
    }
  }

  destroy(): void {
    this._promptText?.destroy();
    this._promptText    = null;
    this._currentTarget = null;
    this._npcController = null;
    this._tKey = null;
  }
}
