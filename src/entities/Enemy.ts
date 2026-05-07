import { TILE_SIZE } from '../utils/constants';

export class Enemy {
  id: string;
  gridX: number;
  gridY: number;
  hp: number;
  maxHp: number;
  attack: number;
  alive: boolean;

  /** Campos de variante IA (opcional, apenas para inimigos elite) */
  isElite: boolean = false;
  aiName: string | null = null;
  aiDescription: string | null = null;
  aiSpecialAbility: string | null = null;

  constructor(id: string, gridX: number, gridY: number, hp = 10, attack = 3) {
    this.id     = id;
    this.gridX  = gridX;
    this.gridY  = gridY;
    this.hp     = hp;
    this.maxHp  = hp;
    this.attack = attack;
    this.alive  = true;
  }

  /**
   * Retorna o nome de exibição do inimigo.
   * Se for elite com nome IA, usa o nome gerado. Caso contrário, usa nome base.
   */
  getDisplayName(baseName: string = 'Inimigo'): string {
    return this.aiName || baseName;
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
