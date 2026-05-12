import * as Phaser from 'phaser';
import { TILE_SIZE, TILE } from '../utils/constants';
import type { SpellDef, Direction } from '../types/spells';
import type { DungeonGenerator } from '../generators/DungeonGenerator';
import type { Enemy } from './Enemy';

const HIT_RADIUS = TILE_SIZE * 0.7;

export class Projectile extends Phaser.GameObjects.Sprite {
  readonly damage: number;
  readonly spell: SpellDef;
  private _vx: number;
  private _vy: number;
  private _alive = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spell: SpellDef,
    dir: Direction,
  ) {
    super(scene, x, y, 'effect0', 0);
    scene.add.existing(this);
    this.setDepth(8);

    this.spell  = spell;
    this.damage = spell.damage;

    const speed = spell.projectileSpeed;
    this._vx = dir === 'right' ? speed : dir === 'left' ? -speed : 0;
    this._vy = dir === 'down'  ? speed : dir === 'up'   ? -speed : 0;

    if (scene.anims.exists(spell.animKey)) {
      this.play(spell.animKey);
    }
  }

  updateMovement(dungeon: DungeonGenerator): void {
    if (!this._alive) return;

    this.x += this._vx;
    this.y += this._vy;

    const tileX = Math.floor(this.x / TILE_SIZE);
    const tileY = Math.floor(this.y / TILE_SIZE);

    const outOfBounds =
      tileX < 0 || tileY < 0 ||
      tileY >= dungeon.grid.length ||
      tileX >= (dungeon.grid[0]?.length ?? 0);

    if (outOfBounds || dungeon.grid[tileY]?.[tileX] === TILE.WALL) {
      this._explode();
    }
  }

  checkEnemyHit(enemy: Enemy): boolean {
    if (!this._alive || !enemy.alive || !enemy.sprite) return false;
    const dx = Math.abs(this.x - enemy.sprite.x);
    const dy = Math.abs(this.y - enemy.sprite.y);
    if (dx < HIT_RADIUS && dy < HIT_RADIUS) {
      this._explode();
      return true;
    }
    return false;
  }

  isAlive(): boolean {
    return this._alive;
  }

  private _explode(): void {
    this._alive = false;
    this._vx = 0;
    this._vy = 0;
    if (this.scene?.anims.exists(this.spell.impactAnimKey)) {
      this.play(this.spell.impactAnimKey);
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (this.active) this.destroy();
      });
    } else {
      this.destroy();
    }
  }
}
