import { SPELLS_DB } from '../config/spells.db';
import { EventBus } from '../utils/EventBus';
import { EVENTS } from '../utils/constants';
import type { SpellSystem } from './SpellSystem';
import type { Player } from '../entities/Player';
import type { EnemySystem } from './EnemySystem';

const CARDINAL = [
  { dx:  0, dy: -1 },
  { dx:  0, dy:  1 },
  { dx: -1, dy:  0 },
  { dx:  1, dy:  0 },
];

const ALL_DIRS = [
  { dx:  0, dy: -1 },
  { dx:  0, dy:  1 },
  { dx: -1, dy:  0 },
  { dx:  1, dy:  0 },
  { dx: -1, dy: -1 },
  { dx:  1, dy: -1 },
  { dx: -1, dy:  1 },
  { dx:  1, dy:  1 },
];

export type SpellCastResult = {
  success: boolean;
  damage: number;
  heal?: number;
  spellName: string;
  hitEnemies: EnemySystem[];
};

function findTargets(
  px: number, py: number,
  enemies: EnemySystem[],
  areaType: string,
  range: number,
): EnemySystem[] {
  const hit = new Set<EnemySystem>();

  if (areaType === 'line') {
    for (const { dx, dy } of CARDINAL) {
      for (let r = 1; r <= range; r++) {
        const tx = px + dx * r;
        const ty = py + dy * r;
        for (const e of enemies) {
          if (e.alive && e.gridX === tx && e.gridY === ty) hit.add(e);
        }
      }
    }
  } else if (areaType === 'radial') {
    for (const { dx, dy } of ALL_DIRS) {
      for (let r = 1; r <= range; r++) {
        const tx = px + dx * r;
        const ty = py + dy * r;
        for (const e of enemies) {
          if (e.alive && e.gridX === tx && e.gridY === ty) hit.add(e);
        }
      }
    }
  } else {
    // adjacent (default, range=1)
    for (const { dx, dy } of CARDINAL) {
      const tx = px + dx;
      const ty = py + dy;
      for (const e of enemies) {
        if (e.alive && e.gridX === tx && e.gridY === ty) hit.add(e);
      }
    }
  }

  return [...hit];
}

export class SpellCastingSystem {
  cast(
    slotIndex: number,
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

    // WIS: reduz cooldown efetivo antes de checar se pode lançar
    const effectiveCooldown = slot.cooldownMs * (1 - (player.cdReduction ?? 0));
    const elapsed = nowMs - slot.lastCastMs;
    if (elapsed < effectiveCooldown) return null;

    if (player.mana < spell.manaCost) return null;

    const areaType = spell.areaType ?? 'adjacent';
    const range    = spell.range ?? 1;
    const targets  = findTargets(player.gridX, player.gridY, enemies, areaType, range);

    player.mana = Math.max(0, player.mana - spell.manaCost);
    EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: player.mana, maxMana: player.maxMana });
    spellSystem.recordCast(slotIndex, nowMs);
    EventBus.emit(EVENTS.SPELL_CAST, { slotIndex, spellId: spell.id });

    // Magia de cura: aplica no player, não nos inimigos
    if (spell.heal && spell.heal > 0) {
      const healed = Math.min(spell.heal, player.maxHp - player.hp);
      player.hp = Math.min(player.maxHp, player.hp + spell.heal);
      EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: player.hp, maxHp: player.maxHp });
      return { success: true, damage: 0, heal: healed, spellName: spell.name, hitEnemies: [] };
    }

    // INT: adiciona bônus de dano mágico flat
    const effectiveDamage = spell.damage + (player.spellBonus ?? 0);
    return { success: true, damage: effectiveDamage, spellName: spell.name, hitEnemies: targets };
  }
}
