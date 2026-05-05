import { TILE_SIZE } from '../utils/constants';

export class Enemy {
  id: string;
  gridX: number;
  gridY: number;
  hp: number;
  maxHp: number;
  attack: number;
  alive: boolean;

  constructor(id: string, gridX: number, gridY: number, hp = 10, attack = 3) {
    this.id     = id;
    this.gridX  = gridX;
    this.gridY  = gridY;
    this.hp     = hp;
    this.maxHp  = hp;
    this.attack = attack;
    this.alive  = true;
  }

  takeDamage(amount: number): void {
    if (!this.alive) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  getPixelPos(): { x: number; y: number } {
    return {
      x: this.gridX * TILE_SIZE + TILE_SIZE / 2,
      y: this.gridY * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}
