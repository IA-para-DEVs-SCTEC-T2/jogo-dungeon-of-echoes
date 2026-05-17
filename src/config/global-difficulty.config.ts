export type GlobalDifficultyLevel = 'easy' | 'medium' | 'hard';

export interface LootModifiers {
  goldMultiplier: number;
  potionMultiplier: number;
}

export interface GlobalDifficultyConfig {
  level: GlobalDifficultyLevel;
  label: string;
  description: string;
  enemyHpMultiplier: number;
  enemyAtkMultiplier: number;
  enemyCountDelta: number;
  lootModifiers: LootModifiers;
}

export const GLOBAL_DIFFICULTY_CONFIGS: Record<GlobalDifficultyLevel, GlobalDifficultyConfig> = {
  easy: {
    level: 'easy',
    label: 'Fácil',
    description: 'Mais tranquilo',
    enemyHpMultiplier:  0.75,
    enemyAtkMultiplier: 0.75,
    enemyCountDelta:    -2,
    lootModifiers: { goldMultiplier: 1.30, potionMultiplier: 1.30 },
  },
  medium: {
    level: 'medium',
    label: 'Médio',
    description: 'Padrão recomendado',
    enemyHpMultiplier:  1.00,
    enemyAtkMultiplier: 1.00,
    enemyCountDelta:    0,
    lootModifiers: { goldMultiplier: 1.00, potionMultiplier: 1.00 },
  },
  hard: {
    level: 'hard',
    label: 'Difícil',
    description: 'Alta dificuldade',
    enemyHpMultiplier:  1.25,
    enemyAtkMultiplier: 1.30,
    enemyCountDelta:    +2,
    lootModifiers: { goldMultiplier: 0.75, potionMultiplier: 0.75 },
  },
};
