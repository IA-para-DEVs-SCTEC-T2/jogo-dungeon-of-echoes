import { SPELLS_DB } from '../config/spells.db';
import { SPELL_PROGRESSION } from '../config/spell-progression';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import { ClassRulesEngine } from './ClassRulesEngine';
import type { SpellSlotState } from '../types/spells';
import type { PlayerClassDef } from '../config/player-classes.config';

type SpellPlayer = {
  unlockedSpells: string[];
  equippedSpells: (string | null)[];
  classDef?: PlayerClassDef;
};

export class SpellSystem {
  private _slots: SpellSlotState[] = [
    { spellId: null, lastCastMs: 0, cooldownMs: 0 },
    { spellId: null, lastCastMs: 0, cooldownMs: 0 },
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

  equipSpell(player: SpellPlayer, spellId: string, slotIndex: number): boolean {
    if (!player.unlockedSpells.includes(spellId)) return false;
    if (!SPELLS_DB[spellId]) return false;
    const maxSlots = player.classDef?.maxSpellSlots ?? 2;
    if (slotIndex >= maxSlots) return false;

    player.equippedSpells[slotIndex] = spellId;
    this._slots[slotIndex].spellId   = spellId;
    this._slots[slotIndex].cooldownMs = SPELLS_DB[spellId].cooldownMs;
    EventBus.emit(EVENTS.SPELL_EQUIPPED, { slotIndex, spellId });
    return true;
  }

  unequipSpell(player: SpellPlayer, slotIndex: number): void {
    player.equippedSpells[slotIndex] = null;
    this._slots[slotIndex].spellId   = null;
    this._slots[slotIndex].cooldownMs = 0;
    this._slots[slotIndex].lastCastMs = 0;
    EventBus.emit(EVENTS.SPELL_EQUIPPED, { slotIndex, spellId: null });
  }

  canCast(slotIndex: number, nowMs: number): boolean {
    const slot = this._slots[slotIndex];
    if (!slot || !slot.spellId) return false;
    return (nowMs - slot.lastCastMs) >= slot.cooldownMs;
  }

  recordCast(slotIndex: number, nowMs: number): void {
    const slot = this._slots[slotIndex];
    if (slot) slot.lastCastMs = nowMs;
  }

  getCooldownRatio(slotIndex: number, nowMs: number): number {
    const slot = this._slots[slotIndex];
    if (!slot || !slot.spellId || slot.cooldownMs === 0) return 0;
    const elapsed = nowMs - slot.lastCastMs;
    if (elapsed >= slot.cooldownMs) return 0;
    return 1 - elapsed / slot.cooldownMs;
  }

  getSlots(): SpellSlotState[] {
    return this._slots;
  }

  /** Retorna apenas os slots ativos para a classe do player */
  getActiveSlots(maxSlots: number): SpellSlotState[] {
    return this._slots.slice(0, maxSlots);
  }

  syncFromPlayer(player: SpellPlayer): void {
    const maxSlots = player.classDef?.maxSpellSlots ?? 2;
    for (let i = 0; i < maxSlots; i++) {
      const id = player.equippedSpells[i] ?? null;
      this._slots[i].spellId   = id;
      this._slots[i].cooldownMs = id ? (SPELLS_DB[id]?.cooldownMs ?? 0) : 0;
    }
  }
}
