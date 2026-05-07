# Integração com IA Generativa — Documentação Técnica

## Visão Geral

O sistema de IA generativa foi projetado para enriquecer a narrativa do jogo **sem bloquear o gameplay**. Toda a arquitetura segue o princípio de **assincronicidade não-bloqueante** com **fallbacks garantidos**.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         GameScene                            │
│  (Loop principal do jogo — NUNCA deve ser bloqueado)        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ usa (não-bloqueante)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      AIIntegration                           │
│  (Camada de integração — adapta contexto do jogo para IA)   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ delega para
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                        AIService                             │
│  (Serviço core — gerencia LLM, cache, fallbacks)            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ chama (HTTP)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Externa (OpenAI)                      │
│  (LLM — pode falhar, ter latência, ou estar indisponível)   │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### Exemplo: Enriquecer Item

```
1. Player coleta item raro
   ↓
2. GameScene.onItemPickedUp(item)
   ↓
3. aiIntegration.enrichItem(item, rarity)  ← retorna Promise, NÃO await
   ↓
4. GameScene continua normalmente (adiciona item ao inventário, etc.)
   ↓
5. [Em background] AIService.generateItemDescription()
   ↓
6. [Em background] Chamada HTTP para LLM
   ↓
7. [Em background] Resposta recebida
   ↓
8. [Em background] item.aiDescription = resultado
   ↓
9. [Callback] .then() executa → exibe descrição no HUD
```

**Ponto crítico**: Entre os passos 3 e 9, o jogo continua rodando normalmente. O jogador pode se mover, atacar, coletar outros itens, etc.

## Decisões de Design

### 1. Por que não usar `await`?

```typescript
// ❌ ERRADO: Bloqueia o loop do jogo
async onItemPickedUp(item: Item) {
  const description = await aiService.generateItemDescription(item);
  item.aiDescription = description;
  this.addItemToInventory(item);
}
```

**Problema**: O método `update()` do Phaser roda a cada frame (~16ms para 60 FPS). Se `await` bloquear por 2 segundos esperando a IA, o jogo congela.

```typescript
// ✅ CORRETO: Não-bloqueante
onItemPickedUp(item: Item) {
  aiIntegration.enrichItem(item, rarity).then(() => {
    if (item.aiDescription) {
      this.showMessage(item.aiDescription);
    }
  });
  
  // Continua imediatamente
  this.addItemToInventory(item);
}
```

**Solução**: A Promise roda em background. O callback `.then()` executa quando pronto, mas não bloqueia o fluxo principal.

### 2. Por que cache?

Sem cache:
- Jogador coleta 10 "Poções de Cura"
- 10 chamadas LLM idênticas
- Custo: ~$0.01 × 10 = $0.10
- Latência: 2s × 10 = 20s total

Com cache:
- Primeira poção: chamada LLM (2s, $0.01)
- Próximas 9: cache instantâneo (0ms, $0)
- Custo: $0.01
- Latência: 2s total

### 3. Por que fallbacks?

Cenários de falha:
- Sem API key (desenvolvedor testando)
- Sem internet
- API fora do ar
- Rate limit excedido
- Timeout

**Princípio**: O jogo deve funcionar **sempre**, com ou sem IA.

```typescript
// Fallback garantido em todos os métodos
async generateItemDescription(item: ItemContext): Promise<string> {
  if (!this.enabled) {
    return this.fallbackItemDescription(); // Retorna imediatamente
  }
  
  try {
    return await this.callLLM(prompt);
  } catch (error) {
    return this.fallbackItemDescription(); // Retorna em caso de erro
  }
}
```

### 4. Por que separar AIService e AIIntegration?

**AIService**: Genérico, reutilizável, não conhece o jogo
- Pode ser usado em outros projetos
- Testável isoladamente
- Fácil de trocar o provider (OpenAI → Anthropic)

**AIIntegration**: Específico do jogo, conhece Item, Enemy, etc.
- Adapta contexto do jogo para prompts
- Aplica resultados nas entidades
- Lógica de quando triggerar IA

**Benefício**: Separação de responsabilidades (SRP).

## Segurança

### API Key no Frontend

⚠️ **Problema**: API key exposta no código frontend é visível para qualquer usuário.

**Mitigação para protótipo acadêmico**:
1. Usar `.env.local` (não commitado)
2. Documentar que é apenas para desenvolvimento
3. Usar rate limiting no provider
4. Monitorar uso

**Solução para produção** (fora do escopo do MVP):
1. Backend proxy que esconde a API key
2. Autenticação de usuário
3. Rate limiting por usuário
4. Custo controlado

### Validação de Input

```typescript
// AIService valida inputs antes de enviar para LLM
if (!player || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
  return; // Ignora input inválido
}
```

**Motivo**: Evitar injeção de prompts maliciosos ou custos desnecessários.

## Performance

### Métricas Esperadas

| Operação | Latência (com cache) | Latência (sem cache) | Custo |
|----------|---------------------|---------------------|-------|
| Item description | ~0ms | ~1-3s | $0.001 |
| Enemy variant | ~0ms | ~2-4s | $0.002 |
| Narrative event | ~0ms | ~1-2s | $0.001 |

### Otimizações

1. **Cache agressivo**: Mesmos inputs = mesma resposta
2. **Prompts curtos**: Menos tokens = mais rápido e barato
3. **max_tokens limitado**: 150 tokens suficiente para descrições curtas
4. **Modelo econômico**: GPT-3.5-turbo em vez de GPT-4

### Quando NÃO usar IA

❌ Não usar para:
- Cálculos de gameplay (dano, XP, etc.)
- Lógica de pathfinding
- Detecção de colisão
- Qualquer coisa que afete mecânicas core

✅ Usar apenas para:
- Texto narrativo
- Nomes/descrições
- Flavor text
- Conteúdo cosmético

## Testes

### Teste Manual

1. Sem API key:
```bash
# Não configure VITE_AI_API_KEY
npm run dev
```
Resultado esperado: Fallbacks usados, jogo funciona normalmente.

2. Com API key:
```bash
# Configure .env.local
echo "VITE_AI_API_KEY=sk-..." > .env.local
npm run dev
```
Resultado esperado: Descrições geradas, logs mostram sucesso.

### Teste Automatizado

```typescript
// No console do navegador
import('./ai/test-ai').then(m => m.runTests());
```

Verifica:
- ✅ Descrição de item
- ✅ Variante de inimigo
- ✅ Evento narrativo
- ✅ Cache funcionando
- ✅ Fallback sem API key

## Expansões Futuras

### Fase 5+ (Fora do MVP)

1. **Persistência de cache**
   - Salvar cache em localStorage
   - Carregar cache ao iniciar jogo
   - Limpar cache antigo (LRU)

2. **Múltiplos providers**
   - Suporte a Anthropic (Claude)
   - Suporte a Cohere
   - Fallback entre providers

3. **Geração de diálogos**
   - NPCs com personalidade
   - Respostas contextuais
   - Árvore de diálogo dinâmica

4. **Narrativa procedural**
   - Quests geradas por IA
   - Lore de mundo
   - Histórias de itens lendários

5. **Descrições de ambiente**
   - Salas únicas
   - Atmosfera dinâmica
   - Eventos ambientais

## Troubleshooting

### "API key não configurada"

**Causa**: `VITE_AI_API_KEY` não está no `.env.local`

**Solução**:
```bash
cp .env.example .env.local
# Editar .env.local e adicionar sua chave
```

### "LLM API error: 401"

**Causa**: API key inválida

**Solução**: Verificar chave em https://platform.openai.com/api-keys

### "LLM API error: 429"

**Causa**: Rate limit excedido

**Solução**: Aguardar ou aumentar limite no provider

### Descrições não aparecem

**Causa**: Callback `.then()` não está sendo executado

**Solução**: Verificar logs no console. Se não há erros, a IA está funcionando mas o HUD não está exibindo.

### Jogo congela ao coletar item

**Causa**: Usando `await` no loop principal

**Solução**: Remover `await`, usar `.then()` em vez disso.

## Referências

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Phaser 3 Async Best Practices](https://phaser.io/tutorials/making-your-first-phaser-3-game)
- [JavaScript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
