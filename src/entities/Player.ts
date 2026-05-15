import * as Phaser from 'phaser';
import { PLAYER, TILE_SIZE, SPRITES, DAWNLIKE_FRAMES, EVENTS, BASE_STATS } from '../utils/constants';
import { EventBus } from '../utils/EventBus';
import { InventorySystem } from '../systems/InventorySystem';
import type { DungeonGenerator } from '../generators/DungeonGenerator';
import type { StatBonuses } from '../types/equipment';
import type { Direction } from '../types/spells';

export class Player extends Phaser.GameObjects.Sprite {
  // Posição no grid (tile-based)
  gridX: number;
  gridY: number;

  // Atributos base RPG
  str: number;
  intel: number;  // 'int' é palavra reservada em TS
  dex: number;
  con: number;
  wis: number;
  cha: number;

  // Atributos derivados
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  xp: number;
  level: number;
  attack: number;
  critChance = 0;   // DEX: chance de crítico (0–0.30)
  cdReduction = 0;  // WIS: redução de cooldown de magias (0–0.40)
  spellBonus = 0;   // INT: bônus de dano mágico flat

  // Inventário e identificação de itens
  inventory: InventorySystem;
  identifiedItems: Record<string, boolean>;

  // Moedas
  gold: number;

  // Progressão de magias
  freePoints:     number;
  unlockedSpells: string[];
  equippedSpells: [string | null, string | null];
  facingDir:      Direction;

  private _lastMoveTime: number;
  private _emitter: Phaser.Events.EventEmitter;
  private _equipmentBonuses: StatBonuses;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    const px = gridX * TILE_SIZE + TILE_SIZE / 2;
    const py = gridY * TILE_SIZE + TILE_SIZE / 2;

    super(scene, px, py, SPRITES.PLAYER, DAWNLIKE_FRAMES.PLAYER);

    scene.add.existing(this);
    this.setDepth(10);

    this.gridX = gridX;
    this.gridY = gridY;

    // Atributos base
    this.str   = BASE_STATS.STR;
    this.intel = BASE_STATS.INT;
    this.dex   = BASE_STATS.DEX;
    this.con   = BASE_STATS.CON;
    this.wis   = BASE_STATS.WIS;
    this.cha   = BASE_STATS.CHA;

    this.level  = 1;
    this.xp     = 0;
    this.attack = PLAYER.ATTACK;

    // Inicialização temporária antes do recalcStats
    this.maxHp = 0; this.maxMana = 0;
    this.recalcStats();
    this.hp   = this.maxHp;
    this.mana = this.maxMana;

    this._lastMoveTime    = 0;
    this._emitter         = scene.events;
    this._equipmentBonuses = {};

    // Inventário e identificação
    this.inventory       = new InventorySystem();
    this.identifiedItems = {};

    this.gold = 500;

    // Magias e pontos livres
    this.freePoints     = 0;
    this.unlockedSpells = [];
    this.equippedSpells = [null, null];
    this.facingDir      = 'down';
  }

  /** Recalcula todos os atributos derivados a partir dos stats base, nível e bônus de equipamento. */
  recalcStats(): void {
    // VIT (CON): cada ponto = 5 HP + bônus de nível
    this.maxHp = this.con * 5 + this.level * 3 + (this._equipmentBonuses.maxHp ?? 0);

    // WIS: peso maior para diferenciar de INT; INT contribui menos
    this.maxMana = this.wis * 5 + this.intel * 2;

    // STR: dano físico base + 0.8 por ponto acima de 10
    const strBonus = Math.floor((this.str - 10) * 0.8);
    this.attack = PLAYER.ATTACK + strBonus + (this._equipmentBonuses.attack ?? 0);

    // DEX: +1.5% de crítico por ponto acima de 10, cap 30%
    this.critChance = Math.min(Math.max((this.dex - 10) * 0.015, 0), 0.30);

    // WIS: +2% de redução de cooldown por ponto acima de 10, cap 40%
    this.cdReduction = Math.min(Math.max((this.wis - 10) * 0.02, 0), 0.40);

    // INT: +1.2 de dano mágico flat por ponto acima de 10
    this.spellBonus = Math.floor(Math.max((this.intel - 10) * 1.2, 0));

    this.hp   = Math.min(this.hp,   this.maxHp);
    this.mana = Math.min(this.mana, this.maxMana);
  }

  applyEquipmentBonuses(bonuses: StatBonuses): void {
    for (const key of Object.keys(bonuses) as Array<keyof StatBonuses>) {
      this._equipmentBonuses[key] = (this._equipmentBonuses[key] ?? 0) + (bonuses[key] ?? 0);
    }
    this.recalcStats();
  }

  removeEquipmentBonuses(bonuses: StatBonuses): void {
    for (const key of Object.keys(bonuses) as Array<keyof StatBonuses>) {
      this._equipmentBonuses[key] = (this._equipmentBonuses[key] ?? 0) - (bonuses[key] ?? 0);
    }
    this.recalcStats();
  }

  tryMove(
    dx: number,
    dy: number,
    dungeon: DungeonGenerator,
    enemies: Array<{ alive: boolean; gridX: number; gridY: number }>,
    now: number,
  ): { moved: boolean; enemy: { alive: boolean; gridX: number; gridY: number } | null } {
    if (now - this._lastMoveTime < PLAYER.MOVE_COOLDOWN) {
      return { moved: false, enemy: null };
    }

    const targetX = this.gridX + dx;
    const targetY = this.gridY + dy;

    if (!dungeon.isWalkable(targetX, targetY)) {
      return { moved: false, enemy: null };
    }

    const enemyAtTarget = enemies.find(
      (e) => e.alive && e.gridX === targetX && e.gridY === targetY,
    ) ?? null;

    if (enemyAtTarget) {
      return { moved: false, enemy: enemyAtTarget };
    }

    this.gridX = targetX;
    this.gridY = targetY;
    this._lastMoveTime = now;

    if (dx > 0)      this.facingDir = 'right';
    else if (dx < 0) this.facingDir = 'left';
    else if (dy > 0) this.facingDir = 'down';
    else if (dy < 0) this.facingDir = 'up';

    this.setPosition(
      this.gridX * TILE_SIZE + TILE_SIZE / 2,
      this.gridY * TILE_SIZE + TILE_SIZE / 2,
    );

    this._emitter.emit(EVENTS.PLAYER_MOVED, { x: this.gridX, y: this.gridY });
    return { moved: true, enemy: null };
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: this.hp, maxHp: this.maxHp });
    if (this.hp <= 0) {
      this._emitter.emit(EVENTS.PLAYER_DIED, this);
    }
  }

  spendStatPoint(stat: 'str' | 'intel' | 'dex' | 'con' | 'wis'): boolean {
    if (this.freePoints <= 0) return false;
    this[stat] += 1;
    this.freePoints -= 1;
    this.recalcStats();
    EventBus.emit(EVENTS.STAT_POINT_SPENT, { stat, value: this[stat], freePoints: this.freePoints });
    return true;
  }

  useMana(amount: number): boolean {
    if (this.mana < amount) return false;
    this.mana = Math.max(0, this.mana - amount);
    EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: this.mana, maxMana: this.maxMana });
    return true;
  }

  getPixelPos(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  reset(gridX: number, gridY: number): void {
    this.gridX = gridX;
    this.gridY = gridY;
    this.level  = 1;
    this.xp     = 0;
    this.attack = PLAYER.ATTACK;

    this.recalcStats();
    this.hp   = this.maxHp;
    this.mana = this.maxMana;

    this._lastMoveTime = 0;

    // Resetar inventário, identificação e bônus de equipamento
    this.inventory.reset();
    this.identifiedItems   = {};
    this._equipmentBonuses = {};
    this.gold = 500;

    // Resetar progressão de magias
    this.freePoints     = 0;
    this.unlockedSpells = [];
    this.equippedSpells = [null, null];
    this.facingDir      = 'down';

    this.setPosition(
      gridX * TILE_SIZE + TILE_SIZE / 2,
      gridY * TILE_SIZE + TILE_SIZE / 2,
    );
  }
}
