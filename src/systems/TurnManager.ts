import { TILE_SIZE, EVENTS, INVENTORY, DEV_CONFIG } from '../utils/constants';
import { EventBus } from '../utils/EventBus';
import { ClassRulesEngine } from './ClassRulesEngine';
import type { Player } from '../entities/Player';
import type { EnemySystem } from './EnemySystem';
import type { CombatSystem } from './CombatSystem';
import type { DungeonGenerator } from '../generators/DungeonGenerator';
import type { PlayerMetrics } from './PlayerMetrics';

export type Action =
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'ATTACK'; target: EnemySystem }
  | { type: 'USE_ITEM'; itemIndex: number }
  | { type: 'WAIT' };

export interface TurnResult {
  messages: string[];
  playerMoved: boolean;
  playerDied: boolean;
  enemiesDied: EnemySystem[];
}

export class TurnManager {
  private playerTurn = true;

  isPlayerTurn(): boolean {
    return this.playerTurn;
  }

  processPlayerAction(
    action: Action,
    player: Player,
    enemies: EnemySystem[],
    dungeon: DungeonGenerator,
    combat: CombatSystem,
    metrics?: PlayerMetrics,
  ): TurnResult {
    const result: TurnResult = {
      messages: [],
      playerMoved: false,
      playerDied: false,
      enemiesDied: [],
    };

    if (!this.playerTurn) return result;

    this.playerTurn = false;

    // ─── Ação do jogador ────────────────────────────────────────────────────
    if (action.type === 'MOVE') {
      const tx = player.gridX + action.dx;
      const ty = player.gridY + action.dy;
      if (dungeon.isWalkable(tx, ty)) {
        player.gridX = tx;
        player.gridY = ty;
        player.setPosition(tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2);
        result.playerMoved = true;
        metrics?.recordTurn();
      }
    } else if (action.type === 'ATTACK') {
      const target = action.target;

      // Verificar se a classe pode atacar (Mago não pode corpo a corpo; Arqueiro precisa de flechas)
      if (!ClassRulesEngine.canMelee(player.classDef) && !player.classDef.usesArrows) {
        result.messages.push(`${player.classDef.label} não pode atacar corpo a corpo. Use magias!`);
        this.playerTurn = true;
        return result;
      }
      if (!ClassRulesEngine.canAttack(player.classDef, player.arrows)) {
        result.messages.push('Sem flechas! Compre mais na loja.');
        this.playerTurn = true;
        return result;
      }

      const atk = combat.attack(player, target);
      if (atk.hit) {
        target.hp = Math.max(0, target.hp - atk.damage);
        metrics?.recordDamageDealt(atk.damage);
        const verb = player.classDef.usesArrows ? 'atirou e causou' : 'atacou e causou';
        result.messages.push(`Você ${verb} ${atk.damage} de dano`);
        // Consumir flecha
        if (player.classDef.usesArrows) {
          player.arrows = Math.max(0, player.arrows - 1);
          EventBus.emit(EVENTS.ARROWS_CHANGED, { arrows: player.arrows });
        }
        if (target.hp <= 0) {
          target.alive = false;
          result.enemiesDied.push(target);
          result.messages.push('Inimigo morreu');
          metrics?.recordEnemyKilled();
          combat['xpSystem']?.addXP(player, target.xpReward);
        }
      } else {
        result.messages.push('Você errou o ataque');
      }
    } else if (action.type === 'USE_ITEM') {
      const useResult = player.inventory.useItem(
        action.itemIndex,
        player.identifiedItems,
        player.hp,
        player.maxHp,
        player.mana,
        player.maxMana,
      );

      if (useResult.success) {
        if (useResult.hpDelta !== 0) {
          player.hp = Math.max(0, Math.min(player.maxHp, player.hp + useResult.hpDelta));
          EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: player.hp, maxHp: player.maxHp });
          if (player.hp <= 0) {
            result.playerDied = true;
            result.messages.push('Você morreu');
          }
        }
        if (useResult.manaDelta !== 0) {
          player.mana = Math.max(0, Math.min(player.maxMana, player.mana + useResult.manaDelta));
          EventBus.emit(EVENTS.PLAYER_MANA_CHANGED, { mana: player.mana, maxMana: player.maxMana });
        }
        metrics?.recordItemUsed();
        result.messages.push(...useResult.messages);
        EventBus.emit(EVENTS.ITEM_USED, { itemIndex: action.itemIndex });
      } else {
        result.messages.push(...useResult.messages);
      }
    }

    // ─── Turno dos inimigos ─────────────────────────────────────────────────
    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const ai = enemy.update(player.gridX, player.gridY, dungeon, enemies, player.classDef);

      if (ai.attacked) {
        const atk = combat.attack(enemy, player);
        if (atk.hit) {
          const rawDmg = atk.damage;
          const reduced = Math.max(1, Math.round(rawDmg * ClassRulesEngine.physicalDamageMultiplier(player.classDef)));
          if (!DEV_CONFIG.godMode) player.hp = Math.max(0, player.hp - reduced);
          metrics?.recordDamageTaken(reduced);
          EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: player.hp, maxHp: player.maxHp });
          result.messages.push(`Inimigo atacou você por ${reduced}`);
          if (player.hp <= 0) {
            result.playerDied = true;
            metrics?.recordDeath();
            result.messages.push('Você morreu');
          }
        } else {
          result.messages.push('Inimigo errou');
        }
      }

      if (result.playerDied) break;
    }

    this.playerTurn = true;
    return result;
  }
}
