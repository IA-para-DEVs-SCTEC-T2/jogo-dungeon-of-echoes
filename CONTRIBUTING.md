# Contribuindo com Dungeon of Echoes

Obrigado pelo interesse em contribuir! Este guia cobre tudo que você precisa saber para desenvolver neste projeto.

---

## Pré-requisitos

- **Node.js 20** ou superior
- **Git** configurado com seu usuário e e-mail
- Familiaridade com TypeScript, Phaser 4 e arquitetura turn-based

---

## Setup local

```bash
# 1. Clone e instale dependências
git clone https://github.com/IA-para-DEVs-SCTEC-T2/jogo-dungeon-of-echoes.git
cd jogo-dungeon-of-echoes
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev        # http://localhost:3000

# 3. Execute os testes
npm test

# 4. Verifique a build de produção
npm run build
```

### Configuração opcional: IA generativa

O jogo funciona sem IA. Para habilitar descrições narrativas:

```bash
cp .env.example .env.local
# Edite .env.local e adicione: VITE_AI_API_KEY=sk-...
```

---

## Branches

| Branch | Propósito |
|--------|-----------|
| `main` | Produção — merge apenas via PR aprovado |
| `staging` | Integração — PR obrigatório antes de qualquer merge |
| `feature/<nome>` | Desenvolvimento de funcionalidades |
| `fix/<nome>` | Correções de bug |

**Fluxo padrão:**

```
feature/minha-feature → staging → main
```

Nunca faça push direto para `main` ou `staging`.

---

## Padrão de commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/) — enforçado via Husky + Commitlint:

```
tipo(escopo): descrição em minúsculas, sem ponto final
```

| Tipo | Uso | Impacto SemVer |
|------|-----|----------------|
| `feat` | Nova funcionalidade | MINOR |
| `fix` | Correção de bug | PATCH |
| `refactor` | Refatoração sem mudança de comportamento | — |
| `test` | Testes novos ou corrigidos | — |
| `docs` | Apenas documentação | — |
| `chore` | Manutenção, CI, dependências | — |

**Escopos sugeridos:** `player`, `dungeon`, `combat`, `xp`, `enemy`, `input`, `render`, `config`, `ci`, `ui`, `shop`, `equipment`, `ai`

**Exemplos válidos:**

```bash
feat(combat): add critical hit calculation
fix(dungeon): correct BSP corridor overlap
docs(specs): update xp spec with level cap
test(shop): add edge cases for sell-all action
chore(ci): add commitlint to GitHub Actions
```

O hook `pre-commit` bloqueia commits que não seguem o padrão.

---

## Processo de desenvolvimento

### 1. Spec primeiro

Nenhuma feature é implementada sem spec correspondente em `.kiro/specs/`. Se a spec não existir:

1. Crie ou atualize o arquivo `.kiro/specs/<sistema>.spec.md`
2. Descreva comportamento esperado, entradas, saídas e edge cases
3. Submeta a spec na mesma PR da implementação (ou em PR antecedente)

### 2. Implementação

Siga a arquitetura em camadas:

```
Route → Controller → Scene (orquestra)
                 ↓
             System (lógica de domínio)
                 ↓
             Entity (dado puro)
```

**Regras obrigatórias:**

- **Sistemas nunca importam cenas** — use `EventBus.emit(EVENTS.X, payload)`
- **Cenas nunca calculam lógica de domínio** — delegam a sistemas
- **Magic frame numbers pertencem a `sprites-config.ts`** — não espalhe literais de frame em cenas
- **`RenderCommand[]` é atlas-agnóstico** — nenhum campo Phaser específico dentro
- **Bitmask usa `isVisuallyOpen`** de `TileSemanticsProvider`, não `=== TILE.FLOOR`
- **`BONUS_AREA_OVERRIDES` nunca cruza importações com `MANUAL_MAP_OVERRIDES`**

### 3. Testes

```bash
npm test           # executa todos os testes
npm test -- --watch  # modo watch
```

- Escreva testes em `/tests/*.test.js`
- Testes de domínio **não devem instanciar Phaser** — lógica pura é testável diretamente
- Cubra pelo menos: happy path, edge case vazio/nulo, valor inválido
- `CombatSystem`, `XPSystem`, `InventorySystem`, `ShopSystem` têm cobertura existente — não quebre

### 4. CHANGELOG

Ao implementar uma feature ou fix significativo, adicione entrada no `CHANGELOG.md` seguindo o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/):

```markdown
## [Unreleased]
### Added
- Descrição da feature nova

### Fixed
- Descrição do bug corrigido
```

### 5. Pull Request

- Título curto e descritivo (segue Conventional Commits: `feat(escopo): descrição`)
- Descreva no corpo: o que mudou, por que, e como testar
- Referencie a issue ou spec relacionada
- Garanta que `npm test` e `npm run build` passam localmente antes de abrir PR
- Aguarde revisão de ao menos 1 membro do time

---

## Arquitetura resumida

```
src/
  scenes/       → Phaser Scenes (Boot, Game, UI, GameOver, VisualRegression)
  systems/      → Lógica de domínio pura (testável sem Phaser)
  entities/     → Dados puros (Player, Enemy, Item)
  generators/   → DungeonGenerator, CityLayoutProcessor, TileVariantResolver
  config/       → constants.ts, dungeon-themes.ts, sprites-config.ts, shop.catalog.ts
  types/        → Interfaces e tipos TypeScript
  utils/        → EventBus
  ui/           → Painéis de UI (Inventory, Shop, Dialog, Log, ActionBar)
  ai/           → AIService (integração LLM, não-bloqueante)

.kiro/
  steering/     → Diretrizes arquiteturais do projeto
  specs/        → Especificações funcionais por sistema

tests/          → Testes unitários Vitest
docs/           → Documentação técnica e prompts
```

Leia `.kiro/steering/game-steering.md` antes de qualquer mudança estrutural.

---

## Dúvidas

Abra uma issue no repositório ou consulte:

- `.kiro/steering/game-steering.md` — regras arquiteturais
- `.kiro/specs/` — comportamento esperado por sistema
- `docs/dungeon-sprite-rendering.md` — pipeline de renderização de dungeon
- `CHANGELOG.md` — histórico completo de mudanças
