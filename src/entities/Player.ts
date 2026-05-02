import * as Phaser from 'phaser';
import { PLAYER, TILE_SIZE, SPRITES, DAWNLIKE_FRAMES, EVENTS } from '../utils/constants';
import type { DungeonGenerator } from '../generators/DungeonGenerator';

export class Player extends Phaser.GameObjects.Sprite {
  // Posição no grid (tile-based)
  gridX: number;
  gridY: number;

  // Atributos RPG
  hp: number;
  maxHp: number;
  xp: number;
  level: number;
  attack: number;

  private _lastMoveTime: number;
  private _emitter: Phaser.Events.EventEmitter;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    const px = gridX * TILE_SIZE + TILE_SIZE / 2;
    const py = gridY * TILE_SIZE + TILE_SIZE / 2;

    super(scene, px, py, SPRITES.PLAYER, DAWNLIKE_FRAMES.PLAYER);

    // Registrar no display list da cena
    scene.add.existing(this);
    this.setDepth(10);

    this.gridX = gridX;
    this.gridY = gridY;

    this.hp = PLAYER.HP;
    this.maxHp = PLAYER.HP;
    this.xp = 0;
    this.level = 1;
    this.attack = PLAYER.ATTACK;

    this._lastMoveTime = 0;
    this._emitter = scene.events;
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

    // Sincronizar posição do sprite
    this.setPosition(
      this.gridX * TILE_SIZE + TILE_SIZE / 2,
      this.gridY * TILE_SIZE + TILE_SIZE / 2,
    );

    this._emitter.emit(EVENTS.PLAYER_MOVED, { x: this.gridX, y: this.gridY });
    return { moved: true, enemy: null };
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this._emitter.emit(EVENTS.PLAYER_DIED, this);
    }
  }

  getPixelPos(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  reset(gridX: number, gridY: number): void {
    this.gridX = gridX;
    this.gridY = gridY;
    this.hp = PLAYER.HP;
    this.maxHp = PLAYER.HP;
    this.xp = 0;
    this.level = 1;
    this.attack = PLAYER.ATTACK;
    this._lastMoveTime = 0;
    this.setPosition(
      gridX * TILE_SIZE + TILE_SIZE / 2,
      gridY * TILE_SIZE + TILE_SIZE / 2,
    );
  }
}
