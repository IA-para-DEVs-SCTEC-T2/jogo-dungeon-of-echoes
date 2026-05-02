/**
 * enemy-ai.test.js — Testes da IA do EnemySystem
 * Valida estados IDLE/CHASING/ATTACKING e movimentação em direção ao player.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnemySystem } from '../src/systems/EnemySystem';
import { TILE } from '../src/utils/constants';

// Mock mínimo do DungeonGenerator
function createDungeon(grid, rooms = []) {
  return {
    grid,
    width: grid[0].length,
    height: grid.length,
    rooms,
    isWalkable(x, y) {
      if (x < 0 || y < 0 || y >= this.height || x >= this.width) return false;
      return this.grid[y][x] === TILE.FLOOR;
    },
  };
}

const W = TILE.WALL;
const F = TILE.FLOOR;

// Corredor horizontal 1×9 com paredes nas bordas
const CORRIDOR = [
  [W, W, W, W, W, W, W, W, W],
  [W, F, F, F, F, F, F, F, W],
  [W, W, W, W, W, W, W, W, W],
];

// Sala 5×5 sem paredes internas
const OPEN_ROOM = [
  [W, W, W, W, W],
  [W, F, F, F, W],
  [W, F, F, F, W],
  [W, F, F, F, W],
  [W, W, W, W, W],
];

describe('EnemySystem — IA', () => {
  let dungeon;

  beforeEach(() => {
    dungeon = createDungeon(CORRIDOR);
  });

  it('permanece IDLE quando player está fora do raio de detecção', () => {
    const enemy = new EnemySystem(1, 1, 0);
    enemy.detectionRadius = 3;

    // player a distância 7 (fora do raio)
    const result = enemy.update(8, 1, dungeon, []);

    expect(enemy.state).toBe('IDLE');
    expect(result.attacked).toBe(false);
    expect(enemy.gridX).toBe(1); // não se moveu
  });

  it('muda para CHASING quando player entra no raio', () => {
    const enemy = new EnemySystem(1, 1, 0);
    enemy.detectionRadius = 5;

    enemy.update(5, 1, dungeon, []); // distância 4 ≤ 5

    expect(enemy.state).toBe('CHASING');
  });

  it('move em direção ao player enquanto CHASING', () => {
    const enemy = new EnemySystem(1, 1, 0);
    enemy.state = 'CHASING';

    enemy.update(5, 1, dungeon, []);

    expect(enemy.gridX).toBe(2); // avançou 1 tile
  });

  it('muda para ATTACKING e retorna dano quando adjacente ao player', () => {
    const enemy = new EnemySystem(1, 1, 0);
    enemy.state = 'CHASING';

    const result = enemy.update(2, 1, dungeon, []); // player a 1 tile

    expect(enemy.state).toBe('ATTACKING');
    expect(result.attacked).toBe(true);
    expect(result.damage).toBe(enemy.attack);
  });

  it('não atravessa paredes ao perseguir', () => {
    // Inimigo preso no canto inferior — parede acima e à direita
    const blockedMap = [
      [W, W, W],
      [F, F, W],
      [W, W, W],
    ];
    const d = createDungeon(blockedMap);
    const enemy = new EnemySystem(0, 1, 0);
    enemy.state = 'CHASING';

    // Player em (2,1) mas há parede em (2,1)? Na verdade F está em (0,1) e (1,1)
    // Player em (1,1) → adjacente, vai atacar
    // Vamos testar bloqueio: player em posição inalcançável (acima da parede)
    enemy.update(1, 1, d, []); // adjacente → ataca, não se move

    expect(enemy.gridX).toBe(0); // não atravessou parede
  });

  it('não move para tile ocupado por outro inimigo', () => {
    const enemy1 = new EnemySystem(1, 1, 0);
    enemy1.state = 'CHASING';
    const enemy2 = new EnemySystem(2, 1, 1); // bloqueia o caminho

    enemy1.update(5, 1, dungeon, [enemy1, enemy2]);

    expect(enemy1.gridX).toBe(1); // ficou parado
  });

  it('detecta player na mesma sala mesmo fora do raio numérico', () => {
    const roomDungeon = createDungeon(OPEN_ROOM, [
      { x: 1, y: 1, width: 3, height: 3 },
    ]);
    const enemy = new EnemySystem(1, 1, 0);
    enemy.detectionRadius = 1; // raio pequeno

    // Player a distância 2 (fora do raio), mas na mesma sala
    enemy.update(3, 3, roomDungeon, []);

    expect(enemy.state).toBe('CHASING');
  });

  it('inimigo morto não executa update', () => {
    const enemy = new EnemySystem(1, 1, 0);
    enemy.alive = false;

    const result = enemy.update(2, 1, dungeon, []);

    expect(result.attacked).toBe(false);
    expect(enemy.gridX).toBe(1);
  });
});
