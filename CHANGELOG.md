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

[Unreleased]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/releases/tag/v0.1.0
