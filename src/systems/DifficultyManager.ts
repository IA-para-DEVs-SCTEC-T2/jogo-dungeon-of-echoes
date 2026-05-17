import { getFloorDifficulty, type FloorDifficulty } from '../config/difficulty.config';
import {
  GLOBAL_DIFFICULTY_CONFIGS,
  type GlobalDifficultyConfig,
  type GlobalDifficultyLevel,
  type LootModifiers,
} from '../config/global-difficulty.config';
import type { PlayerMetrics } from './PlayerMetrics';

export enum DifficultyLevel {
  EASY   = 'EASY',
  NORMAL = 'NORMAL',
  HARD   = 'HARD',
}

export interface AdaptiveDifficulty extends FloorDifficulty {
  level:            DifficultyLevel;
  aggressionLevel:  number;
  narrativeHint:    string;
  lootModifiers:    LootModifiers;
}

export interface DifficultySnapshot {
  globalLevel:         GlobalDifficultyLevel;
  adaptiveLevel:       DifficultyLevel;
  effectiveHpMult:     number;
  effectiveAtkMult:    number;
  effectiveEnemyCount: number;
  lootModifiers:       LootModifiers;
}

const SCORE_EASY_THRESHOLD   = -20;
const SCORE_HARD_THRESHOLD   =  20;
const HYSTERESIS_CYCLES = 3;

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
  private _currentLevel: DifficultyLevel    = DifficultyLevel.NORMAL;
  private _globalConfig: GlobalDifficultyConfig = GLOBAL_DIFFICULTY_CONFIGS['medium'];

  private _cyclesBelow = 0;
  private _cyclesAbove = 0;
  private _lastRecalcTurn = 0;
  private readonly _recalcInterval = 10;

  get currentLevel(): DifficultyLevel {
    return this._currentLevel;
  }

  get globalConfig(): GlobalDifficultyConfig {
    return this._globalConfig;
  }

  /**
   * Define a dificuldade global escolhida pelo jogador.
   * Deve ser chamado antes do primeiro spawn (em GameScene.create).
   */
  setGlobalDifficulty(level: GlobalDifficultyLevel): void {
    this._globalConfig = GLOBAL_DIFFICULTY_CONFIGS[level];
    // Resetar contadores adaptativos para a nova run
    this._cyclesBelow = 0;
    this._cyclesAbove = 0;
    this._lastRecalcTurn = 0;
    this._currentLevel = DifficultyLevel.NORMAL;
  }

  update(metrics: PlayerMetrics): boolean {
    const turn = metrics.turnsSurvived;
    if (turn - this._lastRecalcTurn < this._recalcInterval) return false;
    this._lastRecalcTurn = turn;

    const score = metrics.getRecentPerformanceScore();
    const prev  = this._currentLevel;

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

  getAdaptiveDifficulty(floor: number): AdaptiveDifficulty {
    const base = getFloorDifficulty(floor);
    const mod  = MODIFIERS[this._currentLevel];
    const g    = this._globalConfig;

    // Respeitar overrideEnemyCount (encounters fixos/scripted)
    const enemyCount = base.overrideEnemyCount !== undefined
      ? base.overrideEnemyCount
      : Math.max(1, base.enemyCount + mod.countDelta + g.enemyCountDelta);

    return {
      ...base,
      enemyHpMultiplier:  base.enemyHpMultiplier  * mod.hp  * g.enemyHpMultiplier,
      enemyAtkMultiplier: base.enemyAtkMultiplier * mod.atk * g.enemyAtkMultiplier,
      enemyCount,
      level:           this._currentLevel,
      aggressionLevel: mod.aggression,
      narrativeHint:   NARRATIVE_HINTS[this._currentLevel],
      lootModifiers:   g.lootModifiers,
    };
  }

  /** Snapshot do estado atual para debug/log. */
  get snapshot(): DifficultySnapshot {
    const adaptive = this.getAdaptiveDifficulty(1); // floor 1 como referência
    return {
      globalLevel:         this._globalConfig.level,
      adaptiveLevel:       this._currentLevel,
      effectiveHpMult:     adaptive.enemyHpMultiplier,
      effectiveAtkMult:    adaptive.enemyAtkMultiplier,
      effectiveEnemyCount: adaptive.enemyCount,
      lootModifiers:       this._globalConfig.lootModifiers,
    };
  }

  reset(): void {
    // Não reseta _globalConfig — ela persiste durante toda a run
    this._currentLevel   = DifficultyLevel.NORMAL;
    this._cyclesBelow    = 0;
    this._cyclesAbove    = 0;
    this._lastRecalcTurn = 0;
  }
}
