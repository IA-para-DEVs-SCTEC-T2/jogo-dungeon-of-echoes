/**
 * PlayerSystem.js — Lógica do jogador
 * Spec: specs/player.spec.md
 *
 * Gerencia estado, movimento e atributos do player.
 * O sprite Phaser é criado e gerenciado pela GameScene.
 */

import { PLAYER, EVENTS, TILE_SIZE } from '../config/constants.js';

export class PlayerSystem {
  /**
   * @param {Phaser.Events.EventEmitter} emitter
   */
  constructor(emitter) {
    this.emitter = emitter;

    // Atributos (spec: player.spec.md — Atributos)
    this.hp = PLAYER.HP;
    this.maxHp = PLAYER.HP;
    this.xp = 0;
    this.level = 1;
    this.attack = PLAYER.ATTACK;

    // Posição no grid
    this.gridX = 0;
    this.gridY = 0;

    // Controle de cooldown de movimento
    this._lastMoveTime = 0;
  }

  /**
   * Tenta mover o player na direção dada.
   * Regra R1: só move para FLOOR
   * Regra R2: bloqueado por WALL
   * Regra R4: bloqueado por inimigo → retorna inimigo para combate
   * Regra R5: não sai dos limites
   *
   * @param {number} dx - Delta X (-1, 0, 1)
   * @param {number} dy - Delta Y (-1, 0, 1)
   * @param {DungeonSystem} dungeon
   * @param {EnemySystem[]} enemies
   * @param {number} now - Timestamp atual (para cooldown)
   * @returns {{ moved: boolean, enemy: object|null }}
   */
  tryMove(dx, dy, dungeon, enemies, now) {
    // Cooldown de movimento
    if (now - this._lastMoveTime < PLAYER.MOVE_COOLDOWN) {
      return { moved: false, enemy: null };
    }

    const targetX = this.gridX + dx;
    const targetY = this.gridY + dy;

    // Verificar limites e tipo de tile
    if (!dungeon.isWalkable(targetX, targetY)) {
      return { moved: false, enemy: null };
    }

    // Verificar se há inimigo vivo no tile destino
    const enemyAtTarget = enemies.find(
      (e) => e.alive && e.gridX === targetX && e.gridY === targetY
    );

    if (enemyAtTarget) {
      // Retorna o inimigo para que a cena inicie o combate
      return { moved: false, enemy: enemyAtTarget };
    }

    // Mover
    this.gridX = targetX;
    this.gridY = targetY;
    this._lastMoveTime = now;

    this.emitter.emit(EVENTS.PLAYER_MOVED, { x: this.gridX, y: this.gridY });
    return { moved: true, enemy: null };
  }

  /**
   * Aplica dano ao player.
   * Regra R7: HP nunca abaixo de 0
   * Regra R8: emite player-died quando HP = 0
   */
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.emitter.emit(EVENTS.PLAYER_DIED, this);
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
   * Reseta o player para o estado inicial.
   * Usado ao reiniciar o jogo.
   */
  reset(gridX, gridY) {
    this.hp = PLAYER.HP;
    this.maxHp = PLAYER.HP;
    this.xp = 0;
    this.level = 1;
    this.attack = PLAYER.ATTACK;
    this.gridX = gridX;
    this.gridY = gridY;
    this._lastMoveTime = 0;
  }
}
