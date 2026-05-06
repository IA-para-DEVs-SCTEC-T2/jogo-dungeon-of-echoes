/**
 * Item.ts — Entidade de item do jogo
 * Fase 3: Sistema de Inventário, Itens e Identificação
 *
 * Itens podem ser desconhecidos até serem usados (roguelike clássico).
 * O nome exibido depende do estado de identificação do player.
 */

export type ItemType = 'potion_heal' | 'potion_poison' | 'gold';

/** Mapa de nomes genéricos (desconhecidos) por tipo */
export const UNKNOWN_NAMES: Record<ItemType, string> = {
  potion_heal:   'Poção Vermelha',
  potion_poison: 'Poção Azul',
  gold:          'Moeda de Ouro',
};

/** Mapa de nomes reais (após identificação) */
export const REAL_NAMES: Record<ItemType, string> = {
  potion_heal:   'Poção de Cura',
  potion_poison: 'Poção de Veneno',
  gold:          'Moeda de Ouro',
};

export class Item {
  id: string;
  type: ItemType;
  identified: boolean;

  /** Posição no grid (null quando está no inventário) */
  gridX: number | null;
  gridY: number | null;

  /** Referência ao sprite Phaser (gerenciado pela GameScene) */
  sprite: Phaser.GameObjects.Sprite | null = null;

  constructor(id: string, type: ItemType, gridX: number | null = null, gridY: number | null = null) {
    this.id         = id;
    this.type       = type;
    this.identified = false;
    this.gridX      = gridX;
    this.gridY      = gridY;
  }

  /**
   * Retorna o nome exibido ao jogador.
   * Se identificado (ou tipo já identificado na partida), retorna nome real.
   * Caso contrário, retorna nome genérico.
   */
  getDisplayName(identifiedItems: Record<string, boolean>): string {
    if (this.identified || identifiedItems[this.type]) {
      return REAL_NAMES[this.type];
    }
    return UNKNOWN_NAMES[this.type];
  }
}
