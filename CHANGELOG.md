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

#### Dashboard de Acompanhamento (`dashboard/index.html`)
- Página estática de dashboard do projeto consumindo a API pública do GitHub em tempo real
- Timeline de commits do branch `staging` com diferenciação visual entre commits de feature e merges
- Listagem dos top-5 contribuidores com avatar, login e contagem de commits
- Renderização do `CHANGELOG.md` diretamente do repositório via `marked.js`
- Layout responsivo com Tailwind CSS, efeito glassmorphism e tipografia Inter + JetBrains Mono
- SHA truncado (7 caracteres) com badge colorido por tipo de mudança (feature vs. merge)

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
