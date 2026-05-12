import type { EquipmentSlotId, StatBonuses, ItemRarity, EquippableItemType } from '../types/equipment';

export type ConsumableItemType =
  | 'potion_heal_light' | 'potion_heal' | 'potion_heal_high'
  | 'potion_mana_light' | 'potion_mana' | 'potion_mana_high'
  | 'gold';
export type ItemType = ConsumableItemType | EquippableItemType;

/** Mapa de nomes genéricos (desconhecidos) por tipo consumível */
export const UNKNOWN_NAMES: Record<ConsumableItemType, string> = {
  potion_heal_light: 'Poção Vermelha Fraca',
  potion_heal:       'Poção Vermelha',
  potion_heal_high:  'Poção Vermelha Forte',
  potion_mana_light: 'Poção Azul Fraca',
  potion_mana:       'Poção Azul',
  potion_mana_high:  'Poção Azul Forte',
  gold:              'Moeda de Ouro',
};

/** Mapa de nomes reais (após identificação) por tipo consumível */
export const REAL_NAMES: Record<ConsumableItemType, string> = {
  potion_heal_light: 'Poção de Cura Fraca',
  potion_heal:       'Poção de Cura',
  potion_heal_high:  'Poção de Cura Forte',
  potion_mana_light: 'Poção de Mana Fraca',
  potion_mana:       'Poção de Mana',
  potion_mana_high:  'Poção de Mana Forte',
  gold:              'Moeda de Ouro',
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

  /** Descrição gerada por IA (opcional, apenas para itens raros/especiais) */
  aiDescription: string | null = null;

  /** Quantidade de ouro (apenas para type === 'gold') */
  goldAmount?: number;

  // Campos opcionais para equipamentos
  name?: string;
  slotId?: EquipmentSlotId;
  bonuses?: StatBonuses;
  price?: number;
  rarity?: ItemRarity;

  constructor(id: string, type: ItemType, gridX: number | null = null, gridY: number | null = null) {
    this.id         = id;
    this.type       = type;
    this.identified = false;
    this.gridX      = gridX;
    this.gridY      = gridY;
  }

  /**
   * Retorna o nome exibido ao jogador.
   * Equipamentos retornam `name` diretamente.
   * Consumíveis usam sistema de identificação.
   */
  getDisplayName(identifiedItems: Record<string, boolean>): string {
    if (this.name) return this.name;
    const type = this.type as ConsumableItemType;
    if (!(type in UNKNOWN_NAMES)) return this.type;
    if (this.identified || identifiedItems[type]) {
      return REAL_NAMES[type];
    }
    return UNKNOWN_NAMES[type];
  }
}
