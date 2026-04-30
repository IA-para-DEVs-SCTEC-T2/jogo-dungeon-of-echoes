/**
 * XPSystem.js — Sistema de experiência e progressão de nível
 * Spec: specs/xp.spec.md
 *
 * Responsabilidade única: calcular ganho de XP e level ups.
 * Não conhece Phaser — opera apenas sobre o objeto player.
 */

import { XP, EVENTS } from '../config/constants.js';

export class XPSystem {
  /**
   * @param {Phaser.Events.EventEmitter} emitter - EventEmitter para emitir eventos
   */
  constructor(emitter) {
    this.emitter = emitter;
  }

  /**
   * Adiciona XP ao player e processa level ups.
   * Regra R1: valores <= 0 ou inválidos são ignorados
   * Regra R3: múltiplos level ups são processados em sequência
   *
   * @param {object} player - Objeto player com xp, level, maxHp, hp, attack
   * @param {number} amount - Quantidade de XP a adicionar
   */
  addXP(player, amount) {
    // Validação de entrada
    if (!player || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return;
    }

    player.xp += amount;

    // Processar level ups em loop (suporta múltiplos de uma vez)
    let leveled = false;
    while (player.xp >= this._xpToNextLevel(player.level)) {
      this._levelUp(player);
      leveled = true;
    }

    return leveled;
  }

  /**
   * XP necessário para o próximo nível.
   * Fórmula: level * XP_PER_LEVEL (acumulativo)
   */
  _xpToNextLevel(level) {
    // XP acumulado necessário para atingir o próximo nível
    // Nível 1→2: 100, 2→3: 300 (100+200), 3→4: 600 (100+200+300)
    let total = 0;
    for (let i = 1; i <= level; i++) {
      total += i * XP.PER_LEVEL;
    }
    return total;
  }

  /** Executa o level up no player */
  _levelUp(player) {
    player.level += 1;
    player.maxHp += XP.HP_BONUS;
    player.attack += XP.ATTACK_BONUS;
    player.hp = player.maxHp; // Restaura HP ao máximo

    // Emite evento com dados do novo nível
    this.emitter.emit(EVENTS.PLAYER_LEVELED_UP, {
      level: player.level,
      maxHp: player.maxHp,
      attack: player.attack,
    });
  }

  /**
   * Retorna o XP necessário para o próximo nível (público, para HUD).
   */
  getXPToNextLevel(level) {
    return this._xpToNextLevel(level);
  }
}
