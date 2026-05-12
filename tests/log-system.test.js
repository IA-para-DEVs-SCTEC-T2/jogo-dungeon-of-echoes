/**
 * log-system.test.js — Testes do LogSystem
 *
 * O LogSystem é responsável por guardar as mensagens que aparecem
 * no canto inferior esquerdo do jogo (log de combate, itens, etc.)
 *
 * COMO LER ESTE ARQUIVO:
 * - describe() agrupa testes relacionados (como uma "pasta")
 * - it() é um teste individual — leia o texto como uma frase:
 *   "it should add a message to the buffer" = "ele deve adicionar uma mensagem ao buffer"
 * - expect() verifica se o resultado é o esperado
 *
 * COMO RODAR:
 *   npm test
 *
 * REFERÊNCIA:
 *   src/systems/LogSystem.ts — o código que estamos testando
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LogSystem } from '../src/systems/LogSystem';

// ─── Configuração ─────────────────────────────────────────────────────────────
// beforeEach() roda antes de CADA teste, garantindo que cada um começa limpo
let log;
beforeEach(() => {
  log = new LogSystem(10); // criamos um LogSystem com máximo de 10 mensagens
});

// ─── Grupo 1: Adicionar mensagens ─────────────────────────────────────────────
describe('LogSystem — adicionar mensagens', () => {

  // TESTE GUIA 1: o mais simples possível
  // Verificamos que, ao adicionar uma mensagem, ela aparece no buffer
  it('adiciona uma mensagem ao buffer', () => {
    log.add('Você atacou o inimigo');

    // getVisible(10) retorna as últimas 10 mensagens
    const mensagens = log.getVisible(10);

    // Esperamos que haja exatamente 1 mensagem
    expect(mensagens).toHaveLength(1);

    // Esperamos que o texto seja o que adicionamos
    expect(mensagens[0].message).toBe('Você atacou o inimigo');
  });

  // TESTE GUIA 2: adicionar várias mensagens
  it('adiciona múltiplas mensagens em ordem', () => {
    log.add('Mensagem 1');
    log.add('Mensagem 2');
    log.add('Mensagem 3');

    const mensagens = log.getVisible(10);

    expect(mensagens).toHaveLength(3);
    // A primeira mensagem adicionada deve ser a primeira no array
    expect(mensagens[0].message).toBe('Mensagem 1');
    expect(mensagens[2].message).toBe('Mensagem 3');
  });

  // ✏️ EXERCÍCIO 1 — Complete este teste:
  // Verifique que a mensagem tem um timestamp (número) maior que 0
  it('registra o timestamp da mensagem', () => {
    log.add('Teste de timestamp');
    const mensagens = log.getVisible(10);

    // DICA: acesse mensagens[0].timestamp
    // DICA: use expect(...).toBeGreaterThan(0)
    expect(mensagens[0].timestamp).toBeGreaterThan(0);
  });

  // ✏️ EXERCÍCIO 2 — Complete este teste:
  // Verifique que é possível adicionar uma categoria à mensagem
  it('registra a categoria da mensagem quando fornecida', () => {
    log.add('Você pegou uma poção', 'item');
    const mensagens = log.getVisible(10);

    // DICA: acesse mensagens[0].category
    expect(mensagens[0].category).toBe('item');
  });

});

// ─── Grupo 2: Limite máximo de mensagens ──────────────────────────────────────
describe('LogSystem — limite máximo', () => {

  // TESTE GUIA 3: o buffer não pode crescer infinitamente
  // Criamos um LogSystem com máximo de 3 mensagens e adicionamos 5
  it('não ultrapassa o limite máximo de mensagens', () => {
    const logPequeno = new LogSystem(3); // máximo 3 mensagens

    logPequeno.add('Mensagem 1');
    logPequeno.add('Mensagem 2');
    logPequeno.add('Mensagem 3');
    logPequeno.add('Mensagem 4'); // esta deve empurrar a 1 para fora
    logPequeno.add('Mensagem 5'); // esta deve empurrar a 2 para fora

    const mensagens = logPequeno.getVisible(10);

    // Deve ter no máximo 3 mensagens
    expect(mensagens).toHaveLength(3);
  });

  // TESTE GUIA 4: quando o buffer está cheio, a mensagem mais antiga sai
  it('remove a mensagem mais antiga quando o buffer está cheio', () => {
    const logPequeno = new LogSystem(3);

    logPequeno.add('Primeira');
    logPequeno.add('Segunda');
    logPequeno.add('Terceira');
    logPequeno.add('Quarta'); // "Primeira" deve sair

    const mensagens = logPequeno.getVisible(10);

    // "Primeira" não deve mais estar no buffer
    const textos = mensagens.map(m => m.message);
    expect(textos).not.toContain('Primeira');

    // "Quarta" deve estar no buffer
    expect(textos).toContain('Quarta');
  });

  // ✏️ EXERCÍCIO 3 — Complete este teste:
  // Verifique que getVisible(2) retorna apenas as 2 mensagens mais recentes
  it('getVisible retorna apenas o número solicitado de mensagens', () => {
    log.add('Mensagem A');
    log.add('Mensagem B');
    log.add('Mensagem C');
    log.add('Mensagem D');

    // DICA: chame log.getVisible(2) e verifique o tamanho
    // DICA: as 2 mais recentes são C e D
    const recentes = log.getVisible(2);

    expect(recentes).toHaveLength(2);
    expect(recentes[0].message).toBe('Mensagem C');
    expect(recentes[1].message).toBe('Mensagem D');
  });

});

// ─── Grupo 3: isDirty ─────────────────────────────────────────────────────────
describe('LogSystem — isDirty', () => {

  // TESTE GUIA 5: isDirty indica se houve mudança desde o último buildViewModel
  it('isDirty é false quando o log é criado', () => {
    const novoLog = new LogSystem();
    expect(novoLog.isDirty()).toBe(false);
  });

  // TESTE GUIA 6: isDirty fica true após adicionar mensagem
  it('isDirty fica true após adicionar uma mensagem', () => {
    log.add('Nova mensagem');
    expect(log.isDirty()).toBe(true);
  });

  // TESTE GUIA 7: isDirty volta a false após buildViewModel
  it('isDirty fica false após buildViewModel ser chamado', () => {
    log.add('Nova mensagem');
    log.buildViewModel(5); // isso "consome" o dirty
    expect(log.isDirty()).toBe(false);
  });

  // ✏️ EXERCÍCIO 4 — Complete este teste:
  // Verifique que isDirty fica true novamente se adicionar outra mensagem após buildViewModel
  it('isDirty fica true novamente após nova mensagem depois de buildViewModel', () => {
    log.add('Primeira mensagem');
    log.buildViewModel(5);
    // Agora isDirty é false...

    // DICA: adicione outra mensagem e verifique isDirty novamente
    log.add('Segunda mensagem');
    expect(log.isDirty()).toBe(true);
  });

});

// ─── Grupo 4: buildViewModel ──────────────────────────────────────────────────
describe('LogSystem — buildViewModel', () => {

  // TESTE GUIA 8: buildViewModel retorna um objeto com entries
  it('buildViewModel retorna entries com texto formatado', () => {
    log.add('Inimigo derrotado');

    const vm = log.buildViewModel(5);

    // vm.entries deve ser um array
    expect(vm.entries).toHaveLength(1);

    // O texto deve ter o prefixo "> "
    expect(vm.entries[0].text).toBe('> Inimigo derrotado');
  });

  // TESTE GUIA 9: mensagens mais antigas ficam mais transparentes (alpha menor)
  it('mensagens mais antigas têm alpha menor', () => {
    log.add('Mensagem antiga');
    log.add('Mensagem recente');

    const vm = log.buildViewModel(5);

    // A mensagem mais recente (última) deve ter alpha maior
    const alphaAntiga  = vm.entries[0].alpha;
    const alphaRecente = vm.entries[1].alpha;

    expect(alphaRecente).toBeGreaterThan(alphaAntiga);
  });

  // ✏️ EXERCÍCIO 5 — Complete este teste:
  // Verifique que o alpha nunca é menor que 0.4 (definido no LogSystem)
  it('alpha nunca é menor que 0.4', () => {
    // Adicione muitas mensagens para que as antigas fiquem bem velhas
    for (let i = 0; i < 10; i++) {
      log.add(`Mensagem ${i}`);
    }

    const vm = log.buildViewModel(10);

    // DICA: use vm.entries.every(entry => entry.alpha >= 0.4)
    // DICA: expect(...).toBe(true)
    expect(vm.entries.every(entry => entry.alpha >= 0.4)).toBe(true);
  });

});

// ─── Grupo 5: clear ───────────────────────────────────────────────────────────
describe('LogSystem — clear', () => {

  // TESTE GUIA 10: clear remove todas as mensagens
  it('clear remove todas as mensagens do buffer', () => {
    log.add('Mensagem 1');
    log.add('Mensagem 2');
    log.add('Mensagem 3');

    log.clear();

    const mensagens = log.getVisible(10);
    expect(mensagens).toHaveLength(0);
  });

  // ✏️ EXERCÍCIO 6 — Complete este teste:
  // Verifique que é possível adicionar mensagens normalmente após clear()
  it('permite adicionar mensagens após clear', () => {
    log.add('Antes do clear');
    log.clear();

    // DICA: adicione uma nova mensagem e verifique que ela está no buffer
    log.add('Depois do clear');
    const mensagens = log.getVisible(10);

    expect(mensagens).toHaveLength(1);
    expect(mensagens[0].message).toBe('Depois do clear');
  });

});
