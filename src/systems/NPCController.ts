import * as Phaser from 'phaser';
import { TILE_SIZE, TILE } from '../utils/constants';
import { LAYER_WORLD_BASE } from '../config/sprites-config';
import type { NPCInstanceDef, NPCStateId } from '../types/town';

interface NPCInstance {
  def:       NPCInstanceDef;
  sprite:    Phaser.GameObjects.Sprite;
  state:     NPCStateId;
  gridX:     number;
  gridY:     number;
  stepCount: number;
  timer:     number;
}

const IDLE_DURATION    = 2000; // ms before wandering (reserved — wander disabled)
const MOVE_DELAY       = 400;  // ms between wander steps (reserved)
const MAX_WANDER_STEPS = 4;    // steps before returning to idle (reserved)

export class NPCController {
  private _npcs:     NPCInstance[] = [];
  private _occupied: Set<string>   = new Set();

  /**
   * Cria sprites para todos os NPCs definidos e registra suas posições no grid de ocupação.
   * @param scene - Cena Phaser onde os sprites serão adicionados
   * @param defs  - Definições de instâncias de NPC vindas do ProcessedTownLayout
   * @returns Array de sprites criados
   */
  spawn(scene: Phaser.Scene, defs: NPCInstanceDef[]): Phaser.GameObjects.Sprite[] {
    this._npcs     = [];
    this._occupied = new Set();
    const sprites: Phaser.GameObjects.Sprite[] = [];

    for (const raw of defs) {
      // Garante que todo NPC tenha uma interação padrão
      const def: NPCInstanceDef = {
        ...raw,
        interaction: raw.interaction ?? { type: 'dialogue', message: 'hi' },
      };

      const px = def.gridX * TILE_SIZE + TILE_SIZE / 2;
      const py = def.gridY * TILE_SIZE + TILE_SIZE / 2;
      const sprite = scene.add
        .sprite(px, py, def.sprite, def.frame)
        .setDepth(LAYER_WORLD_BASE + def.gridY * 10)
        .setScrollFactor(1);

      this._npcs.push({
        def,
        sprite,
        state:     'idle',
        gridX:     def.gridX,
        gridY:     def.gridY,
        stepCount: 0,
        timer:     IDLE_DURATION * Math.random(), // stagger start times (reserved for wander)
      });
      this._occupied.add(`${def.gridX},${def.gridY}`);
      sprites.push(sprite);
    }

    return sprites;
  }

  /**
   * Retorna a definição do NPC posicionado na célula (gx, gy), ou null se vazia.
   */
  getNPCAt(gx: number, gy: number): NPCInstanceDef | null {
    return this._npcs.find(n => n.gridX === gx && n.gridY === gy)?.def ?? null;
  }

  /** Retorna as definições de todos os NPCs carregados. */
  getAllNPCs(): NPCInstanceDef[] {
    return this._npcs.map(n => ({ ...n.def, gridX: n.gridX, gridY: n.gridY }));
  }

  /**
   * Retorna true se a célula (gx, gy) está ocupada por algum NPC.
   * @param gx - Coluna do grid
   * @param gy - Linha do grid
   */
  isTileOccupied(gx: number, gy: number): boolean {
    return this._occupied.has(`${gx},${gy}`);
  }

  /**
   * Reservado para re-habilitação futura do wander FSM.
   * Atualmente é um no-op — todos os NPCs permanecem idle indefinidamente.
   * @param _delta - Tempo em ms desde o último frame
   * @param _grid  - Grid de colisão da área atual
   */
  update(delta: number, grid: number[][]): void {
    for (const npc of this._npcs) {
      if (!npc.def.wanderBounds) continue;
      npc.timer -= delta;
      if (npc.timer > 0) continue;
      if (npc.state === 'idle') {
        npc.state = 'wander'; npc.stepCount = 0; npc.timer = MOVE_DELAY;
      } else {
        this._wanderStep(npc, grid);
        npc.stepCount++;
        if (npc.stepCount >= MAX_WANDER_STEPS) { npc.state = 'idle'; npc.timer = IDLE_DURATION; }
        else { npc.timer = MOVE_DELAY; }
      }
    }
  }

  private _wanderStep(npc: NPCInstance, grid: number[][]): void {
    const bounds = npc.def.wanderBounds!;
    const dirs = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    ].filter(d => {
      const nx = npc.gridX + d.dx;
      const ny = npc.gridY + d.dy;
      return (
        nx >= bounds.minX && nx <= bounds.maxX &&
        ny >= bounds.minY && ny <= bounds.maxY &&
        grid[ny]?.[nx] === TILE.FLOOR
      );
    });

    if (dirs.length === 0) return;

    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    this._occupied.delete(`${npc.gridX},${npc.gridY}`);
    npc.gridX += dir.dx;
    npc.gridY += dir.dy;
    this._occupied.add(`${npc.gridX},${npc.gridY}`);

    const px = npc.gridX * TILE_SIZE + TILE_SIZE / 2;
    const py = npc.gridY * TILE_SIZE + TILE_SIZE / 2;
    npc.sprite.setPosition(px, py);
    npc.sprite.setDepth(LAYER_WORLD_BASE + npc.gridY * 10);
  }

  /** Destrói todos os sprites de NPC gerenciados por este controller. */
  destroy(): void {
    this._npcs.forEach(n => n.sprite.destroy());
    this._npcs     = [];
    this._occupied = new Set();
  }
}

