import * as Phaser from 'phaser';
import { XP, EVENTS } from '../utils/constants';

export class XPSystem {
  private emitter: Phaser.Events.EventEmitter;

  constructor(emitter: Phaser.Events.EventEmitter) {
    this.emitter = emitter;
  }

  addXP(
    player: { xp: number; level: number; maxHp: number; hp: number; attack: number },
    amount: number,
  ): boolean {
    if (!player || typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;

    player.xp += amount;
    let leveled = false;

    while (player.xp >= this._xpToNextLevel(player.level)) {
      this._levelUp(player);
      leveled = true;
    }

    return leveled;
  }

  getXPToNextLevel(level: number): number {
    return this._xpToNextLevel(level);
  }

  private _xpToNextLevel(level: number): number {
    let total = 0;
    for (let i = 1; i <= level; i++) {
      total += i * XP.PER_LEVEL;
    }
    return total;
  }

  private _levelUp(player: { level: number; maxHp: number; hp: number; attack: number }): void {
    player.level += 1;
    player.maxHp += XP.HP_BONUS;
    player.attack += XP.ATTACK_BONUS;
    player.hp = player.maxHp;

    this.emitter.emit(EVENTS.PLAYER_LEVELED_UP, {
      level: player.level,
      maxHp: player.maxHp,
      attack: player.attack,
    });
  }
}
