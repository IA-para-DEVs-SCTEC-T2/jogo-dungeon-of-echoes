export interface FloorDifficulty {
  floor: number;
  enemyHpMultiplier: number;
  enemyAtkMultiplier: number;
  enemyCount: number;
  lootQualityBonus: number;
}

export const FLOOR_DIFFICULTY_TABLE: Record<number, FloorDifficulty> = {
  1: { floor: 1, enemyHpMultiplier: 1.00, enemyAtkMultiplier: 1.00, enemyCount: 6,  lootQualityBonus: 0 },
  2: { floor: 2, enemyHpMultiplier: 1.15, enemyAtkMultiplier: 1.10, enemyCount: 7,  lootQualityBonus: 0 },
  3: { floor: 3, enemyHpMultiplier: 1.30, enemyAtkMultiplier: 1.20, enemyCount: 8,  lootQualityBonus: 1 },
  4: { floor: 4, enemyHpMultiplier: 1.50, enemyAtkMultiplier: 1.30, enemyCount: 9,  lootQualityBonus: 1 },
  5: { floor: 5, enemyHpMultiplier: 1.75, enemyAtkMultiplier: 1.45, enemyCount: 10, lootQualityBonus: 2 },
};

export function getFloorDifficulty(floor: number): FloorDifficulty {
  if (FLOOR_DIFFICULTY_TABLE[floor]) return FLOOR_DIFFICULTY_TABLE[floor];
  const base = FLOOR_DIFFICULTY_TABLE[5];
  const extra = floor - 5;
  return {
    floor,
    enemyHpMultiplier:  base.enemyHpMultiplier  + extra * 0.20,
    enemyAtkMultiplier: base.enemyAtkMultiplier + extra * 0.10,
    enemyCount: Math.min(base.enemyCount + extra, 20),
    lootQualityBonus: base.lootQualityBonus + Math.floor(extra / 2),
  };
}
