/**
 * AIIntegration.ts — Camada de integração entre AIService e sistemas do jogo
 * 
 * Este módulo fornece funções helper para integrar a IA de forma não-bloqueante
 * com os sistemas de Item, Enemy e eventos do jogo.
 * 
 * IMPORTANTE: Todas as funções são assíncronas mas NÃO devem ser awaited
 * no loop principal do jogo. Use .then() para aplicar resultados quando prontos.
 */

import { AIService, ItemContext, EnemyContext, EventContext } from './AIService';
import { Item } from '../entities/Item';
import { Enemy } from '../entities/Enemy';
import { AI } from '../utils/constants';

export class AIIntegration {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Enriquece um item com descrição IA (não-bloqueante).
   * Uso: aiIntegration.enrichItem(item).then(() => console.log('Item enriquecido'));
   * 
   * @param item - Item a ser enriquecido
   * @param rarity - Raridade do item (0-1). Apenas itens raros (>0.8) são processados
   */
  enrichItem(item: Item, rarity: number = 1.0): Promise<void> {
    // Apenas processar itens raros
    if (rarity < AI.ITEM_RARITY_THRESHOLD) {
      return Promise.resolve();
    }

    const context: ItemContext = {
      name: this.getItemName(item.type),
      type: this.getItemTypeDescription(item.type),
      effect: this.getItemEffect(item.type),
    };

    return this.aiService.generateItemDescription(context)
      .then(description => {
        item.aiDescription = description;
        console.log(`[AIIntegration] Item "${context.name}" enriquecido.`);
      })
      .catch(error => {
        console.error('[AIIntegration] Erro ao enriquecer item:', error);
      });
  }

  /**
   * Cria variante elite de inimigo com IA (não-bloqueante).
   * Uso: aiIntegration.createEliteEnemy(enemy, context).then(() => console.log('Elite criado'));
   * 
   * @param enemy - Inimigo a ser transformado em elite
   * @param baseType - Tipo base do inimigo (ex: "Esqueleto", "Goblin")
   * @param level - Nível do jogador (para contexto)
   * @param location - Descrição do local (ex: "Masmorra Profunda")
   */
  createEliteEnemy(
    enemy: Enemy,
    baseType: string = 'Inimigo',
    level: number = 1,
    location: string = 'Masmorra'
  ): Promise<void> {
    const context: EnemyContext = {
      baseType,
      level,
      location,
    };

    return this.aiService.generateEnemyVariant(context)
      .then(variant => {
        enemy.isElite = true;
        enemy.aiName = variant.name;
        enemy.aiDescription = variant.description;
        enemy.aiSpecialAbility = variant.specialAbility;

        // Buff de stats para elite (50% mais HP e ataque)
        enemy.maxHp = Math.floor(enemy.maxHp * 1.5);
        enemy.hp = enemy.maxHp;
        enemy.attack = Math.floor(enemy.attack * 1.5);

        console.log(`[AIIntegration] Elite "${variant.name}" criado.`);
      })
      .catch(error => {
        console.error('[AIIntegration] Erro ao criar elite:', error);
        // Fallback: marcar como elite mesmo sem IA
        enemy.isElite = true;
        enemy.maxHp = Math.floor(enemy.maxHp * 1.5);
        enemy.hp = enemy.maxHp;
        enemy.attack = Math.floor(enemy.attack * 1.5);
      });
  }

  /**
   * Gera evento narrativo (não-bloqueante).
   * Uso: aiIntegration.generateNarrativeEvent(context).then(text => showInUI(text));
   * 
   * @param location - Descrição do local atual
   * @param playerLevel - Nível do jogador
   * @param recentEvents - Array de eventos recentes (opcional)
   */
  generateNarrativeEvent(
    location: string = 'Masmorra',
    playerLevel: number = 1,
    recentEvents: string[] = []
  ): Promise<string> {
    const context: EventContext = {
      location,
      playerLevel,
      recentEvents,
    };

    return this.aiService.generateEvent(context)
      .then(eventText => {
        console.log(`[AIIntegration] Evento gerado: "${eventText}"`);
        return eventText;
      })
      .catch(error => {
        console.error('[AIIntegration] Erro ao gerar evento:', error);
        return 'Você sente uma presença estranha...';
      });
  }

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────

  private getItemName(type: string): string {
    const names: Record<string, string> = {
      potion_heal: 'Poção de Cura',
      potion_mana: 'Poção de Mana',
      gold: 'Moeda de Ouro',
    };
    return names[type] || 'Item Desconhecido';
  }

  private getItemTypeDescription(type: string): string {
    const types: Record<string, string> = {
      potion_heal: 'Poção',
      potion_mana: 'Poção',
      gold: 'Moeda',
    };
    return types[type] || 'Item';
  }

  private getItemEffect(type: string): string {
    const effects: Record<string, string> = {
      potion_heal: 'restaura vida',
      potion_mana: 'restaura mana',
      gold: 'moeda de troca',
    };
    return effects[type] || 'efeito desconhecido';
  }
}
