import { SPELLS_DB } from '../config/spells.db';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { SpellSystem } from './SpellSystem';
import type { Player } from '../entities/Player';
import type { EnemySystem } from './EnemySystem';

const ADJACENT = [
  { dx:  0, dy: -1 },
  { dx:  0, dy:  1 },
  { dx: -1, dy:  0 },
  { dx:  1, dy:  0 },
];

export type SpellCastResult = {
  success: boolean;
  damage: number;
  spellName: string;
  hitEnemies: EnemySystem[];
};

export class SpellCastingSystem {
  cast(
    slotIndex: 0 | 1,
    player: Player,
    spellSystem: SpellSystem,
    enemies: EnemySystem[],
    nowMs: number,
  ): SpellCastResult | null {
    const slots = spellSystem.getSlots();
    const slot  = slots[slotIndex];
    if (!slot.spellId) return null;

    const spell = SPELLS_DB[slot.spellId];
    if (!spell) return null;
    if (!spellSystem.canCast(slotIndex, nowMs)) return null;
    if (player.mana < spell.manaCost) return null;

    const targets = ADJACENT
      .map(({ dx, dy }) => ({ tx: player.gridX + dx, ty: player.gridY + dy }))
      .flatMap(({ tx, ty }) => enemies.filter(e => e.alive && e.gridX === tx && e.gridY === ty));

    player.mana = Math.max(0, player.mana - spell.manaCost);
    EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: player.mana, maxMana: player.maxMana });
    spellSystem.recordCast(slotIndex, nowMs);
    EventBus.emit(EVENTS.SPELL_CAST, { slotIndex, spellId: spell.id });

    return { success: true, damage: spell.damage, spellName: spell.name, hitEnemies: targets };
  }
}
