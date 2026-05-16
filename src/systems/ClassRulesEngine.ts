import type { PlayerClassDef } from '../config/player-classes.config';
import type { EquipmentSlotId } from '../types/equipment';
import { PLAYER_CLASSES } from '../config/player-classes.config';

/**
 * ClassRulesEngine — serviço puro sem estado.
 * Ponto central para todas as regras dependentes de classe.
 * Nenhum outro sistema deve checar `classDef.id` diretamente — use este engine.
 */
export class ClassRulesEngine {
  /**
   * Retorna se a classe pode equipar o slot indicado.
   * O slot 'extra' é sempre permitido para todas as classes.
   * Para o slot 'sword', o Arqueiro pode equipar arco e o Mago pode equipar spellbook.
   */
  static canEquipSlot(classDef: PlayerClassDef, slotId: EquipmentSlotId, itemType?: string): boolean {
    // Slot extra é aberto para todas as classes
    if (slotId === 'extra') return true;

    if (!classDef.forbiddenSlots.includes(slotId)) return true;

    // Slot proibido — checar exceções por tipo de item
    if (slotId === 'sword') {
      if (classDef.id === 'arqueiro' && itemType === 'bow') return true;
      if (classDef.id === 'mago'     && itemType === 'spellbook') return true;
    }
    return false;
  }

  /** Retorna se a classe pode executar um ataque corpo a corpo */
  static canMelee(classDef: PlayerClassDef): boolean {
    return classDef.canMelee;
  }

  /**
   * Retorna se a classe pode executar um ataque agora.
   * Para o Arqueiro, bloqueia se não houver flechas equipadas no slot extra.
   *
   * @param equippedExtraItemType - tipo do item equipado no slot extra (ou null/undefined)
   */
  static canAttack(classDef: PlayerClassDef, arrows: number, equippedExtraItemType?: string | null): boolean {
    if (classDef.usesArrows) {
      const hasArrowsEquipped = equippedExtraItemType?.startsWith('arrows') ?? false;
      if (!hasArrowsEquipped || arrows <= 0) return false;
    }
    return true;
  }

  /** Multiplicador de dano físico recebido */
  static physicalDamageMultiplier(classDef: PlayerClassDef): number {
    return classDef.physicalDamageReceived;
  }

  /** Multiplicador de sorte nos drops (> 1 = mais itens/raridade) */
  static luckMultiplier(classDef: PlayerClassDef): number {
    return classDef.luckMultiplier;
  }

  /** Chance adicional de dropar um segundo item */
  static extraDropChance(classDef: PlayerClassDef): number {
    return classDef.extraDropChance;
  }

  /** Multiplicador no custo de mana das magias */
  static manaCostMultiplier(classDef: PlayerClassDef): number {
    return classDef.manaCostMultiplier;
  }

  /** Mana regenerada por turno */
  static manaRegenPerTurn(classDef: PlayerClassDef): number {
    return classDef.manaRegenPerTurn;
  }

  /**
   * Raio efetivo de detecção dos inimigos para esta classe.
   * Arqueiro/Mago elevam o bias → inimigos os detectam de mais longe e perseguem com mais força.
   */
  static effectiveDetectionRadius(classDef: PlayerClassDef, baseRadius: number): number {
    return baseRadius + classDef.enemyApproachBias * 4;
  }

  /**
   * Retorna se esta classe pode desbloquear uma spell.
   * Spells listadas em `exclusiveSpells` de outra classe ficam bloqueadas.
   */
  static canUnlockSpell(classDef: PlayerClassDef, spellId: string): boolean {
    for (const other of PLAYER_CLASSES) {
      if (other.id === classDef.id) continue;
      if (other.exclusiveSpells.includes(spellId)) return false;
    }
    return true;
  }

  /** Custo de mana efetivo de uma spell para esta classe */
  static effectiveManaCost(classDef: PlayerClassDef, baseManaCost: number): number {
    return Math.max(1, Math.round(baseManaCost * classDef.manaCostMultiplier));
  }
}
