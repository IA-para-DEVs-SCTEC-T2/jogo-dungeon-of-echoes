# Game Steering — Dungeon of Echoes

## Objetivo do Jogo

Dungeon of Echoes é um RPG 2D tile-based jogado no navegador. O jogador explora masmorras geradas proceduralmente, enfrenta inimigos, ganha XP e avança de nível. O MVP foca em mecânicas jogáveis e sólidas antes de qualquer complexidade adicional.

## Princípios de Desenvolvimento

### 1. Simplicidade Primeiro
- Cada sistema deve fazer uma coisa bem feita
- Evitar over-engineering: se não está na spec, não implementar
- Código legível vale mais que código "inteligente"

### 2. Modularidade
- Cada sistema (Player, Dungeon, Enemy, Combat, XP) vive em seu próprio módulo
- Comunicação entre sistemas via eventos Phaser ou referências diretas simples
- Nenhum módulo deve conhecer os detalhes internos de outro

### 3. Código Guiado por Specs
- Nenhuma feature é implementada sem spec correspondente
- A spec define o comportamento esperado; o código o realiza
- Testes (quando existirem) validam a spec, não o código

### 4. Iteração Incremental
- MVP primeiro, expansão depois
- Cada iteração deve resultar em algo jogável
- Não bloquear progresso por features futuras

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Engine | Phaser 4 |
| Linguagem | TypeScript (ES Modules) |
| Build | Vite |
| Testes | Vitest (108 testes) |
| Qualidade | Husky + Commitlint |
| Assets | Dawnlike 16×16 tileset (CC-BY) |

## Restrições

- **Sem IA generativa** neste estágio (preparar hooks para expansão futura)
- **Sem banco de dados** — estado apenas em memória durante a sessão
- **Sem servidor backend** — jogo 100% client-side
- **Sem animações complexas** — sprites estáticos (frame fixo por entidade)
- **Sem save persistente** — cada sessão começa do zero; estado da dungeon persiste *dentro* da sessão via `WorldSystem`
- **Sistemas nunca importam Scenes** — comunicação via EventBus
- **Scenes nunca calculam lógica de domínio** — delegam a Systems

## Estrutura de Pastas

```
/src
  /scenes       → Cenas Phaser (Boot, Game, GameOver, UI)
  /systems      → Lógica de jogo (TurnManager, CombatSystem, EnemySystem,
                   XPSystem, InventorySystem, LootSystem, WorldSystem)
  /entities     → Entidades puras (Player, Item)
  /generators   → Geração procedural (DungeonGenerator)
  /utils        → Constantes, EventBus
.kiro/
  /steering     → Diretrizes do projeto (este arquivo)
  /specs        → Especificações de cada sistema
/tests          → Testes unitários (Vitest)
/public/assets/dawnlike → Tileset Dawnlike 16×16 (CC-BY)
```

## Fluxo de Desenvolvimento

1. Escrever/revisar spec do sistema em `.kiro/specs/`
2. Implementar o sistema seguindo a spec
3. Integrar na cena principal
4. Validar manualmente o comportamento
5. Escrever testes automatizados em `/tests`

## Expansões Futuras Planejadas

Estes sistemas NÃO fazem parte do MVP atual mas o código deve ser estruturado para suportá-los:

- **Fog of War**: visibilidade por tile (spec pronta em `.kiro/specs/fog-of-war.spec.md`)
- **Minimap**: overlay com estado de exploração (spec em `.kiro/specs/minimap.spec.md`)
- **Múltiplos andares**: escadas, progressão vertical de dungeon
- **Habilidades**: árvore de habilidades por classe
- **IA de Inimigos**: pathfinding A*, comportamentos variados por tipo
- **Narrativa por IA**: lores geradas por LLM — Claude Haiku (preparar hooks)
