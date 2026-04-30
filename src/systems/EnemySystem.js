/**
 * EnemySystem.js — Lógica dos inimigos
 * Spec: specs/enemy.spec.md
 *
 * Gerencia criação, estado e atributos dos inimigos.
 * No MVP: inimigos são estáticos (não se movem).
 * Estrutura preparada para receber IA de movimento futura.
 */

import { ENEMY, EVENTS, TILE_SIZE } from '../config/constants.js';

export class EnemySystem {
  /**
   * Cria um inimigo em uma posição do grid.
   *
   * @param {number} gridX
   * @param {number} gridY
   * @param {number} id - Identificador único
   */
  constructor(gridX, gridY, id) {
    this.id = id;

    // Atributos (spec: enemy.spec.md — Atributos)
    this.hp = ENEMY.HP;
    this.maxHp = ENEMY.HP;
    this.attack = ENEMY.ATTACK;
    this.xpReward = ENEMY.XP_REWARD;

    // Posição no grid
    this.gridX = gridX;
    this.gridY = gridY;

    // Estado
    this.alive = true;

    // Referência ao sprite Phaser (definida pela GameScene)
    this.sprite = null;
    this.hpBar = null;
  }

  /**
   * Aplica dano ao inimigo.
   * Regra R4: HP nunca abaixo de 0
   * Regra R5: emite enemy-died quando HP = 0
   *
   * @param {number} amount
   * @param {Phaser.Events.EventEmitter} emitter
   */
  takeDamage(amount, emitter) {
    if (!this.alive) return; // Regra: inimigo morto não recebe dano

    this.hp = Math.max(0, this.hp - amount);

    if (this.hp <= 0) {
      this.alive = false;
      emitter.emit(EVENTS.ENEMY_DIED, this);
    }
  }

  /**
   * Posição em pixels para o sprite Phaser.
   */
  getPixelPos() {
    return {
      x: this.gridX * TILE_SIZE + TILE_SIZE / 2,
      y: this.gridY * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  /**
   * Hook para comportamento futuro de IA.
   * No MVP: não faz nada (inimigos estáticos).
   *
   * @param {DungeonSystem} _dungeon
   * @param {PlayerSystem} _player
   */
  // eslint-disable-next-line no-unused-vars
  updateAI(_dungeon, _player) {
    // TODO (expansão futura): implementar pathfinding A* ou comportamento simples
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * Cria N inimigos em posições FLOOR aleatórias da dungeon.
 * Regra R1: só posiciona em FLOOR
 * Regra R2: dois inimigos não ocupam o mesmo tile
 * Regra R3: não posiciona no tile do player
 *
 * @param {DungeonSystem} dungeon
 * @param {number} count
 * @param {{ x: number, y: number }} playerPos - Posição do player para evitar sobreposição
 * @returns {EnemySystem[]}
 */
export function createEnemies(dungeon, count, playerPos) {
  const enemies = [];
  const occupied = new Set();

  // Marcar posição do player como ocupada
  occupied.add(`${playerPos.x},${playerPos.y}`);

  for (let i = 0; i < count; i++) {
    let pos;
    let attempts = 0;

    // Tentar encontrar posição livre
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
