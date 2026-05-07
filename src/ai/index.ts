/**
 * index.ts — Exports públicos do módulo de IA
 * 
 * Uso:
 * import { AIService, AIIntegration, AI_CONFIG } from './ai';
 */

export { AIService } from './AIService';
export { AIIntegration } from './AIIntegration';
export { AI_CONFIG } from './config';

export type {
  ItemContext,
  EnemyContext,
  EnemyVariant,
  EventContext,
} from './AIService';
