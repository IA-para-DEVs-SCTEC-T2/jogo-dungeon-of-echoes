import * as Phaser from 'phaser';
import { ENEMY, EVENTS, TILE_SIZE, SPRITES, DAWNLIKE_FRAMES } from '../utils/constants';
import type { DungeonGenerator, GridPos } from '../generators/DungeonGenerator';

export class EnemySystem {
  id: number;
  hp: number;
  maxHp: number;
  attack: number;
  xpReward: number;
  gridX: number;
  gridY: number;
  alive: boolean;

  sprite: Phaser.GameObjects.Sprite | null = null;
  hpBar: Phaser.GameObjects.Rectangle | null = null;
  hpBarBg: Phaser.GameObjects.Rectangle | null = null;

  constructor(gridX: number, gridY: number, id: number) {
    this.id = id;
    this.hp = ENEMY.HP;
    this.maxHp = ENEMY.HP;
    this.attack = ENEMY.ATTACK;
    this.xpReward = ENEMY.XP_REWARD;
    this.gridX = gridX;
    this.gridY = gridY;
    this.alive = true;
  }

  takeDamage(amount: number, emitter: Phaser.Events.EventEmitter): void {
    if (!this.alive) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.alive = false;
      emitter.emit(EVENTS.ENEMY_DIED, this);
    }
  }

  getPixelPos(): { x: number; y: number } {
    return {
      x: this.gridX * TILE_SIZE + TILE_SIZE / 2,
      y: this.gridY * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}

export function createEnemies(
  dungeon: DungeonGenerator,
  count: number,
  playerPos: GridPos,
): EnemySystem[] {
  const enemies: EnemySystem[] = [];
  const occupied = new Set<string>();
  occupied.add(`${playerPos.x},${playerPos.y}`);

  for (let i = 0; i < count; i++) {
    let pos: GridPos;
    let attempts = 0;
    do {
      pos = dungeon.getRandomFloorPosition(playerPos);
      attempts++;
    } while (occupied.has(`${pos.x},${pos.y}`) && attempts < 50);

    if (!occupied.has(`${pos.x},${pos.y}`)) {
      occupied.add(`${pos.x},${pos.y}`);
      enemies.push(new EnemySystem(pos.x, pos.y, i));
    }
  }

  return enemies;
}
