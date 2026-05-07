# Sistema de IA Generativa — Fase 4

Este módulo integra IA generativa (LLM) ao jogo para enriquecer a narrativa de forma **não-bloqueante** e **opcional**.

## 📁 Estrutura

```
src/ai/
├── AIService.ts        → Serviço principal de IA (chamadas LLM, cache, fallbacks)
├── AIIntegration.ts    → Camada de integração com sistemas do jogo
├── config.ts           → Configuração (API key)
└── README.md           → Este arquivo
```

## 🔑 Configuração

1. Copie `.env.example` para `.env.local` na raiz do projeto
2. Adicione sua API key OpenAI (ou compatível):

```env
VITE_AI_API_KEY=sk-your-api-key-here
```

3. O jogo funciona normalmente **sem** API key (usa fallbacks)

## 🎯 Casos de Uso

### 1. Descrição de Item Raro

Quando um item raro/épico é coletado:

```typescript
import { AIService } from './ai/AIService';
import { AIIntegration } from './ai/AIIntegration';
import { AI_CONFIG } from './ai/config';

// Na GameScene.create()
this.aiService = new AIService(AI_CONFIG.API_KEY);
this.aiIntegration = new AIIntegration(this.aiService);

// Quando item é coletado
const item = new Item('item-1', 'potion_heal', 5, 5);
const rarity = 0.9; // Item raro (>0.8)

// NÃO usar await aqui! Deixar rodar em background
this.aiIntegration.enrichItem(item, rarity).then(() => {
  // Quando pronto, exibir descrição
  if (item.aiDescription) {
    this.showMessage(item.aiDescription);
  }
});
```

### 2. Inimigo Elite com Variante IA

Quando spawnar inimigo elite:

```typescript
const enemy = new Enemy('enemy-1', 10, 10, 50, 15);

// Decidir se é elite (15% de chance)
if (Math.random() < AI.ENEMY_ELITE_CHANCE) {
  // NÃO usar await! Deixar rodar em background
  this.aiIntegration.createEliteEnemy(
    enemy,
    'Esqueleto',      // tipo base
    this.player.level, // nível do jogador
    'Masmorra Profunda' // local
  ).then(() => {
    // Quando pronto, atualizar UI
    console.log(`Elite spawned: ${enemy.getDisplayName('Esqueleto')}`);
    if (enemy.aiDescription) {
      this.showMessage(enemy.aiDescription);
    }
  });
}
```

### 3. Evento Narrativo

Quando jogador entra em sala especial:

```typescript
// Detectar tile especial (ex: tile tipo 2)
if (this.dungeon.getTile(x, y) === AI.EVENT_SPECIAL_TILE) {
  // NÃO usar await! Deixar rodar em background
  this.aiIntegration.generateNarrativeEvent(
    'Câmara Antiga',
    this.player.level,
    ['Derrotou um elite', 'Encontrou item raro']
  ).then(eventText => {
    // Quando pronto, exibir no HUD
    this.showMessage(eventText);
  });
}
```

## ⚡ Princípios Críticos

### ❌ NUNCA FAZER ISSO

```typescript
// ERRADO: Bloqueia o loop do jogo!
const description = await aiService.generateItemDescription(item);
item.aiDescription = description;
```

### ✅ SEMPRE FAZER ASSIM

```typescript
// CORRETO: Não-bloqueante
aiIntegration.enrichItem(item, rarity).then(() => {
  // Aplicar resultado quando pronto
  if (item.aiDescription) {
    console.log(item.aiDescription);
  }
});

// O jogo continua rodando normalmente enquanto a IA processa
```

## 🧠 Cache

O AIService mantém cache automático de todas as respostas:

- Chave: hash do input (tipo + contexto)
- Evita chamadas repetidas para o mesmo conteúdo
- Persiste durante a sessão (não salva em disco)

## 🔄 Fallbacks

Se a IA falhar (sem API key, timeout, erro de rede):

- **Item**: "Um item envolto em mistério."
- **Enemy**: Nome genérico + "Golpe das Sombras"
- **Event**: "Você sente uma presença antiga observando..."

O jogo **sempre funciona**, com ou sem IA.

## 🧪 Testando Sem API Key

Para testar o sistema sem gastar créditos:

1. Não configure `VITE_AI_API_KEY`
2. O AIService usará fallbacks automaticamente
3. Logs mostrarão: `[AIService] API key não configurada. Usando fallbacks.`

## 📊 Logs

O sistema loga todas as operações:

```
[AIService] Inicializado com sucesso.
[AIService] Gerando descrição do item...
[AIService] Descrição recebida.
[AIIntegration] Item "Poção de Cura" enriquecido.
```

Ou, sem API key:

```
[AIService] API key não configurada. Usando fallbacks.
[AIService] Descrição de item recuperada do cache.
```

## 🔌 Providers Compatíveis

O AIService usa API compatível com OpenAI. Funciona com:

- OpenAI (GPT-3.5, GPT-4)
- Azure OpenAI
- Qualquer provider com endpoint `/v1/chat/completions`

Para trocar o provider, edite `AIService.callLLM()` e ajuste a URL.

## 🚀 Próximos Passos (Fora do MVP)

- [ ] Persistir cache em localStorage
- [ ] Suporte a múltiplos providers (Anthropic, Cohere)
- [ ] Geração de diálogos de NPCs
- [ ] Narrativa procedural de quests
- [ ] Descrições de salas/ambientes
