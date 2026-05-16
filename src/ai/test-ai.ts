/**
 * test-ai.ts — Script de teste do AIService
 * 
 * Execute este arquivo para testar o AIService sem rodar o jogo completo.
 * 
 * Como usar:
 * 1. Configure VITE_AI_API_KEY no .env.local
 * 2. Execute: npm run dev
 * 3. Abra o console do navegador
 * 4. Importe e execute: import('./ai/test-ai').then(m => m.runTests())
 */

import { AIService } from './AIService';
import { AIIntegration } from './AIIntegration';
import { AI_CONFIG } from './config';
import { Item } from '../entities/Item';
import { Enemy } from '../entities/Enemy';

export async function runTests() {
  console.log('=== TESTE DO SISTEMA DE IA ===\n');

  const aiService = new AIService(AI_CONFIG.API_KEY);
  const aiIntegration = new AIIntegration(aiService);

  // Teste 1: Descrição de Item
  console.log('📦 Teste 1: Descrição de Item');
  const item = new Item('test-item', 'potion_heal', 5, 5);
  
  await aiIntegration.enrichItem(item, 0.9);
  
  if (item.aiDescription) {
    console.log('✅ Descrição gerada:', item.aiDescription);
  } else {
    console.log('⚠️ Fallback usado (sem API key ou erro)');
  }
  console.log('');

  // Teste 2: Inimigo Elite
  console.log('👾 Teste 2: Inimigo Elite');
  const enemy = new Enemy('test-enemy', 10, 10, 50, 15);
  
  await aiIntegration.createEliteEnemy(enemy, 'Esqueleto', 5, 'Masmorra Profunda');
  
  console.log('Nome:', enemy.getDisplayName('Esqueleto'));
  console.log('Elite:', enemy.isElite);
  console.log('HP:', enemy.hp, '/', enemy.maxHp);
  console.log('Ataque:', enemy.attack);
  
  if (enemy.aiDescription) {
    console.log('✅ Descrição:', enemy.aiDescription);
  }
  if (enemy.aiSpecialAbility) {
    console.log('✅ Habilidade:', enemy.aiSpecialAbility);
  }
  console.log('');

  // Teste 3: Evento Narrativo
  console.log('📖 Teste 3: Evento Narrativo');
  
  const eventText = await aiIntegration.generateNarrativeEvent(
    'Câmara Antiga',
    5,
    ['Derrotou um elite', 'Encontrou item raro']
  );
  
  console.log('✅ Evento:', eventText);
  console.log('');

  // Teste 4: Cache
  console.log('🧠 Teste 4: Cache');
  console.log('Gerando mesma descrição novamente...');
  
  const item2 = new Item('test-item-2', 'potion_heal', 3, 3);
  await aiIntegration.enrichItem(item2, 0.9);
  
  console.log('✅ Segunda chamada deve usar cache (verifique logs acima)');
  console.log('');

  // Teste 5: Fallback sem API key
  console.log('🔄 Teste 5: Fallback');
  const aiServiceNoKey = new AIService(''); // Sem API key
  const aiIntegrationNoKey = new AIIntegration(aiServiceNoKey);
  
  const item3 = new Item('test-item-3', 'potion_mana', 7, 7);
  await aiIntegrationNoKey.enrichItem(item3, 0.9);
  
  console.log('✅ Fallback:', item3.aiDescription);
  console.log('');

  console.log('=== TESTES CONCLUÍDOS ===');
}

/**
 * Teste de performance: múltiplas chamadas simultâneas
 */
export async function runPerformanceTest() {
  console.log('=== TESTE DE PERFORMANCE ===\n');

  const aiService = new AIService(AI_CONFIG.API_KEY);
  const aiIntegration = new AIIntegration(aiService);

  const startTime = Date.now();

  // Criar 10 itens e enriquecer todos simultaneamente
  const items = Array.from({ length: 10 }, (_, i) => 
    new Item(`perf-item-${i}`, 'potion_heal', i, i)
  );

  console.log('Enriquecendo 10 itens simultaneamente...');

  await Promise.all(
    items.map(item => aiIntegration.enrichItem(item, 0.9))
  );

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`✅ 10 itens processados em ${duration}ms`);
  console.log(`Média: ${duration / 10}ms por item`);
  
  // Verificar quantos usaram cache
  const withDescription = items.filter(i => i.aiDescription).length;
  console.log(`${withDescription}/10 itens com descrição`);

  console.log('\n=== TESTE DE PERFORMANCE CONCLUÍDO ===');
}

// Auto-executar se importado diretamente no console
if (typeof window !== 'undefined') {
  (window as any).testAI = {
    runTests,
    runPerformanceTest,
  };
  console.log('💡 Testes disponíveis:');
  console.log('  - testAI.runTests()');
  console.log('  - testAI.runPerformanceTest()');
}
