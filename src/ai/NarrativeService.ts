/**
 * NarrativeService.ts — Geração de narrativa emergente com IA
 * Fase 6: Narrativa Emergente com IA (Memória + Contexto)
 *
 * Usa o histórico real do jogador (EventMemory) para gerar narrativa.
 * NUNCA inventa eventos — só amplifica o que realmente aconteceu.
 *
 * PRINCÍPIOS:
 * - Assíncrono e não-bloqueante (.then(), nunca await no loop)
 * - Sempre tem fallback (jogo funciona sem IA)
 * - Geração pontual: mudança de andar, eventos especiais, morte
 */

import { AIService } from './AIService';
import type { GameEvent } from '../systems/EventMemory';

/** Fallbacks narrativos para quando a IA não está disponível */
const FALLBACK_NARRATIVES = [
  'Uma jornada sombria se desenrola nas profundezas...',
  'O eco dos seus passos ressoa pelas paredes úmidas.',
  'A escuridão parece ganhar vida ao seu redor.',
  'Cada passo te leva mais fundo no desconhecido.',
  'As sombras guardam segredos que talvez seja melhor não descobrir.',
];

const FALLBACK_DEATH_STORIES = [
  'Sua jornada terminou nas profundezas da masmorra. Mas a dungeon guarda sua memória.',
  'O silêncio tomou conta. Mais um aventureiro consumido pelas sombras.',
  'Sua história chegou ao fim — mas outras começarão onde a sua parou.',
  'A masmorra venceu desta vez. Mas cada derrota é uma lição.',
];

export class NarrativeService {
  private _aiService: AIService;
  private _enabled: boolean;

  constructor(aiService: AIService) {
    this._aiService = aiService;
    this._enabled = aiService['enabled'] ?? false;
  }

  // ─── Narrativa de andar / evento especial ─────────────────────────────────

  /**
   * Gera um trecho narrativo curto baseado nos eventos recentes.
   * Usar com .then() — não bloqueia o jogo.
   *
   * @param events - Eventos importantes da run (máx 10)
   * @returns Promise com texto narrativo (3–5 frases)
   */
  async generateNarrative(events: GameEvent[]): Promise<string> {
    if (!this._enabled || events.length === 0) {
      return this._randomFallback(FALLBACK_NARRATIVES);
    }

    try {
      const prompt = this._buildNarrativePrompt(events);
      const response = await this._aiService['callLLM'](prompt);
      return response;
    } catch (error) {
      console.error('[NarrativeService] Erro ao gerar narrativa:', error);
      return this._randomFallback(FALLBACK_NARRATIVES);
    }
  }

  // ─── Narrativa de morte ───────────────────────────────────────────────────

  /**
   * Gera a "história da run" exibida na tela de Game Over.
   * Usa todos os eventos importantes da partida.
   *
   * @param events - Eventos importantes de toda a run
   * @returns Promise com texto da história (3–5 frases)
   */
  async generateDeathStory(events: GameEvent[]): Promise<string> {
    if (!this._enabled || events.length === 0) {
      return this._randomFallback(FALLBACK_DEATH_STORIES);
    }

    try {
      const prompt = this._buildDeathStoryPrompt(events);
      const response = await this._aiService['callLLM'](prompt);
      return response;
    } catch (error) {
      console.error('[NarrativeService] Erro ao gerar história de morte:', error);
      return this._randomFallback(FALLBACK_DEATH_STORIES);
    }
  }

  // ─── Prompts ──────────────────────────────────────────────────────────────

  private _buildNarrativePrompt(events: GameEvent[]): string {
    const eventLines = events
      .map(e => `- ${this._eventToText(e)}`)
      .join('\n');

    return `Você é um narrador de RPG dark fantasy.

Baseado nos eventos abaixo, escreva um pequeno trecho narrativo (3 a 5 frases):

Eventos:
${eventLines}

Regras:
- Tom: sombrio e misterioso
- Não invente eventos que não estão na lista
- Não mencione mecânicas de jogo (HP, dano, etc.)
- Escreva em português do Brasil`;
  }

  private _buildDeathStoryPrompt(events: GameEvent[]): string {
    const eventLines = events
      .map(e => `- ${this._eventToText(e)}`)
      .join('\n');

    return `Você é um narrador de RPG dark fantasy.

Um aventureiro morreu. Baseado nos eventos abaixo, escreva a história desta run (3 a 5 frases):

Eventos da jornada:
${eventLines}

Regras:
- Tom: épico e melancólico
- Não invente eventos que não estão na lista
- Não mencione mecânicas de jogo (HP, dano, etc.)
- Termine com uma frase sobre o legado ou o fim do aventureiro
- Escreva em português do Brasil`;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private _eventToText(event: GameEvent): string {
    switch (event.type) {
      case 'PLAYER_DAMAGED':     return `sofreu dano`;
      case 'PLAYER_HEALED':      return `se curou`;
      case 'ENEMY_KILLED':       return `derrotou ${event.data.enemyName ?? 'um inimigo'}`;
      case 'ITEM_USED':          return `usou ${event.data.itemName ?? 'um item'}`;
      case 'ITEM_FOUND':         return `encontrou ${event.data.itemName ?? 'um item'}`;
      case 'FLOOR_CHANGED':      return `desceu para o andar ${event.data.floor ?? '?'}`;
      case 'PLAYER_NEAR_DEATH':  return `quase morreu`;
      case 'PLAYER_DEATH':       return `morreu no andar ${event.data.floor ?? '?'}`;
      case 'ELITE_ENEMY_FOUND':  return `enfrentou um inimigo elite: ${event.data.name ?? 'desconhecido'}`;
      default:                   return `evento desconhecido`;
    }
  }

  private _randomFallback(list: string[]): string {
    return list[Math.floor(Math.random() * list.length)];
  }
}
