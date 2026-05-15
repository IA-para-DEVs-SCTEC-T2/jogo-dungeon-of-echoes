/**
 * spell-system.test.js — Testes do SpellSystem e SpellCastingSystem
 *
 * SpellSystem: gerencia desbloqueio, equipamento e cooldown dos slots J/K.
 * SpellCastingSystem: valida mana/cooldown, aplica dano nos 4 tiles adjacentes.
 *
 * COMO RODAR:
 *   npm test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpellSystem } from '../src/systems/SpellSystem';
import { SpellCastingSystem } from '../src/systems/SpellCastingSystem';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePlayer(overrides = {}) {
  return {
    unlockedSpells: [],
    equippedSpells: [null, null],
    gridX: 5,
    gridY: 5,
    mana: 50,
    maxMana: 50,
    ...overrides,
  };
}

function makeEnemy(gridX, gridY, hp = 30) {
  return { gridX, gridY, hp, maxHp: hp, alive: true };
}

// ─── SpellSystem ──────────────────────────────────────────────────────────────

describe('SpellSystem — desbloqueio por nível', () => {
  let spellSystem;
  beforeEach(() => {
    spellSystem = new SpellSystem();
  });

  it('desbloqueia fire_bolt no nível 1', () => {
    const player = makePlayer();
    const added = spellSystem.unlockSpellsForLevel(player, 1);
    expect(added).toContain('fire_bolt');
    expect(player.unlockedSpells).toContain('fire_bolt');
  });

  it('desbloqueia ice_shard no nível 5', () => {
    const player = makePlayer();
    spellSystem.unlockSpellsForLevel(player, 5);
    expect(player.unlockedSpells).toContain('ice_shard');
  });

  it('não adiciona magia duplicada se já desbloqueada', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt'] });
    const added = spellSystem.unlockSpellsForLevel(player, 1);
    expect(added).toHaveLength(0);
    expect(player.unlockedSpells.filter(s => s === 'fire_bolt')).toHaveLength(1);
  });

  it('não desbloqueia nada para nível sem progressão definida', () => {
    const player = makePlayer();
    const added = spellSystem.unlockSpellsForLevel(player, 99);
    expect(added).toHaveLength(0);
  });
});

describe('SpellSystem — equipamento de magias', () => {
  let spellSystem;
  beforeEach(() => {
    spellSystem = new SpellSystem();
  });

  it('equipa magia desbloqueada no slot 0 (J)', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt'] });
    const ok = spellSystem.equipSpell(player, 'fire_bolt', 0);
    expect(ok).toBe(true);
    expect(player.equippedSpells[0]).toBe('fire_bolt');
  });

  it('equipa magia desbloqueada no slot 1 (K)', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt', 'ice_shard'] });
    spellSystem.equipSpell(player, 'ice_shard', 1);
    expect(player.equippedSpells[1]).toBe('ice_shard');
  });

  it('recusa equipar magia não desbloqueada', () => {
    const player = makePlayer();
    const ok = spellSystem.equipSpell(player, 'blizzard', 0);
    expect(ok).toBe(false);
    expect(player.equippedSpells[0]).toBeNull();
  });

  it('desequipa slot ao chamar unequipSpell', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt'] });
    spellSystem.equipSpell(player, 'fire_bolt', 0);
    spellSystem.unequipSpell(player, 0);
    expect(player.equippedSpells[0]).toBeNull();
  });
});

describe('SpellSystem — cooldown', () => {
  let spellSystem;
  beforeEach(() => {
    spellSystem = new SpellSystem();
  });

  it('slot sem magia não está pronto para cast', () => {
    expect(spellSystem.canCast(0, 1000)).toBe(false);
  });

  it('slot com magia está pronto antes do primeiro cast', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt'] });
    spellSystem.equipSpell(player, 'fire_bolt', 0);
    expect(spellSystem.canCast(0, 1000)).toBe(true);
  });

  it('slot não está pronto imediatamente após cast', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt'] });
    spellSystem.equipSpell(player, 'fire_bolt', 0);
    spellSystem.recordCast(0, 1000);
    expect(spellSystem.canCast(0, 1001)).toBe(false);
  });

  it('slot fica pronto após cooldown completo', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt'] });
    spellSystem.equipSpell(player, 'fire_bolt', 0);
    spellSystem.recordCast(0, 1000);
    // fire_bolt cooldown = 800ms
    expect(spellSystem.canCast(0, 1800)).toBe(true);
  });
});

// ─── SpellCastingSystem ───────────────────────────────────────────────────────

describe('SpellCastingSystem — cast bem-sucedido', () => {
  let spellSystem;
  let castingSystem;
  let player;

  beforeEach(() => {
    spellSystem = new SpellSystem();
    castingSystem = new SpellCastingSystem();
    player = makePlayer({ unlockedSpells: ['fire_bolt'], mana: 50 });
    spellSystem.equipSpell(player, 'fire_bolt', 0);
  });

  it('retorna resultado de sucesso com dano correto', () => {
    const enemies = [makeEnemy(5, 4)]; // adjacent (north)
    const result = castingSystem.cast(0, player, spellSystem, enemies, 1000);
    expect(result).not.toBeNull();
    expect(result.success).toBe(true);
    expect(result.damage).toBe(15); // fire_bolt damage
  });

  it('desconta mana ao cast', () => {
    const enemies = [];
    castingSystem.cast(0, player, spellSystem, enemies, 1000);
    expect(player.mana).toBe(42); // 50 - 8 (fire_bolt manaCost)
  });

  it('inclui todos os inimigos adjacentes nos 4 cardinais', () => {
    const enemies = [
      makeEnemy(5, 4), // norte
      makeEnemy(5, 6), // sul
      makeEnemy(4, 5), // oeste
      makeEnemy(6, 5), // leste
    ];
    const result = castingSystem.cast(0, player, spellSystem, enemies, 1000);
    expect(result.hitEnemies).toHaveLength(4);
  });

  it('não inclui inimigos não adjacentes', () => {
    const enemies = [makeEnemy(5, 3), makeEnemy(8, 5)]; // fora do alcance
    const result = castingSystem.cast(0, player, spellSystem, enemies, 1000);
    expect(result.hitEnemies).toHaveLength(0);
  });

  it('não inclui inimigos mortos', () => {
    const dead = makeEnemy(5, 4);
    dead.alive = false;
    const result = castingSystem.cast(0, player, spellSystem, [dead], 1000);
    expect(result.hitEnemies).toHaveLength(0);
  });
});

describe('SpellCastingSystem — falhas de cast', () => {
  let spellSystem;
  let castingSystem;

  beforeEach(() => {
    spellSystem = new SpellSystem();
    castingSystem = new SpellCastingSystem();
  });

  it('retorna null se mana insuficiente', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt'], mana: 5 }); // fire_bolt custa 8
    spellSystem.equipSpell(player, 'fire_bolt', 0);
    const result = castingSystem.cast(0, player, spellSystem, [], 1000);
    expect(result).toBeNull();
    expect(player.mana).toBe(5); // mana não alterada
  });

  it('retorna null se cooldown ativo', () => {
    const player = makePlayer({ unlockedSpells: ['fire_bolt'], mana: 50 });
    spellSystem.equipSpell(player, 'fire_bolt', 0);
    castingSystem.cast(0, player, spellSystem, [], 1000); // primeiro cast OK
    player.mana = 50; // restaura mana para isolar o cooldown
    const result = castingSystem.cast(0, player, spellSystem, [], 1001); // cooldown ativo
    expect(result).toBeNull();
  });

  it('retorna null se slot sem magia equipada', () => {
    const player = makePlayer({ mana: 50 });
    const result = castingSystem.cast(0, player, spellSystem, [], 1000);
    expect(result).toBeNull();
  });
});
