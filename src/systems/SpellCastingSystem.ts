import * as Phaser from 'phaser';
import { SPELLS_DB } from '../config/spells.db';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import { Projectile } from '../entities/Projectile';
import type { SpellSystem } from './SpellSystem';
import type { Player } from '../entities/Player';

export class SpellCastingSystem {
  cast(
    slotIndex: 0 | 1,
    player: Player,
    spellSystem: SpellSystem,
    scene: Phaser.Scene,
    nowMs: number,
  ): Projectile | null {
    const slots = spellSystem.getSlots();
    const slot  = slots[slotIndex];
    if (!slot.spellId) return null;

    const spell = SPELLS_DB[slot.spellId];
    if (!spell) return null;
    if (!spellSystem.canCast(slotIndex, nowMs)) return null;
    if (player.mana < spell.manaCost) return null;

    player.mana = Math.max(0, player.mana - spell.manaCost);
    EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: player.mana, maxMana: player.maxMana });
    spellSystem.recordCast(slotIndex, nowMs);
    EventBus.emit(EVENTS.SPELL_CAST, { slotIndex, spellId: spell.id });

    return new Projectile(scene, player.x, player.y, spell, player.facingDir ?? 'down');
  }
}
