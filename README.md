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

## Dashboard

https://ia-para-devs-sctec-t2.github.io/jogo-dungeon-of-echoes/dashboard/

---

## Status do Projeto

| Item | Status |
|------|--------|
| MVP jogável | ✅ Entregue |
| Geração procedural de dungeon | ✅ Implementado |
| Combate turn-based com dano funcional | ✅ Implementado |
| Sistema de XP e level up | ✅ Implementado |
| Atributos base RPG (CON/WIS/INT…) e Mana | ✅ Implementado |
| IA de inimigos (IDLE → CHASING → ATTACKING) | ✅ Implementado |
| HUD persistente (UIScene overlay) | ✅ Implementado |
| Movimento contínuo ao segurar direcional | ✅ Implementado |
| FOG of War | 🔜 Planejado |
| Inventário e itens | 🔜 Planejado |
| Integração com IA Generativa | 🔜 Planejado |

---

## Principais Mecânicas

**Loop de jogo turn-based:**
```
Input do jogador → Resolve ação (mover / atacar) → Turno dos inimigos → Verifica condições → Atualiza HUD
```

- Exploração de masmorra gerada proceduralmente em grid **40×40 tiles** (TILE_SIZE: 16px)
- Cada ação do jogador consome um turno; inimigos se movem logo após
- Segurar direcional move o personagem continuamente (cooldown de 150ms por tile)
- Combate automático: player ataca ao mover para tile ocupado por inimigo vivo
- Ganho de XP ao derrotar inimigos; fórmula: `XP necessário = 100 × N × (N + 1) / 2`
- Permadeath — cada partida começa do zero

**Atributos derivados do Player:**

| Atributo | Fórmula |
|----------|---------|
| HP máximo | `CON × 5 + Nível × 3` |
| Mana máxima | `WIS × 4 + INT × 2` |
| XP para próximo nível | `100 × N × (N + 1) / 2` |

**Sistemas implementados:**

| Sistema | Responsabilidade |
|---------|-----------------|
| `Player` (entity) | Atributos base (STR/INT/DEX/CON/WIS/CHA), HP, Mana, movimento no grid |
| `DungeonGenerator` | Geração procedural BSP, mapa de tiles 40×40 |
| `EnemySystem` | Spawn, IA com estados IDLE → CHASING → ATTACKING, detecção por sala e raio |
| `CombatSystem` | Resolução de ataque, cálculo de dano fixo, morte e concessão de XP |
| `XPSystem` | Acúmulo de XP, level up com múltiplos saltos, recálculo de atributos |
| `UIScene` | HUD overlay com barras HP/Mana, labels Nível/ATK/XP e log de mensagens |
| `EventBus` | Canal de eventos cross-cena (singleton, sem dependência de Phaser) |

---

## Tecnologias

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Engine de jogo | Phaser | 4.0.0 |
| Linguagem | TypeScript | ^5.x (strict) |
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
├── vite.config.ts              ← Configuração do build
├── tsconfig.json               ← TypeScript (strict)
├── package.json
│
├── dashboard/
│   └── index.html              ← Dashboard estático (GitHub API)
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
│   ├── main.ts                 ← Bootstrap do Phaser + pipeline de cenas
│   ├── scenes/                 ← Camada de apresentação (Phaser Scenes)
│   │   ├── BootScene.ts        ← Tela de carregamento + assets .png
│   │   ├── GameScene.ts        ← Cena principal do jogo
│   │   ├── UIScene.ts          ← HUD overlay (HP/Mana/XP/log)
│   │   └── GameOverScene.ts    ← Tela de Game Over
│   ├── entities/
│   │   └── Player.ts           ← Sprite + atributos base (STR/CON/WIS…)
│   ├── systems/                ← Camada de lógica de domínio
│   │   ├── EnemySystem.ts      ← IA: IDLE → CHASING → ATTACKING
│   │   ├── CombatSystem.ts     ← Resolução de ataque e dano
│   │   └── XPSystem.ts         ← XP, level up, recálculo de atributos
│   ├── generators/
│   │   └── DungeonGenerator.ts ← BSP procedural, salas e corredores
│   └── utils/
│       ├── constants.ts        ← TILE_SIZE=16, BASE_STATS, EVENTS, etc.
│       └── EventBus.ts         ← Emitter cross-cena (sem dependência Phaser)
│
├── public/
│   └── assets/dawnlike/        ← Sprites .png (Dawnlike CC-BY 4.0)
│
└── tests/                      ← Testes unitários (Vitest) — 48 testes
    ├── combat.test.js
    ├── constants.test.js
    ├── dungeon.test.js
    ├── enemy.test.js
    ├── enemy-ai.test.js        ← IA: estados, movimentação, detecção
    ├── player-collision.test.js← Colisão com paredes e cooldown
    └── xp.test.js
```

**Princípio de arquitetura:** cenas orquestram, sistemas executam. Uma cena nunca calcula dano ou gera dungeon diretamente. Sistemas comunicam-se via `EventBus` (cross-cena) ou `scene.events` (local) — nunca por importação direta.

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

- **Nome:** Paolo Murari
  - 📧 Email: paolojcm@gmail.com
  - 💻 GitHub: https://github.com/paolojcm  
  - 💻 Função: Mago

- **Nome:** Andrea González
  - 📧 Email: andreavgonzalez7@gmail.com
  - 💻 GitHub: https://github.com/andreagonzalez  
  - 💻 Função: Paladina

- **Nome:** Rafael
  - 📧 Email: rafael_n_rosa@estudante.sesisenai.org.br
  - 💻 GitHub: https://github.com/andreagonzalez  
  - 💻 Função: Paladina



Projeto acadêmico — Equipe 7 | IA para DEVs SCTEC T2
