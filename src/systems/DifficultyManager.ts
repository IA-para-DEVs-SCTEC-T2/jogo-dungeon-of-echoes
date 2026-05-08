/**
 * DifficultyManager.ts — Gerenciador de dificuldade adaptativa
 * Fase 5: IA Adaptativa
 *
 * Combina a dificuldade estática por andar (DifficultyScalingSystem)
 * com ajuste dinâmico baseado nas métricas do jogador (PlayerMetrics).
 *
 * Usa "histerese" para evitar mudanças bruscas:
 * a dificuldade só muda após o score ultrapassar o limiar por HYSTERESIS_CYCLES ciclos.
 */

import { getFloorDifficulty, type FloorDifficulty } from '../config/difficulty.config';
import type { PlayerMetrics } from './PlayerMetrics';

export enum DifficultyLevel {
  EASY   = 'EASY',
  NORMAL = 'NORMAL',
  HARD   = 'HARD',
}

export interface AdaptiveDifficulty extends FloorDifficulty {
  level:            DifficultyLevel;
  aggressionLevel:  number;   // 0–1: controla comportamento da IA dos inimigos
  narrativeHint:    string;   // Mensagem sutil para o jogador
}

// Limiares de score para mudança de dificuldade
const SCORE_EASY_THRESHOLD   = -20;
const SCORE_HARD_THRESHOLD   =  20;

// Histerese: quantos ciclos o score precisa manter o limiar antes de mudar
const HYSTERESIS_CYCLES = 3;

// Modificadores por nível de dificuldade
const MODIFIERS: Record<DifficultyLevel, { hp: number; atk: number; countDelta: number; aggression: number }> = {
  [DifficultyLevel.EASY]:   { hp: 0.80, atk: 0.80, countDelta: -1, aggression: 0.2 },
  [DifficultyLevel.NORMAL]: { hp: 1.00, atk: 1.00, countDelta:  0, aggression: 0.5 },
  [DifficultyLevel.HARD]:   { hp: 1.30, atk: 1.20, countDelta: +2, aggression: 0.9 },
};

const NARRATIVE_HINTS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]:   'Você sente que está ficando mais forte...',
  [DifficultyLevel.NORMAL]: '',
  [DifficultyLevel.HARD]:   'As criaturas parecem mais hostis...',
};

export class DifficultyManager {
  private _currentLevel: DifficultyLevel = DifficultyLevel.NORMAL;

  // Contadores de histerese
  private _cyclesBelow = 0;  // ciclos com score < EASY_THRESHOLD
  private _cyclesAbove = 0;  // ciclos com score > HARD_THRESHOLD

  // Turno do último recálculo
  private _lastRecalcTurn = 0;
  private readonly _recalcInterval = 10; // recalcular a cada 10 turnos

  get currentLevel(): DifficultyLevel {
    return this._currentLevel;
  }

  /**
   * Atualiza o nível de dificuldade com base nas métricas do jogador.
   * Deve ser chamado a cada turno — internamente controla o intervalo.
   *
   * @returns true se o nível mudou
   */
  update(metrics: PlayerMetrics): boolean {
    const turn = metrics.turnsSurvived;

    // Só recalcula a cada N turnos
    if (turn - this._lastRecalcTurn < this._recalcInterval) return false;
    this._lastRecalcTurn = turn;

    const score = metrics.getRecentPerformanceScore();
    const prev  = this._currentLevel;

    // Atualizar contadores de histerese
    if (score < SCORE_EASY_THRESHOLD) {
      this._cyclesBelow++;
      this._cyclesAbove = 0;
    } else if (score > SCORE_HARD_THRESHOLD) {
      this._cyclesAbove++;
      this._cyclesBelow = 0;
    } else {
      this._cyclesBelow = 0;
      this._cyclesAbove = 0;
    }

    // Mudar dificuldade apenas após histerese atingida
    if (this._cyclesBelow >= HYSTERESIS_CYCLES) {
      this._currentLevel = DifficultyLevel.EASY;
      this._cyclesBelow  = 0;
    } else if (this._cyclesAbove >= HYSTERESIS_CYCLES) {
      this._currentLevel = DifficultyLevel.HARD;
      this._cyclesAbove  = 0;
    } else if (this._cyclesBelow === 0 && this._cyclesAbove === 0) {
      this._currentLevel = DifficultyLevel.NORMAL;
    }

    return this._currentLevel !== prev;
  }

  /**
   * Retorna a dificuldade adaptativa para o andar atual.
   * Combina a tabela estática de andares com os modificadores adaptativos.
   */
  getAdaptiveDifficulty(floor: number): AdaptiveDifficulty {
    const base = getFloorDifficulty(floor);
    const mod  = MODIFIERS[this._currentLevel];

    return {
      ...base,
      enemyHpMultiplier:  base.enemyHpMultiplier  * mod.hp,
      enemyAtkMultiplier: base.enemyAtkMultiplier * mod.atk,
      enemyCount:         Math.max(1, base.enemyCount + mod.countDelta),
      level:              this._currentLevel,
      aggressionLevel:    mod.aggression,
      narrativeHint:      NARRATIVE_HINTS[this._currentLevel],
    };
  }

  /**
   * Reseta para o estado inicial (nova sessão).
   */
  reset(): void {
    this._currentLevel = DifficultyLevel.NORMAL;
    this._cyclesBelow  = 0;
    this._cyclesAbove  = 0;
    this._lastRecalcTurn = 0;
  }
}
