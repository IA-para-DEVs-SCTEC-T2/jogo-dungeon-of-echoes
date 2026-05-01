# Dungeon of Echoes

![Commits](https://img.shields.io/github/commit-activity/m/IA-para-DEVs-SCTEC-T2/jogo-dungeon-of-echoes)
![Last Commit](https://img.shields.io/github/last-commit/IA-para-DEVs-SCTEC-T2/jogo-dungeon-of-echoes)
![Pull Requests](https://img.shields.io/github/issues-pr/IA-para-DEVs-SCTEC-T2/jogo-dungeon-of-echoes)
![Contributors](https://img.shields.io/github/contributors/IA-para-DEVs-SCTEC-T2/jogo-dungeon-of-echoes)
![Repo Size](https://img.shields.io/github/repo-size/IA-para-DEVs-SCTEC-T2/jogo-dungeon-of-echoes)

---

## Sobre o Projeto

**Dungeon of Echoes** é um RPG roguelike *tile-based* jogado inteiramente no navegador.
Inspirado no clássico *Castle of the Winds*, o jogo combina exploração de masmorras geradas proceduralmente com combate turn-based e progressão de personagem.

O projeto é de contexto acadêmico e demonstra arquitetura modular em JavaScript com Phaser 4, com estrutura preparada para integração futura de IA generativa.

---

## Status do Projeto

| Item | Status |
|------|--------|
| MVP jogável | ✅ Entregue |
| Geração procedural de dungeon | ✅ Implementado |
| Combate turn-based | ✅ Implementado |
| Sistema de XP e level up | ✅ Implementado |
| IA de inimigos | ✅ Implementado |
| FOG of War | 🔜 Planejado |
| Inventário e itens | 🔜 Planejado |
| Integração com IA Generativa | 🔜 Planejado |

---

## Principais Mecânicas

**Loop de jogo turn-based:**
```
Input do jogador → Resolve ação → Atualiza visão → Turno dos inimigos → Verifica condições → Atualiza HUD
```

- Exploração de masmorra gerada proceduralmente em grid 50×50
- Cada ação do jogador (mover, atacar, esperar) consome um turno
- Inimigos executam seu turno após o jogador
- Ganho de XP ao derrotar inimigos, com progressão de nível
- Permadeath — cada partida começa do zero

**Sistemas implementados:**

| Sistema | Responsabilidade |
|---------|-----------------|
| `PlayerSystem` | Atributos, HP, posição e movimento no grid |
| `DungeonSystem` | Geração procedural BSP, mapa de tiles |
| `EnemySystem` | Spawn, máquina de estados de IA (IDLE → CHASING → ATTACKING) |
| `CombatSystem` | Resolução de ataque, cálculo de dano, morte |
| `XPSystem` | Acúmulo de XP, nível, level up com múltiplos saltos |

---

## Tecnologias

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Engine de jogo | Phaser | 4.0.0 |
| Linguagem | JavaScript ES Modules | ES2022+ |
| Build / Dev server | Vite | ^5.x |
| Testes unitários | Vitest | ^2.x |
| Qualidade de commits | Husky + Commitlint | — |
| Runtime | Navegador moderno | Chrome, Firefox, Edge |

---

## Como Rodar

**Requisitos:** Node.js 20 ou superior

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (abre em http://localhost:3000)
npm run dev

# Executar testes unitários
npm test

# Build de produção
npm run build
```

---

## Estrutura do Projeto

```
dungeon-of-echoes/
├── index.html                  ← Entry point HTML (Vite)
├── vite.config.js              ← Configuração do build
├── package.json
│
├── .kiro/                      ← Documentação do projeto
│   ├── product.md              ← Visão de produto e funcionalidades
│   ├── structure.md            ← Organização e convenções do código
│   ├── tech.md                 ← Stack e decisões técnicas
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
│   ├── config/
│   │   └── constants.js        ← TILE_SIZE, GRID_W, GRID_H, cores, etc.
│   ├── scenes/                 ← Camada de apresentação (Phaser Scenes)
│   │   ├── BootScene.js        ← Tela de carregamento
│   │   ├── GameScene.js        ← Cena principal do jogo
│   │   └── GameOverScene.js    ← Tela de Game Over
│   └── systems/                ← Camada de lógica de domínio
│       ├── PlayerSystem.js
│       ├── DungeonSystem.js
│       ├── EnemySystem.js
│       ├── CombatSystem.js
│       └── XPSystem.js
│
└── tests/                      ← Testes unitários (Vitest)
    ├── combat.test.js
    ├── dungeon.test.js
    └── xp.test.js
```

**Princípio de arquitetura:** cenas orquestram, sistemas executam. Uma cena nunca calcula dano ou gera dungeon diretamente. Sistemas não se importam mutuamente — comunicação via parâmetros explícitos ou eventos Phaser (`this.events.emit` / `this.events.on`).

---

## Workflow de Desenvolvimento

**Branches:**
- `main` → produção
- `staging` → integração
- `feature/*` → desenvolvimento de funcionalidades

**Regras:**
- PR obrigatório para merge em `staging` e `main`
- Revisão de código entre membros do time
- CI via GitHub Actions valida mensagens de commit em todo PR

---

## Padrão de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/) — enforçado via Husky + Commitlint:

```
tipo(escopo): descrição curta
```

| Tipo | Uso | Impacto no SemVer |
|------|-----|-------------------|
| `feat` | Nova funcionalidade | MINOR |
| `fix` | Correção de bug | PATCH |
| `refactor` | Refatoração sem mudança de comportamento | — |
| `test` | Adição ou correção de testes | — |
| `docs` | Apenas documentação | — |
| `chore` | Manutenção, CI, dependências | — |

**Escopos sugeridos:** `player`, `dungeon`, `combat`, `xp`, `enemy`, `input`, `render`, `config`, `ci`

**Exemplos:**
```bash
feat(combat): add critical hit calculation
fix(dungeon): correct BSP corridor overlap
docs(specs): update xp spec with level cap
chore(ci): add commitlint to GitHub Actions workflow
```

Veja o histórico completo de mudanças no [CHANGELOG.md](./CHANGELOG.md).

---

## Equipe

- **Nome:** Vitor Borges  
  - 📧 Email: vitor.borges1989@gmail.com  
  - 💻 GitHub: https://github.com/vborges1  
  - 💻 Função: Bardo

- **Nome:** Gianmarco Casati
  - 📧 Email: 
  - 💻 GitHub: https://github.com/gmcasati  
  - 💻 Função: Mago

- **Nome:** Paolo
  - 📧 Email:
  - 💻 GitHub: https://github.com/paolojcm  
  - 💻 Função: Mago

- **Nome:** Andrea González
  - 📧 Email:
  - 💻 GitHub: https://github.com/andreagonzalez  
  - 💻 Função: Paladina



Projeto acadêmico — Equipe 7 | IA para DEVs SCTEC T2
