/**
 * example-integration.ts — Exemplo de integração do AIService na GameScene
 * 
 * Este arquivo mostra como integrar o sistema de IA de forma correta e não-bloqueante.
 * Copie os trechos relevantes para sua GameScene.
 */

import { AIService } from './AIService';
import { AIIntegration } from './AIIntegration';
import { AI_CONFIG } from './config';
import { Item } from '../entities/Item';
import { Enemy } from '../entities/Enemy';
import { AI } from '../utils/constants';

/**
 * EXEMPLO 1: Inicialização na GameScene
 */
export class GameSceneWithAI extends Phaser.Scene {
  private aiService!: AIService;
  private aiIntegration!: AIIntegration;

  create() {
    // Inicializar IA (sempre fazer no create, nunca no constructor)
    this.aiService = new AIService(AI_CONFIG.API_KEY);
    this.aiIntegration = new AIIntegration(this.aiService);

    // ... resto da inicialização da cena
  }

  /**
   * EXEMPLO 2: Enriquecer item quando coletado
   */
  onItemPickedUp(item: Item) {
    // Calcular raridade do item (exemplo simplificado)
    const rarity = this.calculateItemRarity(item);

    // Se for raro, tentar gerar descrição IA
    if (rarity >= AI.ITEM_RARITY_THRESHOLD) {
      // NÃO usar await! Deixar rodar em background
      this.aiIntegration.enrichItem(item, rarity).then(() => {
        // Quando pronto, exibir no log
        if (item.aiDescription) {
          this.events.emit('ui-log', {
            message: item.aiDescription,
            color: '#ffdd00',
          });
        }
      });
    }

    // O jogo continua normalmente, não espera a IA
    this.addItemToInventory(item);
  }

  /**
   * EXEMPLO 3: Spawnar inimigo elite com variante IA
   */
  spawnEnemy(x: number, y: number): Enemy {
    const enemy = new Enemy(`enemy-${Date.now()}`, x, y, 30, 8);

    // 15% de chance de ser elite
    if (Math.random() < AI.ENEMY_ELITE_CHANCE) {
      // NÃO usar await! Deixar rodar em background
      this.aiIntegration.createEliteEnemy(
        enemy,
        'Esqueleto',           // tipo base
        this.getPlayerLevel(), // nível do jogador
        'Masmorra Sombria'     // local atual
      ).then(() => {
        // Quando pronto, atualizar sprite (ex: adicionar aura dourada)
        if (enemy.isElite && enemy.sprite) {
          this.addEliteVisualEffect(enemy.sprite);
        }

        // Logar no console
        console.log(`Elite spawned: ${enemy.getDisplayName('Esqueleto')}`);
        
        // Exibir descrição se disponível
        if (enemy.aiDescription) {
          this.events.emit('ui-log', {
            message: `${enemy.getDisplayName('Esqueleto')}: ${enemy.aiDescription}`,
            color: '#ff8800',
          });
        }
      });
    }

    return enemy;
  }

  /**
   * EXEMPLO 4: Evento narrativo em tile especial
   */
  onPlayerMove(newX: number, newY: number) {
    const tile = this.dungeon.getTile(newX, newY);

    // Tile especial triggera evento narrativo
    if (tile === AI.EVENT_SPECIAL_TILE) {
      // NÃO usar await! Deixar rodar em background
      this.aiIntegration.generateNarrativeEvent(
        this.getCurrentLocationName(),
        this.getPlayerLevel(),
        this.getRecentEvents()
      ).then(eventText => {
        // Quando pronto, exibir no HUD
        this.showNarrativeEvent(eventText);
      });

      // Marcar tile como visitado para não retriggerar
      this.markTileAsVisited(newX, newY);
    }
  }

  /**
   * EXEMPLO 5: Combate com inimigo elite
   */
  onCombatStart(enemy: Enemy) {
    // Se for elite, mostrar informações especiais
    if (enemy.isElite) {
      const name = enemy.getDisplayName('Inimigo');
      const ability = enemy.aiSpecialAbility || 'Ataque Brutal';

      this.events.emit('ui-log', {
        message: `⚔️ Você enfrenta ${name}!`,
        color: '#ff4444',
      });

      this.events.emit('ui-log', {
        message: `Habilidade: ${ability}`,
        color: '#ffaa00',
      });
    }
  }

  // ─── MÉTODOS AUXILIARES (implementar conforme seu jogo) ─────────────────

  private calculateItemRarity(item: Item): number {
    // Exemplo: poções de cura são comuns (0.3), veneno é raro (0.9)
    const rarities: Record<string, number> = {
      potion_heal: 0.3,
      potion_poison: 0.9,
      gold: 0.1,
    };
    return rarities[item.type] || 0.5;
  }

  private addItemToInventory(item: Item): void {
    // Implementar lógica de inventário
    console.log(`Item ${item.type} adicionado ao inventário`);
  }

  private getPlayerLevel(): number {
    // Retornar nível atual do jogador
    return 1; // placeholder
  }

  private getCurrentLocationName(): string {
    // Retornar nome do local atual
    return 'Masmorra Profunda';
  }

  private getRecentEvents(): string[] {
    // Retornar eventos recentes (últimos 3-5)
    return ['Derrotou um elite', 'Encontrou item raro'];
  }

  private showNarrativeEvent(text: string): void {
    // Exibir evento narrativo no HUD
    this.events.emit('ui-log', {
      message: `📖 ${text}`,
      color: '#aaaaff',
    });
  }

  private markTileAsVisited(x: number, y: number): void {
    // Marcar tile como visitado
    console.log(`Tile (${x}, ${y}) marcado como visitado`);
  }

  private addEliteVisualEffect(sprite: Phaser.GameObjects.Sprite): void {
    // Adicionar efeito visual (ex: aura dourada)
    // sprite.setTint(0xffdd00);
    console.log('Efeito visual de elite adicionado');
  }
}

/**
 * EXEMPLO 6: Uso direto do AIService (avançado)
 */
export function advancedAIUsage() {
  const aiService = new AIService(AI_CONFIG.API_KEY);

  // Gerar descrição customizada
  aiService.generateItemDescription({
    name: 'Espada Antiga',
    type: 'Arma',
    effect: 'rouba vida',
  }).then(description => {
    console.log('Descrição gerada:', description);
  });

  // Gerar variante de inimigo
  aiService.generateEnemyVariant({
    baseType: 'Dragão',
    level: 10,
    location: 'Pico Congelado',
  }).then(variant => {
    console.log('Variante gerada:', variant);
  });

  // Gerar evento
  aiService.generateEvent({
    location: 'Biblioteca Esquecida',
    playerLevel: 5,
    recentEvents: ['Leu um livro antigo', 'Ouviu sussurros'],
  }).then(event => {
    console.log('Evento gerado:', event);
  });
}
