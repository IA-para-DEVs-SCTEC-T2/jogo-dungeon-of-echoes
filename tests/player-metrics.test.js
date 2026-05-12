/**
 * player-metrics.test.js — Testes do PlayerMetrics
 *
 * O PlayerMetrics rastreia o desempenho do jogador durante a partida:
 * quantos turnos sobreviveu, quanto dano causou, quanto recebeu, etc.
 * Esses dados alimentam o sistema de dificuldade adaptativa do jogo.
 *
 * COMO LER ESTE ARQUIVO:
 * - Cada describe() é um grupo de testes relacionados
 * - Cada it() é um cenário específico que queremos verificar
 * - beforeEach() cria um PlayerMetrics novo antes de cada teste
 *
 * REFERÊNCIA:
 *   src/systems/PlayerMetrics.ts — o código que estamos testando
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerMetrics } from '../src/systems/PlayerMetrics';

// ─── Configuração ─────────────────────────────────────────────────────────────
let metrics;
beforeEach(() => {
  metrics = new PlayerMetrics();
});

// ─── Grupo 1: Estado inicial ──────────────────────────────────────────────────
describe('PlayerMetrics — estado inicial', () => {

  // TESTE GUIA 1: quando criado, tudo começa em zero
  it('começa com todos os contadores zerados', () => {
    expect(metrics.turnsSurvived).toBe(0);
    expect(metrics.damageDealt).toBe(0);
    expect(metrics.damageTaken).toBe(0);
    expect(metrics.enemiesKilled).toBe(0);
    expect(metrics.itemsUsed).toBe(0);
    expect(metrics.deaths).toBe(0);
  });

});

// ─── Grupo 2: Registrar eventos ───────────────────────────────────────────────
describe('PlayerMetrics — registrar eventos', () => {

  // TESTE GUIA 2: recordTurn incrementa turnsSurvived
  it('recordTurn incrementa o contador de turnos', () => {
    metrics.recordTurn();
    metrics.recordTurn();
    metrics.recordTurn();

    expect(metrics.turnsSurvived).toBe(3);
  });

  // TESTE GUIA 3: recordDamageDealt acumula o dano causado
  it('recordDamageDealt acumula o dano causado', () => {
    metrics.recordDamageDealt(10);
    metrics.recordDamageDealt(15);

    expect(metrics.damageDealt).toBe(25);
  });

  // TESTE GUIA 4: recordDamageTaken acumula o dano recebido
  it('recordDamageTaken acumula o dano recebido', () => {
    metrics.recordDamageTaken(8);
    metrics.recordDamageTaken(5);

    expect(metrics.damageTaken).toBe(13);
  });

  // ✏️ EXERCÍCIO 1 — Complete este teste:
  // Verifique que recordEnemyKilled incrementa enemiesKilled
  it('recordEnemyKilled incrementa o contador de inimigos mortos', () => {
    // DICA: chame metrics.recordEnemyKilled() algumas vezes
    // DICA: verifique metrics.enemiesKilled
    // ESCREVA SEU CÓDIGO AQUI:

  });

  // ✏️ EXERCÍCIO 2 — Complete este teste:
  // Verifique que recordItemUsed incrementa itemsUsed
  it('recordItemUsed incrementa o contador de itens usados', () => {
    // ESCREVA SEU CÓDIGO AQUI:

  });

  // ✏️ EXERCÍCIO 3 — Complete este teste:
  // Verifique que recordDeath incrementa deaths
  it('recordDeath incrementa o contador de mortes', () => {
    // ESCREVA SEU CÓDIGO AQUI:

  });

});

// ─── Grupo 3: Score de performance ───────────────────────────────────────────
describe('PlayerMetrics — getPerformanceScore', () => {

  // TESTE GUIA 5: score começa em 0 quando não há dados
  it('retorna 0 quando não há dados registrados', () => {
    const score = metrics.getPerformanceScore();
    expect(score).toBe(0);
  });

  // TESTE GUIA 6: score é positivo quando o jogador está indo bem
  it('retorna score positivo quando jogador causa muito dano e mata inimigos', () => {
    metrics.recordDamageDealt(100);
    metrics.recordEnemyKilled();
    metrics.recordEnemyKilled();
    metrics.recordEnemyKilled();

    const score = metrics.getPerformanceScore();

    // Score deve ser positivo (jogador está indo bem)
    expect(score).toBeGreaterThan(0);
  });

  // TESTE GUIA 7: score é negativo quando o jogador toma muito dano e morre
  it('retorna score negativo quando jogador toma muito dano e morre', () => {
    metrics.recordDamageTaken(200);
    metrics.recordDeath();
    metrics.recordDeath();

    const score = metrics.getPerformanceScore();

    // Score deve ser negativo (jogador está com dificuldade)
    expect(score).toBeLessThan(0);
  });

  // TESTE GUIA 8: score nunca ultrapassa os limites -100 e +100
  it('score nunca ultrapassa +100', () => {
    // Simular um jogador absurdamente bom
    for (let i = 0; i < 100; i++) {
      metrics.recordDamageDealt(1000);
      metrics.recordEnemyKilled();
      metrics.recordTurn();
    }

    const score = metrics.getPerformanceScore();
    expect(score).toBeLessThanOrEqual(100);
  });

  // ✏️ EXERCÍCIO 4 — Complete este teste:
  // Verifique que o score nunca fica abaixo de -100
  it('score nunca fica abaixo de -100', () => {
    // DICA: simule um jogador que toma muito dano e morre várias vezes
    // DICA: use um loop como no teste acima
    // ESCREVA SEU CÓDIGO AQUI:

  });

});

// ─── Grupo 4: Score recente (janela deslizante) ───────────────────────────────
describe('PlayerMetrics — getRecentPerformanceScore', () => {

  // TESTE GUIA 9: score recente reflete apenas os últimos eventos
  it('retorna 0 quando não há dados recentes', () => {
    const score = metrics.getRecentPerformanceScore();
    expect(score).toBe(0);
  });

  // TESTE GUIA 10: score recente é positivo quando jogador causa mais dano do que recebe
  it('é positivo quando jogador causa mais dano do que recebe recentemente', () => {
    metrics.recordDamageDealt(50);  // causou 50
    metrics.recordDamageTaken(10); // recebeu apenas 10

    const score = metrics.getRecentPerformanceScore();
    expect(score).toBeGreaterThan(0);
  });

  // ✏️ EXERCÍCIO 5 — Complete este teste:
  // Verifique que o score recente é negativo quando o jogador recebe mais dano do que causa
  it('é negativo quando jogador recebe mais dano do que causa recentemente', () => {
    // DICA: recordDamageTaken com valor alto, recordDamageDealt com valor baixo
    // ESCREVA SEU CÓDIGO AQUI:

  });

});

// ─── Grupo 5: reset ───────────────────────────────────────────────────────────
describe('PlayerMetrics — reset', () => {

  // TESTE GUIA 11: reset zera todos os contadores
  it('reset zera todos os contadores', () => {
    // Primeiro, registrar alguns eventos
    metrics.recordTurn();
    metrics.recordTurn();
    metrics.recordDamageDealt(50);
    metrics.recordDamageTaken(30);
    metrics.recordEnemyKilled();
    metrics.recordDeath();

    // Agora resetar
    metrics.reset();

    // Tudo deve voltar a zero
    expect(metrics.turnsSurvived).toBe(0);
    expect(metrics.damageDealt).toBe(0);
    expect(metrics.damageTaken).toBe(0);
    expect(metrics.enemiesKilled).toBe(0);
    expect(metrics.deaths).toBe(0);
  });

  // ✏️ EXERCÍCIO 6 — Complete este teste:
  // Verifique que o score volta a 0 após reset
  it('getPerformanceScore retorna 0 após reset', () => {
    metrics.recordDamageDealt(100);
    metrics.recordEnemyKilled();

    metrics.reset();

    // DICA: chame getPerformanceScore() e verifique que é 0
    // ESCREVA SEU CÓDIGO AQUI:

  });

  // ✏️ EXERCÍCIO 7 — Complete este teste:
  // Verifique que é possível registrar eventos normalmente após reset
  it('permite registrar eventos normalmente após reset', () => {
    metrics.recordTurn();
    metrics.reset();

    // DICA: registre um novo turno e verifique que turnsSurvived é 1
    // ESCREVA SEU CÓDIGO AQUI:

  });

});
