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
| Linguagem | TypeScript (novos sistemas) + JavaScript legado |
| Build | Vite |
| Testes | Vitest (125+ testes) |
| Qualidade | Husky + Commitlint |
| Assets | Dawnlike 16×16 tileset (CC-BY) |

## Restrições

- **IA generativa integrada de forma não-bloqueante** — `AIService.ts` + `NarrativeService.ts` geram descrições de itens raros e variantes de inimigos elite; fallback gracioso quando API indisponível; cache por sessão para evitar chamadas duplicadas
- **Sem banco de dados** — estado apenas em memória durante a sessão
- **Sem servidor backend** — jogo 100% client-side
- **Sem animações complexas** — sprites estáticos (frame fixo por entidade)
- **Sem save persistente** — cada sessão começa do zero; estado da dungeon persiste *dentro* da sessão via `WorldSystem`
- **Sistemas nunca importam Scenes** — comunicação via EventBus (`EVENTS.*`)
- **Scenes nunca calculam lógica de domínio** — delegam a Systems
- **Magic frame numbers pertencem a `sprites-config.ts`** — não espalhar literais de frame em cenas ou sistemas
- **Biomas e variantes de tile resolvidos por `CityLayoutProcessor` + `TileVariantResolver`** — `GameScene` apenas consome `ProcessedTownLayout`, não decide frames
- **NPCs com `wanderBounds` undefined são estáticos**; com bounds wandam (`customWanderBounds` para o Gato)
- **`interactRange`** em `NPCInstanceDef` define raio de interação em manhattan distance (padrão 1); usar `2` para NPCs atrás de balcão
- **Objetos estáticos interativos** (placas, sinais) são criados via `TileOverride.interaction` em `MANUAL_MAP_OVERRIDES` — sem sprite NPC dedicado; `TownTMXRenderer` os converte em `npcSpawns`
- **Entradas da dungeon** definidas por `entrarDungeon: true` em `MANUAL_MAP_OVERRIDES` — nunca em array estático; `GameScene._loadTown()` lê e popula `_dungeonEntryTiles`
- **`TMX_REMOVED_POSITIONS`** é verificado antes de qualquer renderização de sprite no `TownTMXRenderer`; cobre GIDs fora do intervalo NPC também
- **`NPCController.getAllNPCs()`** retorna posição atual (`gridX/gridY`) — nunca a posição de spawn; `InteractiveObjectSystem` depende disso para NPCs que wandam
- **InputModeManager** controla qual painel recebe input — `push()` ao abrir, `pop()` ao fechar; em modo ≠ GAMEPLAY o personagem não se move
- **`INVENTORY_OPENED` é o único evento que autoriza `_inventoryPanel.show()`** — `INVENTORY_STATE_RESPONSE` apenas atualiza dados; nunca abre o painel
- **Bônus de equipamento são reversíveis** — `Player.applyEquipmentBonuses()` / `removeEquipmentBonuses()` acumulam em `_equipmentBonuses`; `recalcStats()` é a fonte de verdade dos stats derivados
- **Renderização de dungeon é delegada ao `DungeonRenderer`** — `GameScene` apenas itera `RenderCommand[]` e cria sprites; zero lógica de autotiling na cena
- **`AutoTileResolver` nunca instancia objetos Phaser** — opera sobre `grid[][]` + `SemanticGrid` e retorna `TileRenderData`; extensão futura: adicionar entrada em `TileSemanticsProvider` + `TileCategory` + `AutoTileSet` no tema
- **Temas visuais em `dungeon-themes.ts`** — `TileCategory` extensível (inclui `wall_edge`, `void`, `string` para biomas); frames organizados por `AutoTileSet` (campos legados) e `BitmaskFrameSet` (campos de bitmask); `themeForFloor()` mapeia andar → tema
- **Pipeline de renderização dungeon = 3 etapas em ordem**: (1) `classifyGrid(grid)` → `SemanticGrid`, (2) `DungeonRenderer.buildCommands()` skipa VOID e delega ao resolver, (3) `GameScene` cria sprites e define `cameras.main.setBackgroundColor(0x000000)`
- **`SemanticClassifier` usa apenas 4 vizinhos cardinais** para classificar a shell — diagonais participam apenas no bitmask; isso garante `WALL_EDGE` de exatamente 1 tile de espessura e evita silhuetas diagonais grossas
- **`TileSemanticsProvider` é a fonte de verdade de abertura visual** — bitmask usa `isVisuallyOpen`, não `=== TILE.FLOOR`; futuras categorias (water, lava, chasm) registram suas flags aqui sem alterar o resolver
- **Variação de body walls deve ser mínima** — `bodyFrames` de `wall_edge` contém 1 frame; silhueta legível tem prioridade absoluta sobre detalhe de textura
- **`BONUS_AREA_OVERRIDES` é estritamente isolado de `MANUAL_MAP_OVERRIDES`** — nunca cruzar importações entre `BonusAreaData.ts` e `TileProperties.ts`
- **`DEV_CONFIG.godMode`** em `constants.ts` — flag de desenvolvimento; `CombatSystem` consulta antes de aplicar dano ao player; manter `false` em produção
- **`DEV_CONFIG.devMode`** em `constants.ts` — quando `true`, `BootScene` transita diretamente para `GameScene` pulando o `MainMenuScene`; útil em desenvolvimento; manter `false` em produção
- **Magias são data-driven** — `spells.db.ts` é a única fonte de verdade para atributos de magia; `spell-progression.ts` define quando cada magia é desbloqueada; nunca hardcodar IDs ou dano em Systems
- **`SpellCastingSystem` nunca importa `SpellSystem` diretamente** — recebe instância como parâmetro em `cast()`; retorna `SpellCastResult` com `hitEnemies: EnemySystem[]`
- **Magias são melee-range** — `SpellCastingSystem.cast()` verifica os 4 tiles cardinais adjacentes ao player e aplica dano em todos os inimigos encontrados; sem projétil
- **Dois slots de magia (`equippedSpells[0]`, `equippedSpells[1]`)** — mapeados para teclas `J` e `K` no gameplay; slots exibidos no footer (action bar), canto direito, tamanho 20×20
- **`facingDir`** em `Player` mantido para uso futuro (direcionalidade); não é usado pelo `SpellCastingSystem` atual
- **Navegação de magias no painel `I`** — ←/→ trocam aba; na aba Magias, ↓ entra na lista, ↑ na primeira magia volta às abas; Enter/E equipa em J, K equipa em K; `SPELLS_SELECTION_CHANGED` sincroniza seleção visual no `SpellsPanel`

## Estrutura de Pastas

```
/src
  /scenes       → Cenas Phaser (Boot, MainMenu, Credits, Game, GameOver, UI, VisualRegression*)
                   * VisualRegressionScene existe exclusivamente para regressão de autotiling; não é cena de produção
                   * Fluxo normal: BootScene → MainMenuScene → GameScene
                   * Com devMode=true: BootScene → GameScene (pula menu)
  /systems      → Lógica de jogo (sem dependência de Phaser):
                   TurnManager, CombatSystem, EnemySystem, XPSystem
                   InventorySystem, EquipmentSystem, ShopSystem
                   InputModeManager, LootSystem, WorldSystem, LogSystem
                   NPCController, NPCSystem, InteractiveObjectSystem, CityDecorationSystem
                   MapTransitionSystem, DungeonFloorManager, DifficultyScalingSystem
                   AutoTileResolver, DungeonRenderer, BonusAreaRenderer
                   SemanticClassifier, TileSemanticsProvider, WallVariantLUT
                   DebugOverlayRenderer, MaskFrequencyLogger
                   SpellSystem, SpellCastingSystem
                   PlayerMetrics, DifficultyManager, EventMemory
  /entities     → Entidades puras (Player — gold, equipmentBonuses, facingDir, spells; Item — slotId, bonuses)
  /generators   → DungeonGenerator, DungeonFeatureGenerator, CityLayoutProcessor, TileVariantResolver
  /config       → constants.ts, town.config.ts, sprites-config.ts, shop.catalog.ts
                   spells.db.ts, spell-progression.ts, dungeon-themes.ts, difficulty.config.ts
                   BonusAreaData.ts, TileProperties.ts, enemies.config.ts
  /types        → town.ts, equipment.ts, viewmodels.ts, input.ts, spells.ts, difficulty.ts
  /utils        → EventBus, constants
  /ui           → InventoryPanel, ShopPanel, DialogPanel, LogPanel, ActionBarPanel, SpellsPanel, StatusPanel
  /ai           → AIService, NarrativeService, AIIntegration (não-bloqueante, fallback gracioso)
.kiro/
  /steering     → Diretrizes do projeto (este arquivo)
  /specs        → Especificações de cada sistema
/tests          → Testes unitários (Vitest, 125+ testes)
/public/assets/dawnlike → Tileset Dawnlike 16×16 (CC-BY)
```

## Fluxo de Desenvolvimento

1. Escrever/revisar spec do sistema em `.kiro/specs/`
2. Implementar o sistema seguindo a spec
3. Integrar na cena principal
4. Validar manualmente o comportamento
5. Escrever testes automatizados em `/tests`

## Regras Arquiteturais Adicionais

- **`DifficultyManager` e `PlayerMetrics`** vivem em `src/systems/` e não têm dependência de Phaser; são testáveis em Node puro
- **`AIService` é assíncrono e não-bloqueante** — nunca aguarda resposta da API no game loop; usa cache por sessão; falha silenciosamente com fallback para conteúdo padrão
- **`VisualRegressionScene`** é exclusivamente para testes de regressão de autotiling (teclas 1-4 toggleiam debug modes); não deve ser incluída em builds de produção
- **`PlayerMetrics` alimenta `DifficultyManager`** via sliding window de 20 turnos; `DifficultyScalingSystem` aplica os multiplicadores por andar; os três sistemas são independentes entre si

## Histórico de Correções Críticas

### v1.0.1 (2026-05-20)
- **`ActionBarPanel._getItemVisual()`**: `switch` sem `default` retornava `undefined` para `EquippableItemType`, causando crash ao coletar equipamentos. Adicionado `default` com fallback para frame 0
- **`SpellsPanel` — labels dos botões Equipar**: labels fixos `['H','J','K','L']` não correspondiam aos slots reais de classes não-Mago (`J`/`K`). Labels agora derivados de `vm.activeSlots[i].key` em `render()`; botão também exibe o nome da magia já equipada no slot
- **Promises narrativas sem `.catch()`**: `generateNarrative()` e `generateDeathStory()` podiam gerar `UnhandledPromiseRejection`. `.catch()` silencioso adicionado em ambas

## Expansões Futuras Planejadas

Estes sistemas NÃO fazem parte do MVP atual mas o código deve ser estruturado para suportá-los:

- **Fog of War**: visibilidade por tile (spec pronta em `.kiro/specs/fog-of-war.spec.md`)
- **Minimap**: overlay com estado de exploração (spec pronta em `.kiro/specs/minimap.spec.md`)
- **Habilidades**: árvore de habilidades por classe
- **IA de Inimigos**: pathfinding A*, comportamentos variados por tipo
- **Save / Placar local**: persistência entre sessões
