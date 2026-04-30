/**
 * CombatSystem.js — Sistema de combate
 * Spec: specs/combat.spec.md
 *
 * Resolve ataques entre player e inimigos.
 * Acionado quando player tenta mover para tile com inimigo.
 */

import { EVENTS } from '../config/constants.js';

export class CombatSystem {
  /**
   * @param {Phaser.Events.EventEmitter} emitter - Para emitir eventos de combate
   * @param {XPSystem} xpSystem - Para conceder XP após morte de inimigo
   */
  constructor(emitter, xpSystem) {
    this.emitter = emitter;
    this.xpSystem = xpSystem;
  }

  /**
   * Resolve um ataque do player contra um inimigo.
   * Regra R2: player ataca primeiro, inimigo contra-ataca se sobreviver
   * Regra R4: inimigo morto não contra-ataca
   * Regra R5: player permanece no tile atual (não se move)
   *
   * @param {object} player  - Objeto player
   * @param {object} enemy   - Objeto enemy
   * @returns {object} resultado { playerDamage, enemyDamage, enemyDied, playerDied }
   */
  resolve(player, enemy) {
    // Validação
    if (!player || !enemy) {
      console.error('[CombatSystem] Referência nula para attacker/defender');
      return null;
    }

    // Inimigo morto — combate não ocorre (Regra R4 / cenário 4)
    if (!enemy.alive) {
      return null;
    }

    const result = {
      playerDamage: 0,
      enemyDamage: 0,
      enemyDied: false,
      playerDied: false,
    };

    // 1. Player ataca inimigo
    const playerDamage = player.attack;
    result.playerDamage = playerDamage;
    enemy.hp = Math.max(0, enemy.hp - playerDamage);

    this.emitter.emit(EVENTS.COMBAT_HIT, {
      attacker: player,
      defender: enemy,
      damage: playerDamage,
    });

    // Verificar se inimigo morreu
    if (enemy.hp <= 0) {
      enemy.alive = false;
      result.enemyDied = true;
      this.emitter.emit(EVENTS.ENEMY_DIED, enemy);

      // Conceder XP ao player
      this.xpSystem.addXP(player, enemy.xpReward);
      return result;
    }

    // 2. Inimigo contra-ataca (só se ainda vivo)
    const enemyDamage = enemy.attack;
    result.enemyDamage = enemyDamage;
    player.hp = Math.max(0, player.hp - enemyDamage);

    this.emitter.emit(EVENTS.COMBAT_HIT, {
      attacker: enemy,
      defender: player,
      damage: enemyDamage,
    });

    // Verificar se player morreu
    if (player.hp <= 0) {
      result.playerDied = true;
      this.emitter.emit(EVENTS.PLAYER_DIED, player);
    }

    return result;
  }
}
