import { TILE_SIZE, EVENTS } from '../utils/constants';
import { EventBus } from '../utils/EventBus';
import type { Player } from '../entities/Player';
import type { EnemySystem } from './EnemySystem';
import type { CombatSystem } from './CombatSystem';
import type { DungeonGenerator } from '../generators/DungeonGenerator';

export type Action =
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'ATTACK'; target: EnemySystem }
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
      }
    } else if (action.type === 'ATTACK') {
      const target = action.target;
      const atk = combat.attack(player, target);
      if (atk.hit) {
        target.hp = Math.max(0, target.hp - atk.damage);
        result.messages.push(`Você atacou e causou ${atk.damage} de dano`);
        if (target.hp <= 0) {
          target.alive = false;
          result.enemiesDied.push(target);
          result.messages.push('Inimigo morreu');
          combat['xpSystem']?.addXP(player, target.xpReward);
        }
      } else {
        result.messages.push('Você errou o ataque');
      }
    }
    // WAIT: não faz nada

    // ─── Turno dos inimigos ─────────────────────────────────────────────────
    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const ai = enemy.update(player.gridX, player.gridY, dungeon, enemies);

      if (ai.attacked) {
        const atk = combat.attack(enemy, player);
        if (atk.hit) {
          player.hp = Math.max(0, player.hp - atk.damage);
          EventBus.emit(EVENTS.PLAYER_HP_CHANGED, { hp: player.hp, maxHp: player.maxHp });
          result.messages.push(`Inimigo atacou você por ${atk.damage}`);
          if (player.hp <= 0) {
            result.playerDied = true;
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
