import * as Phaser from 'phaser';
import { PLAYER, TILE_SIZE, SPRITES, DAWNLIKE_FRAMES, EVENTS, BASE_STATS } from '../utils/constants';
import { EventBus } from '../utils/EventBus';
import { InventorySystem } from '../systems/InventorySystem';
import type { DungeonGenerator } from '../generators/DungeonGenerator';

export class Player extends Phaser.GameObjects.Sprite {
  // Posição no grid (tile-based)
  gridX: number;
  gridY: number;

  // Atributos base RPG
  str: number;
  intel: number;  // 'int' é palavra reservada em TS
  dex: number;
  con: number;
  wis: number;
  cha: number;

  // Atributos derivados
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  xp: number;
  level: number;
  attack: number;

  // Inventário e identificação de itens
  inventory: InventorySystem;
  identifiedItems: Record<string, boolean>;

  private _lastMoveTime: number;
  private _emitter: Phaser.Events.EventEmitter;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    const px = gridX * TILE_SIZE + TILE_SIZE / 2;
    const py = gridY * TILE_SIZE + TILE_SIZE / 2;

    super(scene, px, py, SPRITES.PLAYER, DAWNLIKE_FRAMES.PLAYER);

    scene.add.existing(this);
    this.setDepth(10);

    this.gridX = gridX;
    this.gridY = gridY;

    // Atributos base
    this.str   = BASE_STATS.STR;
    this.intel = BASE_STATS.INT;
    this.dex   = BASE_STATS.DEX;
    this.con   = BASE_STATS.CON;
    this.wis   = BASE_STATS.WIS;
    this.cha   = BASE_STATS.CHA;

    this.level  = 1;
    this.xp     = 0;
    this.attack = PLAYER.ATTACK;

    // Derivados via fórmulas da spec
    this.maxHp   = this.con * 5 + this.level * 3;
    this.hp      = this.maxHp;
    this.maxMana = this.wis * 4 + this.intel * 2;
    this.mana    = this.maxMana;

    this._lastMoveTime = 0;
    this._emitter = scene.events;

    // Inventário e identificação
    this.inventory       = new InventorySystem();
    this.identifiedItems = {};
  }

  /** Recalcula maxHp e maxMana a partir dos atributos base e nível atual. */
  recalcStats(): void {
    this.maxHp   = this.con * 5 + this.level * 3;
    this.maxMana = this.wis * 4 + this.intel * 2;
  }

  tryMove(
    dx: number,
    dy: number,
    dungeon: DungeonGenerator,
    enemies: Array<{ alive: boolean; gridX: number; gridY: number }>,
    now: number,
  ): { moved: boolean; enemy: { alive: boolean; gridX: number; gridY: number } | null } {
    if (now - this._lastMoveTime < PLAYER.MOVE_COOLDOWN) {
      return { moved: false, enemy: null };
    }

    const targetX = this.gridX + dx;
    const targetY = this.gridY + dy;

    if (!dungeon.isWalkable(targetX, targetY)) {
      return { moved: false, enemy: null };
    }

    const enemyAtTarget = enemies.find(
      (e) => e.alive && e.gridX === targetX && e.gridY === targetY,
    ) ?? null;

    if (enemyAtTarget) {
      return { moved: false, enemy: enemyAtTarget };
    }

    this.gridX = targetX;
    this.gridY = targetY;
    this._lastMoveTime = now;

    this.setPosition(
      this.gridX * TILE_SIZE + TILE_SIZE / 2,
      this.gridY * TILE_SIZE + TILE_SIZE / 2,
    );

    this._emitter.emit(EVENTS.PLAYER_MOVED, { x: this.gridX, y: this.gridY });
    return { moved: true, enemy: null };
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: this.hp, maxHp: this.maxHp });
    if (this.hp <= 0) {
      this._emitter.emit(EVENTS.PLAYER_DIED, this);
    }
  }

  useMana(amount: number): boolean {
    if (this.mana < amount) return false;
    this.mana = Math.max(0, this.mana - amount);
    EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: this.mana, maxMana: this.maxMana });
    return true;
  }

  getPixelPos(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  reset(gridX: number, gridY: number): void {
    this.gridX = gridX;
    this.gridY = gridY;
    this.level  = 1;
    this.xp     = 0;
    this.attack = PLAYER.ATTACK;

    this.recalcStats();
    this.hp   = this.maxHp;
    this.mana = this.maxMana;

    this._lastMoveTime = 0;

    // Resetar inventário e identificação para nova partida
    this.inventory.reset();
    this.identifiedItems = {};

    this.setPosition(
      gridX * TILE_SIZE + TILE_SIZE / 2,
      gridY * TILE_SIZE + TILE_SIZE / 2,
    );
  }
}
