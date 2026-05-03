import * as Phaser from 'phaser';
import { EVENTS } from '../utils/constants';
import type { XPSystem } from './XPSystem';

export interface CombatResult {
  playerDamage: number;
  enemyDamage: number;
  enemyDied: boolean;
  playerDied: boolean;
}

export class CombatSystem {
  private emitter: Phaser.Events.EventEmitter;
  private xpSystem: XPSystem;

  constructor(emitter: Phaser.Events.EventEmitter, xpSystem: XPSystem) {
    this.emitter = emitter;
    this.xpSystem = xpSystem;
  }

  resolve(
    player: { hp: number; maxHp: number; attack: number; xp: number; level: number },
    enemy: { hp: number; maxHp: number; attack: number; xpReward: number; alive: boolean },
  ): CombatResult | null {
    if (!player || !enemy) return null;
    if (!enemy.alive) return null;

    const result: CombatResult = {
      playerDamage: 0,
      enemyDamage: 0,
      enemyDied: false,
      playerDied: false,
    };

    // Player ataca
    result.playerDamage = player.attack;
    enemy.hp = Math.max(0, enemy.hp - player.attack);
    this.emitter.emit(EVENTS.COMBAT_HIT, { attacker: player, defender: enemy, damage: player.attack });

    if (enemy.hp <= 0) {
      enemy.alive = false;
      result.enemyDied = true;
      this.emitter.emit(EVENTS.ENEMY_DIED, enemy);
      this.xpSystem.addXP(player, enemy.xpReward);
      return result;
    }

    // Inimigo contra-ataca
    result.enemyDamage = enemy.attack;
    player.hp = Math.max(0, player.hp - enemy.attack);
    this.emitter.emit(EVENTS.COMBAT_HIT, { attacker: enemy, defender: player, damage: enemy.attack });

    if (player.hp <= 0) {
      result.playerDied = true;
      this.emitter.emit(EVENTS.PLAYER_DIED, player);
    }

    return result;
  }
}
