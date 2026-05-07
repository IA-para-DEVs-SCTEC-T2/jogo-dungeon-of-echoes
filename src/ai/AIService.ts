/**
 * AIService.ts — Sistema de IA Generativa (LLM)
 * Fase 4: Integração com IA para enriquecer narrativa do jogo
 *
 * PRINCÍPIOS:
 * - Assíncrono e não-bloqueante
 * - Sempre tem fallback (jogo funciona sem IA)
 * - Cache para evitar chamadas repetidas
 * - Nunca bloqueia o loop principal do jogo
 */

export interface ItemContext {
  name: string;
  type: string;
  effect: string;
}

export interface EnemyContext {
  baseType: string;
  level: number;
  location: string;
}

export interface EnemyVariant {
  name: string;
  description: string;
  specialAbility: string;
}

export interface EventContext {
  location: string;
  playerLevel: number;
  recentEvents: string[];
}

export class AIService {
  private apiKey: string;
  private cache: Map<string, string>;
  private enabled: boolean;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
    this.cache = new Map();
    this.enabled = !!this.apiKey;

    if (!this.enabled) {
      console.warn('[AIService] API key não configurada. Usando fallbacks.');
    } else {
      console.log('[AIService] Inicializado com sucesso.');
    }
  }

  /**
   * Gera descrição narrativa para um item raro/épico.
   * Não bloqueia o jogo — retorna Promise que resolve quando pronta.
   */
  async generateItemDescription(item: ItemContext): Promise<string> {
    const cacheKey = this.getCacheKey('item', item);

    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      console.log('[AIService] Descrição de item recuperada do cache.');
      return this.cache.get(cacheKey)!;
    }

    // Se IA desabilitada, retornar fallback imediatamente
    if (!this.enabled) {
      return this.fallbackItemDescription();
    }

    try {
      console.log('[AIService] Gerando descrição do item...');

      const prompt = this.buildItemPrompt(item);
      const response = await this.callLLM(prompt);

      // Salvar no cache
      this.cache.set(cacheKey, response);

      console.log('[AIService] Descrição recebida.');
      return response;
    } catch (error) {
      console.error('[AIService] Erro ao gerar descrição:', error);
      return this.fallbackItemDescription();
    }
  }

  /**
   * Gera variante de inimigo elite com nome, descrição e habilidade especial.
   */
  async generateEnemyVariant(context: EnemyContext): Promise<EnemyVariant> {
    const cacheKey = this.getCacheKey('enemy', context);

    if (this.cache.has(cacheKey)) {
      console.log('[AIService] Variante de inimigo recuperada do cache.');
      return JSON.parse(this.cache.get(cacheKey)!);
    }

    if (!this.enabled) {
      return this.fallbackEnemyVariant(context);
    }

    try {
      console.log('[AIService] Gerando variante de inimigo...');

      const prompt = this.buildEnemyPrompt(context);
      const response = await this.callLLM(prompt);

      // Parsear resposta JSON
      const variant = this.parseEnemyVariant(response, context);

      // Salvar no cache
      this.cache.set(cacheKey, JSON.stringify(variant));

      console.log('[AIService] Variante recebida.');
      return variant;
    } catch (error) {
      console.error('[AIService] Erro ao gerar variante:', error);
      return this.fallbackEnemyVariant(context);
    }
  }

  /**
   * Gera evento narrativo curto baseado no contexto do jogo.
   */
  async generateEvent(context: EventContext): Promise<string> {
    const cacheKey = this.getCacheKey('event', context);

    if (this.cache.has(cacheKey)) {
      console.log('[AIService] Evento recuperado do cache.');
      return this.cache.get(cacheKey)!;
    }

    if (!this.enabled) {
      return this.fallbackEvent();
    }

    try {
      console.log('[AIService] Gerando evento narrativo...');

      const prompt = this.buildEventPrompt(context);
      const response = await this.callLLM(prompt);

      this.cache.set(cacheKey, response);

      console.log('[AIService] Evento recebido.');
      return response;
    } catch (error) {
      console.error('[AIService] Erro ao gerar evento:', error);
      return this.fallbackEvent();
    }
  }

  // ─── MÉTODOS PRIVADOS ────────────────────────────────────────────────────

  /**
   * Chama a API do LLM (OpenAI-compatible).
   * Pode ser substituído por qualquer provider compatível.
   */
  private async callLLM(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um narrador de RPG dark fantasy. Seja conciso e atmosférico.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  /**
   * Constrói prompt para descrição de item.
   */
  private buildItemPrompt(item: ItemContext): string {
    return `Você é um narrador de RPG dark fantasy.

Crie uma descrição curta (2 frases) para um item:

Nome: ${item.name}
Tipo: ${item.type}
Efeito: ${item.effect}

Tom: sombrio e misterioso`;
  }

  /**
   * Constrói prompt para variante de inimigo.
   */
  private buildEnemyPrompt(context: EnemyContext): string {
    return `Você é um narrador de RPG dark fantasy.

Crie uma variante elite de inimigo baseada em:

Tipo base: ${context.baseType}
Nível: ${context.level}
Local: ${context.location}

Retorne em formato JSON:
{
  "name": "nome do inimigo",
  "description": "descrição curta (1 frase)",
  "specialAbility": "nome da habilidade especial"
}`;
  }

  /**
   * Constrói prompt para evento narrativo.
   */
  private buildEventPrompt(context: EventContext): string {
    return `Você é um narrador de RPG dark fantasy.

Crie um evento narrativo curto (1 frase) para:

Local: ${context.location}
Nível do jogador: ${context.playerLevel}
Eventos recentes: ${context.recentEvents.join(', ') || 'nenhum'}

Tom: misterioso e atmosférico`;
  }

  /**
   * Parseia resposta JSON do LLM para variante de inimigo.
   */
  private parseEnemyVariant(response: string, context: EnemyContext): EnemyVariant {
    try {
      const parsed = JSON.parse(response);
      return {
        name: parsed.name || `${context.baseType} Elite`,
        description: parsed.description || 'Uma criatura poderosa.',
        specialAbility: parsed.specialAbility || 'Ataque Brutal',
      };
    } catch {
      // Se falhar o parse, retornar fallback
      return this.fallbackEnemyVariant(context);
    }
  }

  /**
   * Gera chave de cache única baseada no tipo e input.
   */
  private getCacheKey(type: string, input: any): string {
    return `${type}:${JSON.stringify(input)}`;
  }

  // ─── FALLBACKS ───────────────────────────────────────────────────────────

  private fallbackItemDescription(): string {
    const fallbacks = [
      'Um item envolto em mistério.',
      'Sua origem é desconhecida, mas seu poder é inegável.',
      'Algo antigo pulsa dentro deste artefato.',
      'As sombras parecem se curvar diante dele.',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  private fallbackEnemyVariant(context: EnemyContext): EnemyVariant {
    return {
      name: `${context.baseType} Sombrio`,
      description: 'Uma versão corrompida e mais poderosa.',
      specialAbility: 'Golpe das Sombras',
    };
  }

  private fallbackEvent(): string {
    const fallbacks = [
      'Você sente uma presença antiga observando...',
      'O ar fica mais pesado. Algo está errado.',
      'Ecos distantes reverberam pelas paredes.',
      'Uma sensação de déjà vu toma conta de você.',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
