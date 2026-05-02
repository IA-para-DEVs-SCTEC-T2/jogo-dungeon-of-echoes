import * as Phaser from 'phaser';
import { XP, EVENTS } from '../utils/constants';
import { EventBus } from '../utils/EventBus';

type PlayerLike = {
  xp: number;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  recalcStats?: () => void;
};

export class XPSystem {
  private emitter: Phaser.Events.EventEmitter;

  constructor(emitter: Phaser.Events.EventEmitter) {
    this.emitter = emitter;
  }

  addXP(player: PlayerLike, amount: number): boolean {
    if (!player || typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;

    player.xp += amount;
    let leveled = false;

    while (player.xp >= this._xpToNextLevel(player.level)) {
      this._levelUp(player);
      leveled = true;
    }

    EventBus.emit(EVENTS.PLAYER_XP_CHANGED, {
      xp: player.xp,
      xpNext: this._xpToNextLevel(player.level),
    });

    return leveled;
  }

  getXPToNextLevel(level: number): number {
    return this._xpToNextLevel(level);
  }

  private _xpToNextLevel(level: number): number {
    // Fórmula spec: XP necessário = 100 * N * (N + 1) / 2
    return (XP.PER_LEVEL * level * (level + 1)) / 2;
  }

  private _levelUp(player: PlayerLike): void {
    player.level += 1;
    player.attack += XP.ATTACK_BONUS;

    // Delega recálculo de maxHp para o Player (fórmula CON×5 + nível×3)
    if (player.recalcStats) {
      player.recalcStats();
    } else {
      // Fallback para testes unitários que usam plain objects
      player.maxHp += XP.HP_BONUS;
    }

    player.hp = player.maxHp;

    this.emitter.emit(EVENTS.PLAYER_LEVELED_UP, {
      level: player.level,
      maxHp: player.maxHp,
      attack: player.attack,
    });

    EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: player.hp, maxHp: player.maxHp });
  }
}
