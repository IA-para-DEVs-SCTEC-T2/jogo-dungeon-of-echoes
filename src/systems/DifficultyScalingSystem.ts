import { getFloorDifficulty, type FloorDifficulty } from '../config/difficulty.config';

export type { FloorDifficulty };

export class DifficultyScalingSystem {
  getFloorDifficulty(floor: number): FloorDifficulty {
    return getFloorDifficulty(floor);
  }

  scaleEnemyStats(
    base: { hp: number; attack: number },
    floor: number,
  ): { hp: number; attack: number } {
    const diff = getFloorDifficulty(floor);
    return {
      hp:     Math.round(base.hp     * diff.enemyHpMultiplier),
      attack: Math.round(base.attack * diff.enemyAtkMultiplier),
    };
  }
}
