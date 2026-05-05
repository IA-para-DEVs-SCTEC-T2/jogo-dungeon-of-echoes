# Structure — Dungeon of Echoes

## Organização de Diretórios

```
dungeon-of-echoes/
├── index.html                  ← Entry point HTML (Vite)
├── vite.config.js              ← Configuração do build
├── package.json
├── commitlint.config.js        ← Regras de commit semântico
│
├── .kiro/
│   ├── product.md              ← Visão de produto e funcionalidades
│   ├── structure.md            ← Este arquivo
│   ├── tech.md                 ← Stack e decisões técnicas
│   ├── steering/
│   │   └── game-steering.md    ← Diretrizes estratégicas do projeto
│   └── specs/                  ← Especificações funcionais por sistema
│       ├── player.spec.md
│       ├── dungeon.spec.md
│       ├── enemy.spec.md
│       ├── combat.spec.md
│       ├── xp.spec.md
│       ├── input.spec.md
│       └── gameloop.spec.md
│
├── src/
│   ├── main.js                 ← Bootstrap do Phaser + configuração global
│   │
│   ├── config/
│   │   └── constants.js        ← TILE_SIZE, GRID_W, GRID_H, cores, etc.
│   │
│   ├── scenes/                 ← Cenas Phaser (apresentação)
│   │   ├── BootScene.js        ← Carrega assets, inicializa RNG
│   │   ├── GameScene.js        ← Cena principal do jogo
│   │   └── GameOverScene.js    ← Resumo de partida / permadeath
│   │
│   └── systems/                ← Lógica de jogo (domínio)
│       ├── PlayerSystem.js     ← Atributos, HP/Mana, movimento
│       ├── DungeonSystem.js    ← Geração BSP, tiles, FOG of War
│       ├── EnemySystem.js      ← Spawn, IA de inimigos, turno
│       ├── CombatSystem.js     ← Resolução de ataque e dano
│       └── XPSystem.js         ← Ganho de XP, level up
│
├── tests/                      ← Testes unitários (Vitest)
│   ├── combat.test.js
│   ├── dungeon.test.js
│   └── xp.test.js
│
└── docs/                       ← Documentação auxiliar
    ├── spec.md
    └── steering.md
```

## Separação de Responsabilidades

### Camada de Apresentação — `/src/scenes/`
Cenas Phaser que gerenciam o ciclo de vida visual do jogo. Não contêm lógica de domínio.

| Arquivo | Responsabilidade |
|---------|-----------------|
| `BootScene.js` | Pré-carregamento de assets, inicialização do RNG, transição para GameScene |
| `GameScene.js` | Loop principal: captura input, chama sistemas, renderiza estado |
| `GameOverScene.js` | Exibe resumo da partida (andar, inimigos, causa da morte) |

**Regra:** Cenas orquestram, sistemas executam. Uma cena nunca calcula dano ou gera dungeon diretamente.

### Camada de Domínio — `/src/systems/`
Módulos de lógica pura. Cada sistema é responsável por um único domínio do jogo.

| Arquivo | Responsabilidade |
|---------|-----------------|
| `PlayerSystem.js` | Estado do jogador: atributos, HP, Mana, posição, movimento no grid |
| `DungeonSystem.js` | Geração procedural (BSP), mapa de tiles, FOG of War, escadas |
| `EnemySystem.js` | Criação de inimigos, máquina de estados de IA, execução de turno |
| `CombatSystem.js` | Fórmula de ataque, cálculo de dano, aplicação de dano, morte |
| `XPSystem.js` | Acúmulo de XP, cálculo de nível, distribuição de atributos no level up |

**Regra:** Sistemas não importam uns aos outros diretamente. Comunicação via parâmetros explícitos ou eventos Phaser 4 emitidos pela cena (`this.events.emit` / `this.events.on`).

### Configuração — `/src/config/`
Constantes globais que evitam magic numbers espalhados pelo código.

```javascript
// constants.js — exemplos
export const TILE_SIZE = 32;
export const GRID_W = 50;
export const GRID_H = 50;
export const VISION_RADIUS = 5;
export const XP_BASE = 100;
```

### Especificações — `.kiro/specs/`
Cada sistema possui uma spec correspondente em Markdown. A spec define o comportamento esperado antes da implementação. Nenhuma feature é implementada sem spec.

### Testes — `/tests/`
Testes unitários com Vitest. Validam o comportamento descrito nas specs, não os detalhes de implementação. Atualmente cobrem: `CombatSystem`, `DungeonSystem`, `XPSystem`.

## Padrões de Organização de Código

### Um sistema, um arquivo
Cada sistema vive em um único arquivo dentro de `/src/systems/`. Não criar subpastas dentro de `systems/` no MVP.

### Exportação nomeada
Preferir exportações nomeadas a `export default` para facilitar tree-shaking e clareza de imports:
```javascript
// ✅ preferido
export function resolveAttack(attacker, defender) { ... }

// ❌ evitar no MVP
export default class CombatSystem { ... }
```

### Sem dependências circulares
Sistemas não se importam mutuamente. Se dois sistemas precisam se comunicar, a cena intermediária passa os dados necessários como parâmetros.

### Constantes centralizadas
Qualquer valor numérico ou string que apareça em mais de um lugar vai para `constants.js`.

### Specs antes do código
O fluxo obrigatório é:
1. Escrever/revisar spec em `.kiro/specs/<sistema>.spec.md`
2. Implementar em `/src/systems/<Sistema>System.js`
3. Integrar em `GameScene.js`
4. Validar manualmente

## Convenções

### Nomenclatura
| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos de sistema | PascalCase + sufixo `System` | `CombatSystem.js` |
| Arquivos de cena | PascalCase + sufixo `Scene` | `GameScene.js` |
| Funções exportadas | camelCase | `resolveAttack()` |
| Constantes | UPPER_SNAKE_CASE | `TILE_SIZE` |
| Specs | kebab-case + `.spec.md` | `combat.spec.md` |
| Testes | kebab-case + `.test.js` | `combat.test.js` |

### Commits
Seguir Conventional Commits (enforçado via Husky + Commitlint):
```
feat(combat): add critical hit calculation
fix(dungeon): correct BSP corridor overlap
docs(specs): update xp spec with level cap
```

### Comentários
- Comentar o **porquê**, não o **o quê**
- Funções públicas de sistemas devem ter JSDoc mínimo (parâmetros e retorno)
- Evitar comentários óbvios que apenas repetem o código
