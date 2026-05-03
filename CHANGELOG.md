# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## Como manter este changelog

**Regra principal:** cada entrada deve descrever impacto real para quem usa ou desenvolve o jogo — não listar commits.

### Quando atualizar

Ao abrir um PR, adicione a entrada na seção `[Unreleased]` antes de fazer merge.
No momento do release, renomeie `[Unreleased]` para a versão e data correspondentes.

### Padrão de commit (Conventional Commits)

```
<tipo>(<escopo>): <descrição curta>

Tipos permitidos:
  feat     → nova funcionalidade (MINOR no SemVer)
  fix      → correção de bug (PATCH)
  chore    → manutenção, CI, dependências (não vai para o changelog público)
  docs     → apenas documentação
  refactor → refatoração sem mudança de comportamento
  test     → adição ou correção de testes
  perf     → melhoria de performance

Escopos sugeridos: player, dungeon, combat, xp, enemy, input, render, config, ci
```

### Exemplos de entradas bem escritas

```markdown
### Added
- Geração procedural de masmorras com salas conectadas por corredores

### Fixed
- Personagem não bloqueava em tiles de parede ao usar movimento diagonal

### Changed
- Progressão de XP rebalanceada: cada nível requer 20% mais experiência
```

---

## [Unreleased]

### Added
- Variantes de chão aleatórias por sessão: 14 frames distintos do `Ground0.png` (pedra, terra, grama, areia, neve, rocha vulcânica, etc.)
- Cada nova partida sorteia um tipo de chão diferente, gerando ambientes visualmente únicos

#### Dashboard — redesign e correção de contributors
- Barra de stat cards no topo: Total de Commits, Branches ativas, PRs Abertos, PRs Fechados e Total de Contribuidores
- Seção dedicada de Pull Requests com badges de status (aberto/fechado) e links diretos para o GitHub
- Ranking de contributors com medalhas 🥇🥈🥉 e contagem de commits por membro
- Skeleton loaders em todos os blocos durante o carregamento dos dados

### Fixed
- **Contributors incompletos no dashboard**: substituída varredura por branches (múltiplas chamadas, risco de duplicatas) pelo endpoint `/stats/contributors` — uma única chamada que retorna contagem real de commits únicos por autor em todo o repositório; inclui retry automático para retorno 202
- **Dashboard travava no 403 (rate limit)**: refatorada `fetchData` com `safeApiFetch` — cada seção falha de forma isolada e um banner de aviso é exibido quando o rate limit da API pública do GitHub (60 req/hora) é atingido
- **Contributors zerados quando `/stats/contributors` retorna erro**: adicionado fallback automático para o endpoint `/contributors` simples — garante exibição do ranking mesmo quando as estatísticas calculadas não estão disponíveis

---

## [0.1.2] — 2026-05-02

### Added

#### HUD persistente (`UIScene`)
- Nova cena `UIScene` executada em paralelo à `GameScene` via `this.scene.launch('UIScene')`
- Barra de HP com gradiente verde→vermelho quando HP < 30% do máximo
- Barra de Mana (azul) calculada pela fórmula `WIS × 4 + INT × 2`
- Labels de Nível, ATK e XP no formato `XP: atual / próximo`
- Log de mensagens com as últimas 5 linhas na base da tela (combate, level up, morte)
- Sincronização via `EventBus` (singleton sem dependência de Phaser) — UIScene nunca acessa o Player diretamente

#### Atributos base RPG no Player
- Atributos `STR`, `INT`, `DEX`, `CON`, `WIS`, `CHA` inicializados via `BASE_STATS` (CON=18)
- HP máximo calculado pela fórmula da spec: `CON × 5 + Nível × 3`
- Mana máxima calculada pela fórmula da spec: `WIS × 4 + INT × 2`
- Método `recalcStats()` recalcula derivados a cada level up — elimina bônus fixo por nível
- Método `useMana(amount)` deduz mana e emite `PLAYER_MANA_CHANGED`

#### IA de perseguição dos inimigos
- Máquina de estados por inimigo: `IDLE → CHASING → ATTACKING`
- Detecção por **setor**: inimigo entra em CHASING se o player estiver na mesma sala (bounds do Room BSP) **ou** dentro do `detectionRadius` (8 tiles por padrão)
- Movimentação: 1 tile por turno, priorizando o eixo de maior distância; respeita paredes e colisão entre inimigos
- Ataque automático quando adjacente ao player; dano aplicado via `player.takeDamage()` (emite `PLAYER_HP_CHANGED`)
- Turno dos inimigos processado após cada ação do player em `GameScene._tickEnemies()`

#### Movimento contínuo por teclado
- Input migrado de `JustDown` (único disparo) para `isDown` (contínuo enquanto tecla pressionada)
- Cadência de movimento controlada pelo cooldown interno do `Player.tryMove()` (150ms) — mantém sensação de grid clássico sem clique por ação

#### Dashboard de acompanhamento (`dashboard/index.html`)
- Página estática consumindo a API pública do GitHub em tempo real
- Timeline de commits do branch `staging` com diferenciação visual feature vs. merge
- Listagem dos top-5 contribuidores com avatar, login e contagem de commits
- Renderização do `CHANGELOG.md` diretamente do repositório via `marked.js`
- Layout responsivo com Tailwind CSS, efeito glassmorphism e tipografia Inter + JetBrains Mono

### Fixed

- **HP do inimigo não diminuía visualmente**: `_syncEnemySprite()` estava definida mas nunca era chamada após combate — corrigido em `_resolveCombat()` e `_tickEnemies()`
- **UIScene não atualizava HP do player após contra-ataque**: `CombatSystem` modificava `player.hp` diretamente sem emitir evento; `_resolveCombat()` agora emite `PLAYER_HP_CHANGED` via `EventBus` após cada contra-ataque
- **Fórmula de XP inconsistente**: unificada para `100 × N × (N + 1) / 2` (spec) em `XPSystem._xpToNextLevel()`, eliminando o loop acumulativo anterior
- **EventBus incompatível com ambiente de teste Node.js**: substituída dependência de `Phaser.Events.EventEmitter` por um emitter mínimo sem `window` — testes continuam passando sem mock de browser

### Testing

- `tests/combat.test.js` — 2 novos cenários: HP do inimigo diminui após ataque; HP do player diminui no contra-ataque (7 testes total)
- `tests/player-collision.test.js` — nova suíte com 8 testes: movimento válido, bloqueio em 4 direções, cooldown de input e retorno de alvo inimigo
- `tests/enemy-ai.test.js` — nova suíte com 8 testes: estados IDLE/CHASING/ATTACKING, movimentação, colisão com parede, colisão entre inimigos, detecção por sala, inimigo morto
- Total: **48 testes passando** (eram 30 antes desta versão)

---

## [0.1.1] — 2026-05-01

### Added

#### Visual — Tileset Dawnlike 16×16
- Integração do tileset **Dawnlike** (DragonDePlatino, CC-BY 4.0) substituindo os placeholders de retângulos coloridos
- Tiles de chão renderizados com `Ground0.png` (frame 3 — pedra cinza)
- Tiles de parede renderizados com `Wall.png` (frame 3)
- Sprite do personagem jogável carregado de `Player0.png` (frame 24 — idle de frente)
- Sprite de inimigos carregado de `Undead0.png` (frame 0 — esqueleto)
- Easter egg obrigatório: sprite do **Platino** (mascote do autor, `Reptile0.png`) posicionado na última sala da dungeon com alpha reduzido — cumprimento da licença CC-BY 4.0
- Crédito `© DragonDePlatino CC-BY 4.0` exibido junto ao easter egg
- Assets servidos via `public/assets/dawnlike/` (Vite static serving)
- Zoom de câmera em 2× para melhor visualização dos tiles 16×16 — 2026-05-01

### Added

#### Visual — Tileset Dawnlike 16×16
- Integração do tileset **Dawnlike** (DragonDePlatino, CC-BY 4.0) substituindo os placeholders de retângulos coloridos
- Tiles de chão renderizados com `Ground0.png` (frame 3 — pedra cinza)
- Tiles de parede renderizados com `Wall.png` (frame 3)
- Sprite do personagem jogável carregado de `Player0.png` (frame 24 — idle de frente)
- Sprite de inimigos carregado de `Undead0.png` (frame 0 — esqueleto)
- Easter egg obrigatório: sprite do **Platino** (mascote do autor, `Reptile0.png`) posicionado na última sala da dungeon com alpha reduzido — cumprimento da licença CC-BY 4.0
- Crédito `© DragonDePlatino CC-BY 4.0` exibido junto ao easter egg
- Assets servidos via `public/assets/dawnlike/` (Vite static serving)
- Zoom de câmera em 2× para melhor visualização dos tiles 16×16

#### Configuração do motor
- `pixelArt: true` adicionado ao config do Phaser — desativa anti-aliasing nas texturas (necessário para tiles pixel art ficarem nítidos no WebGL)
- Physics Arcade configurada (`physics.default: 'arcade'`, gravity zero)
- Grid corrigido para **40×40** tiles (era 40×30)

#### Migração para TypeScript
- Todos os arquivos `.js` convertidos para `.ts` com tipagem explícita (`strict: true`)
- `tsconfig.json` adicionado com `moduleResolution: bundler` (compatível com Vite)
- `typescript` adicionado como devDependency

#### Reorganização de pastas
- `src/entities/Player.ts` — entidade `Player` estendendo `Phaser.GameObjects.Sprite` diretamente (antes era `PlayerSystem` desacoplado)
- `src/generators/DungeonGenerator.ts` — lógica de geração de dungeon movida de `systems/` para pasta dedicada
- `src/utils/constants.ts` — constantes centralizadas (antes em `src/config/constants.js`)

#### Governança
- Template de Pull Request (`.github/pull_request_template.md`) com seções padronizadas
- Hook `pre-commit` atualizado para exigir `CHANGELOG.md` e `docs/prompts/<membro>.md` em todo commit

### Fixed
- `index.html` corrigido: `src="/src/main.js"` → `src="/src/main.ts"` — causava `NS_ERROR_CORRUPTED_CONTENT` após migração TypeScript
- Import do Phaser 4 corrigido: `import Phaser from 'phaser'` → `import * as Phaser from 'phaser'` em todos os arquivos de cena

### Changed
- `TILE_SIZE` reduzido de 32 para **16** pixels — alinhado com a grade nativa do Dawnlike
- Renderização da dungeon migrada de `this.add.rectangle()` para `this.add.image()` com frames do spritesheet
- Sprites de personagens e inimigos migrados de retângulos para `this.add.sprite()` com frames do Dawnlike

---

## [0.1.0] — 2026-04-30

Versão inicial do MVP do jogo *Dungeon of Echoes* — RPG 2D tile-based com geração
procedural de masmorras, combate turno-a-turno e progressão de personagem.

### Added

#### Jogo (MVP jogável)
- Geração procedural de masmorras com salas retangulares conectadas por corredores
- Renderização de tiles com diferenciação visual entre chão, paredes e corredores
- Personagem jogável controlado por teclado (WASD ou setas direcionais)
- Sistema de atributos do jogador: HP, ataque, defesa e velocidade
- Sistema de combate turno-a-turno com ataque e contra-ataque automático por inimigos
- Feedback visual de dano com texto animado flutuante e flash de câmera
- Spawn de inimigos em posições válidas de chão da masmorra
- IA de inimigos: movimentação em direção ao jogador ao entrar no campo de visão
- Sistema de XP com progressão de nível, incluindo suporte a múltiplos level-ups encadeados
- Tela de carregamento (BootScene) com transição automática para o jogo
- Tela de Game Over exibindo XP total e nível atingido, com opção de reiniciar
- Câmera com follow suave no personagem e bounds limitados ao tamanho da masmorra
- HUD com indicadores de HP, nível e XP atualizados em tempo real
- Configuração de escala responsiva (FIT + CENTER_BOTH) para diferentes resoluções

#### Especificações técnicas (`.kiro/specs/`)
- Spec de Player: movimento, atributos, colisão com paredes
- Spec de Dungeon: geração procedural, FOG of War (planejado)
- Spec de Enemy: IA, factory de spawn, comportamento por tile
- Spec de Combat: fluxo de ataque/defesa, cálculo de dano
- Spec de XP: fórmula de progressão, level-up, atributos por nível
- Spec de GameLoop: cenas Phaser, estados do jogo, transições
- Spec de Input: mapeamento de teclado, prioridade de ações

#### Infraestrutura e qualidade
- Projeto configurado com Vite como build tool e dev server (porta 3000)
- Vitest configurado para testes unitários — 17 testes passando na entrega inicial
- Husky + commitlint configurados para validar mensagens de commit no pre-commit
- GitHub Actions com workflow de CI para validação de commits em PRs
- `.gitignore` abrangente cobrindo `node_modules`, `dist`, logs e caches de IDE
- README com visão geral do projeto, instruções de setup e estrutura de diretórios

### Changed

- Migração de **Phaser 3.60.0 para Phaser 4.0.0**
  - Atualizado import de `default` para namespace (`import * as Phaser from 'phaser'`)
    devido à remoção do `default` export no Phaser 4
  - Adicionada configuração explícita de `roundPixels: true` (o padrão mudou para
    `false` no Phaser 4, o que causava borramento em tiles pixel-art)

---

[Unreleased]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/releases/tag/v0.1.0
