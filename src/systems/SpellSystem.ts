import { SPELLS_DB } from '../config/spells.db';
import { SPELL_PROGRESSION } from '../config/spell-progression';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import { ClassRulesEngine } from './ClassRulesEngine';
import type { SpellSlotState } from '../types/spells';
import type { PlayerClassDef } from '../config/player-classes.config';

type SpellPlayer = {
  unlockedSpells: string[];
  equippedSpells: [string | null, string | null];
  classDef?: PlayerClassDef;
};

export class SpellSystem {
  private _slots: SpellSlotState[] = [
    { spellId: null, lastCastMs: 0, cooldownMs: 0 },
    { spellId: null, lastCastMs: 0, cooldownMs: 0 },
  ];

  unlockSpellsForLevel(player: SpellPlayer, level: number): string[] {
    const ids = SPELL_PROGRESSION[level] ?? [];
    const added: string[] = [];
    for (const id of ids) {
      if (!player.unlockedSpells.includes(id)) {
        // Pular spells exclusivas de outras classes
        if (player.classDef && !ClassRulesEngine.canUnlockSpell(player.classDef, id)) continue;
        player.unlockedSpells.push(id);
        added.push(id);
      }
    }
    return added;
  }

  /** Custo efetivo de mana de uma spell considerando a classe do player */
  getManaCost(spellId: string, classDef?: PlayerClassDef): number {
    const base = SPELLS_DB[spellId]?.manaCost ?? 0;
    if (!classDef) return base;
    return ClassRulesEngine.effectiveManaCost(classDef, base);
  }

  equipSpell(player: SpellPlayer, spellId: string, slotIndex: 0 | 1): boolean {
    if (!player.unlockedSpells.includes(spellId)) return false;
    if (!SPELLS_DB[spellId]) return false;

    player.equippedSpells[slotIndex] = spellId;
    this._slots[slotIndex].spellId   = spellId;
    this._slots[slotIndex].cooldownMs = SPELLS_DB[spellId].cooldownMs;
    EventBus.emit(EVENTS.SPELL_EQUIPPED, { slotIndex, spellId });
    return true;
  }

  unequipSpell(player: SpellPlayer, slotIndex: 0 | 1): void {
    player.equippedSpells[slotIndex] = null;
    this._slots[slotIndex].spellId   = null;
    this._slots[slotIndex].cooldownMs = 0;
    this._slots[slotIndex].lastCastMs = 0;
    EventBus.emit(EVENTS.SPELL_EQUIPPED, { slotIndex, spellId: null });
  }

  canCast(slotIndex: 0 | 1, nowMs: number): boolean {
    const slot = this._slots[slotIndex];
    if (!slot.spellId) return false;
    return (nowMs - slot.lastCastMs) >= slot.cooldownMs;
  }

  recordCast(slotIndex: 0 | 1, nowMs: number): void {
    const slot = this._slots[slotIndex];
    slot.lastCastMs = nowMs;
  }

  getCooldownRatio(slotIndex: 0 | 1, nowMs: number): number {
    const slot = this._slots[slotIndex];
    if (!slot.spellId || slot.cooldownMs === 0) return 0;
    const elapsed = nowMs - slot.lastCastMs;
    if (elapsed >= slot.cooldownMs) return 0;
    return 1 - elapsed / slot.cooldownMs;
  }

  getSlots(): SpellSlotState[] {
    return this._slots;
  }

  syncFromPlayer(player: SpellPlayer): void {
    for (let i = 0; i < 2; i++) {
      const id = player.equippedSpells[i as 0 | 1];
      this._slots[i].spellId   = id;
      this._slots[i].cooldownMs = id ? (SPELLS_DB[id]?.cooldownMs ?? 0) : 0;
    }
  }
}
