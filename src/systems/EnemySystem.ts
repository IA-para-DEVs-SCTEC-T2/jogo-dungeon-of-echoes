import * as Phaser from 'phaser';
import { ENEMY, EVENTS, TILE_SIZE } from '../utils/constants';
import type { DungeonGenerator, GridPos } from '../generators/DungeonGenerator';
import type { FloorDifficulty } from '../config/difficulty.config';

export type EnemyState = 'IDLE' | 'CHASING' | 'ATTACKING';

export interface EnemyAttackResult {
  attacked: boolean;
  damage: number;
}

export class EnemySystem {
  id: number;
  hp: number;
  maxHp: number;
  attack: number;
  xpReward: number;
  gridX: number;
  gridY: number;
  alive: boolean;
  state: EnemyState;
  detectionRadius: number;

  /**
   * Nível de agressividade: 0–1.
   * 0.0 = passivo (idle frequente, persegue menos)
   * 1.0 = agressivo (sempre persegue, ataca imediatamente)
   * Definido pelo DifficultyManager no momento do spawn.
   */
  aggressionLevel: number;

  sprite: Phaser.GameObjects.Sprite | null = null;
  hpBar: Phaser.GameObjects.Rectangle | null = null;
  hpBarBg: Phaser.GameObjects.Rectangle | null = null;

  constructor(gridX: number, gridY: number, id: number) {
    this.id              = id;
    this.hp              = ENEMY.HP;
    this.maxHp           = ENEMY.HP;
    this.attack          = ENEMY.ATTACK;
    this.xpReward        = ENEMY.XP_REWARD;
    this.gridX           = gridX;
    this.gridY           = gridY;
    this.alive           = true;
    this.state           = 'IDLE';
    this.detectionRadius = ENEMY.DETECTION_RADIUS;
    this.aggressionLevel = 0.5; // padrão NORMAL
  }

  /**
   * Executa o turno da IA.
   * Comportamento adaptado pelo aggressionLevel:
   * - Alto (>0.7): sempre persegue, raio de detecção ampliado
   * - Baixo (<0.3): comportamento mais aleatório, chance de ficar idle
   */
  update(
    playerGridX: number,
    playerGridY: number,
    dungeon: DungeonGenerator,
    allEnemies: EnemySystem[],
  ): EnemyAttackResult {
    if (!this.alive) return { attacked: false, damage: 0 };

    const dx        = playerGridX - this.gridX;
    const dy        = playerGridY - this.gridY;
    const manhattan = Math.abs(dx) + Math.abs(dy);
    const adjacent  = manhattan === 1;

    // Raio de detecção ampliado para inimigos agressivos
    const effectiveRadius = this.aggressionLevel > 0.7
      ? this.detectionRadius * 1.5
      : this.detectionRadius;

    // Detecção: dentro do raio OU mesma sala (sempre para agressivos)
    const detected = manhattan <= effectiveRadius ||
      (this.aggressionLevel > 0.7) ||
      this._isInSameRoom(playerGridX, playerGridY, dungeon);

    if (detected) {
      this.state = 'CHASING';
    }

    if (this.state === 'IDLE') return { attacked: false, damage: 0 };

    // Inimigos pouco agressivos têm chance de ficar idle mesmo detectando
    if (this.aggressionLevel < 0.3 && Math.random() > this.aggressionLevel + 0.3) {
      return { attacked: false, damage: 0 };
    }

    // Ataca se estiver no tile adjacente ao player
    if (adjacent) {
      this.state = 'ATTACKING';
      return { attacked: true, damage: this.attack };
    }

    // Move em direção ao player
    this._moveToward(playerGridX, playerGridY, dungeon, allEnemies);
    return { attacked: false, damage: 0 };
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

  // ─── Privados ────────────────────────────────────────────────────────────

  private _isInSameRoom(playerX: number, playerY: number, dungeon: DungeonGenerator): boolean {
    for (const room of dungeon.rooms) {
      const enemyIn =
        this.gridX >= room.x && this.gridX < room.x + room.width &&
        this.gridY >= room.y && this.gridY < room.y + room.height;
      const playerIn =
        playerX >= room.x && playerX < room.x + room.width &&
        playerY >= room.y && playerY < room.y + room.height;
      if (enemyIn && playerIn) return true;
    }
    return false;
  }

  private _moveToward(
    playerX: number,
    playerY: number,
    dungeon: DungeonGenerator,
    allEnemies: EnemySystem[],
  ): void {
    const dx = playerX - this.gridX;
    const dy = playerY - this.gridY;

    // Tenta o eixo de maior distância primeiro, depois o outro
    const steps: Array<[number, number]> =
      Math.abs(dx) >= Math.abs(dy)
        ? [[Math.sign(dx) as -1 | 0 | 1, 0], [0, Math.sign(dy) as -1 | 0 | 1]]
        : [[0, Math.sign(dy) as -1 | 0 | 1], [Math.sign(dx) as -1 | 0 | 1, 0]];

    for (const [sx, sy] of steps) {
      if (sx === 0 && sy === 0) continue;
      const nx = this.gridX + sx;
      const ny = this.gridY + sy;
      if (!dungeon.isWalkable(nx, ny)) continue;
      if (allEnemies.some((e) => e !== this && e.alive && e.gridX === nx && e.gridY === ny)) continue;
      this.gridX = nx;
      this.gridY = ny;
      return;
    }
  }
}

export function createEnemies(
  dungeon: DungeonGenerator,
  playerPos: GridPos,
  difficulty?: FloorDifficulty & { aggressionLevel?: number },
): EnemySystem[] {
  const count      = difficulty?.enemyCount ?? ENEMY.COUNT;
  const hpScale    = difficulty?.enemyHpMultiplier  ?? 1;
  const atkScale   = difficulty?.enemyAtkMultiplier ?? 1;
  const aggression = (difficulty as { aggressionLevel?: number } | undefined)?.aggressionLevel ?? 0.5;

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
      const enemy = new EnemySystem(pos.x, pos.y, i);
      enemy.hp             = Math.round(ENEMY.HP     * hpScale);
      enemy.maxHp          = Math.round(ENEMY.HP     * hpScale);
      enemy.attack         = Math.round(ENEMY.ATTACK * atkScale);
      enemy.aggressionLevel = aggression;
      enemies.push(enemy);
    }
  }

  return enemies;
}
