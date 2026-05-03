# Tech — Dungeon of Echoes

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Engine de jogo | Phaser 4 | ^4.x |
| Linguagem | JavaScript (ES Modules) | ES2022+ |
| Build / Dev server | Vite | ^5.x |
| Testes unitários | Vitest | ^1.x (futuro) |
| Qualidade de commits | Husky + Commitlint | — |
| Runtime | Navegador moderno (Chrome, Firefox, Edge) | — |

## Justificativas das Escolhas

### Phaser 4
Phaser é o framework de jogos 2D mais maduro para JavaScript no navegador. A versão 4 traz um renderer WebGL completamente reconstruído, com gerenciamento de estado centralizado e melhor performance — mantendo a API padrão compatível com Phaser 3 para quem usa sprites, tilemaps e input convencionais.

Para este projeto, os benefícios diretos são:
- Loop de jogo (update/render) gerenciado automaticamente
- Sistema de cenas para separar estados do jogo (Boot, Game, GameOver)
- Renderização via WebGL com fallback para Canvas
- Input handling nativo (teclado, mouse, gamepad) — API inalterada em relação ao v3
- `TilemapGPULayer` disponível para renderização de dungeons com alta performance
- EventEmitter nativo por cena (`this.events.emit` / `this.events.on`) — inalterado
- Câmera integrada com scroll, zoom e follow

Para um RPG tile-based, Phaser 4 elimina a necessidade de implementar loop de jogo, canvas e input do zero, permitindo foco total na lógica de domínio.

**Notas de migração relevantes (Phaser 3 → 4):**
- `Phaser.Struct.Set` e `Phaser.Struct.Map` foram removidos — usar `Set` e `Map` nativos do JavaScript
- `Geom.Point` foi removido — usar `Vector2` para representar coordenadas x,y
- Pipelines customizados foram substituídos por RenderNodes (não afeta este projeto — sem pipelines customizados)
- `setLighting(true)` substitui a atribuição de pipeline para iluminação
- `roundPixels` agora é `false` por padrão — definir explicitamente no config se necessário para pixel art
- FX e Masks foram unificados no sistema de Filters (não afeta o MVP)

### JavaScript com ES Modules
- Sem transpilação obrigatória para o MVP (Vite serve ESM nativamente)
- Sintaxe de `import/export` nativa mantém o código modular e rastreável
- Sem overhead de TypeScript no estágio inicial — legibilidade e velocidade de iteração são prioridade
- Compatível com todos os ambientes-alvo (navegador moderno)

### Vite
- Dev server com HMR (Hot Module Replacement) instantâneo
- Build otimizado para produção com tree-shaking nativo
- Configuração mínima para projetos Phaser (sem webpack boilerplate)
- Suporte nativo a ES Modules sem configuração adicional

### Vitest (futuro)
- API compatível com Jest — curva de aprendizado mínima
- Integração nativa com Vite (mesmo pipeline de transformação)
- Suporte a ES Modules sem configuração extra
- Execução rápida por aproveitar o cache do Vite

### Husky + Commitlint
- Husky: executa hooks de git (pre-commit, commit-msg) sem configuração manual
- Commitlint: enforça Conventional Commits, mantendo histórico legível e geração de changelog automatizável
- Configuração em `commitlint.config.js` na raiz do projeto

## Padrões Arquiteturais

### Arquitetura em Camadas

```
┌─────────────────────────────────────┐
│         PRESENTATION LAYER          │
│   Phaser Scenes (Boot, Game, Over)  │
│   Responsável por: render, input    │
└──────────────┬──────────────────────┘
               │ chama funções / passa dados
┌──────────────▼──────────────────────┐
│          GAME LOGIC LAYER           │
│   Systems: Player, Dungeon, Enemy,  │
│            Combat, XP               │
│   Responsável por: regras do jogo   │
└──────────────┬──────────────────────┘
               │ lê/escreve
┌──────────────▼──────────────────────┐
│           CONFIG LAYER              │
│   constants.js                      │
│   Responsável por: valores globais  │
└─────────────────────────────────────┘
```

**Regra fundamental:** Dependências fluem de cima para baixo. Sistemas não conhecem cenas; cenas orquestram sistemas.

### Sistemas como Módulos Funcionais
No MVP, sistemas são coleções de funções exportadas (não classes), mantendo o código simples e testável:

```javascript
// src/systems/CombatSystem.js
export function resolveAttack(attacker, defender) { ... }
export function applyDamage(entity, amount) { ... }
export function isDefeated(entity) { ... }
```

Isso facilita testes unitários diretos sem necessidade de instanciar objetos complexos.

### Estado em Memória
Todo o estado do jogo vive em objetos JavaScript simples durante a sessão. Sem banco de dados, sem localStorage para estado de jogo (apenas score final, se implementado). Ao fechar ou recarregar, a sessão é perdida — comportamento intencional (permadeath).

### Comunicação entre Sistemas
Sistemas não se importam diretamente. A `GameScene` atua como orquestradora:

```javascript
// GameScene.js — exemplo de orquestração
const result = CombatSystem.resolveAttack(this.player, enemy);
if (CombatSystem.isDefeated(enemy)) {
  XPSystem.grantXP(this.player, enemy.xpReward);
  EnemySystem.remove(this.enemies, enemy);
}
```

Para eventos que precisam cruzar múltiplos sistemas de forma desacoplada, usar o EventEmitter nativo do Phaser 4 por cena (`this.events.emit` / `this.events.on`). A API é idêntica ao Phaser 3.

### Geração Procedural com Seed
O `DungeonSystem` usa um RNG seedable (baseado em timestamp ou semente explícita) para garantir que dungeons sejam reproduzíveis durante debug, mas únicos em cada partida normal.

### Estruturas de Dados Nativas
Phaser 4 removeu `Phaser.Struct.Set` e `Phaser.Struct.Map`. Usar diretamente `Set` e `Map` nativos do JavaScript — mais simples, sem dependência de API proprietária:

```javascript
// ✅ correto para Phaser 4
const enemies = new Set();
const tileCache = new Map();

// ❌ não existe mais em Phaser 4
const enemies = new Phaser.Struct.Set();
```

## Ferramentas e Dependências

### Dependências de Produção
| Pacote | Uso |
|--------|-----|
| `phaser` | Engine de jogo — loop, render, input, cenas (v4) |

### Dependências de Desenvolvimento
| Pacote | Uso |
|--------|-----|
| `vite` | Build tool e dev server |
| `vitest` | Test runner (futuro) |
| `husky` | Git hooks |
| `@commitlint/cli` | Validação de mensagens de commit |
| `@commitlint/config-conventional` | Regras Conventional Commits |

### Sem Dependências Desnecessárias
O MVP não usa:
- Frameworks de UI (React, Vue) — Phaser gerencia o canvas
- Bibliotecas de estado (Redux, Zustand) — estado simples em objetos JS
- ORMs ou clientes de banco — sem persistência no MVP
- Bibliotecas de pathfinding externas — A* simples implementado internamente quando necessário

## Restrições Técnicas do MVP

| Restrição | Motivo |
|-----------|--------|
| Sem IA generativa | Fora do escopo do MVP; hooks preparados para expansão |
| Sem backend | Jogo 100% client-side; sem servidor necessário |
| Sem sistema de save | Permadeath intencional; simplifica implementação |
| Sem animações complexas | Sprites simples ou formas geométricas são suficientes |
| Sem banco de dados | Estado apenas em memória durante a sessão |
| API key de IA exposta no frontend | Aceitável para protótipo acadêmico; inaceitável em produção |
| Sem pipelines/shaders customizados | Fora do escopo; usar API padrão do Phaser 4 |

## Preparação para Expansões Futuras

O código deve ser estruturado para suportar, sem reescrita, as seguintes adições:

- **IA generativa**: `AIService.js` em `/src/ai/` com fallback obrigatório — o jogo funciona 100% sem conectividade com LLM
- **Inventário**: `InventorySystem.js` em `/src/systems/` seguindo o mesmo padrão modular
- **Magia**: `MagicSystem.js` com lista de spells em `/src/data/spells.json`
- **Múltiplos andares**: `DungeonSystem` já deve suportar parâmetro `floor` e `seed`; considerar `TilemapGPULayer` do Phaser 4 para performance em andares maiores
- **Pathfinding A\***: `/src/utils/pathfinding.js` isolado, chamado pelo `EnemySystem`
- **Testes**: estrutura de `/tests/` já existe; adicionar casos conforme sistemas amadurecem
