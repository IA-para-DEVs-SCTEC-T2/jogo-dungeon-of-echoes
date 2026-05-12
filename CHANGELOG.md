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

## [0.5.4] — 2026-05-12

### Added

#### Sistema de Magias (Spells)

- **`SpellSystem`** (`src/systems/SpellSystem.ts`): gerencia desbloqueio e equipamento de magias; dois slots (`equippedSpells[0]` e `[1]`); `unlockSpellsForLevel()` consulta `SPELL_PROGRESSION` data-driven; `canCast()` verifica cooldown; `recordCast()` registra timestamp
- **`SpellCastingSystem`** (`src/systems/SpellCastingSystem.ts`): verifica cooldown e mana, desconta custo, aplica dano em **todos** os inimigos adjacentes (4 cardinais); retorna `SpellCastResult` com a lista de `hitEnemies`; sem projétil — mecânica melee-range igual ao ataque normal
- **`SpellsPanel`** (`src/ui/SpellsPanel.ts`): painel de magias integrado ao painel `I`; mesmas dimensões do inventário (85%×80%); navegação por teclado — ↓ entra na lista, ↑ na primeira magia volta para as abas, **Enter/E** equipa no slot J, **K** equipa no slot K
- **`StatusPanel`** (`src/ui/StatusPanel.ts`): painel de atributos detalhados do player (STR/INT/DEX/CON/WIS/CHA, HP, Mana, nível)
- **`spells.db.ts`** (`src/config/spells.db.ts`): 5 magias data-driven — `fire_bolt` (nv 1), `ice_shard` (nv 5), `wind_cyclone` (nv 10), `fire_explosion` (nv 15), `blizzard` (nv 20)
- **`spell-progression.ts`** (`src/config/spell-progression.ts`): tabela de desbloqueio por nível, extendível sem alterar `SpellSystem`
- **`types/spells.ts`**: interfaces `SpellDef`, `SpellSlotState`, `SpellElement`, `Direction`
- Slots J/K movidos para dentro da action bar (footer), canto direito — mesmo tamanho dos slots de poção (20×20); barra de cooldown azul na base de cada slot
- `EVENTS.SPELL_CAST`, `EVENTS.SPELL_EQUIPPED`, `EVENTS.SPELLS_SELECTION_CHANGED`, `EVENTS.PLAYER_MANA_CHANGED` adicionados a `constants.ts`

### Changed

- `Player`: campos `facingDir: Direction`, `unlockedSpells: string[]`, `equippedSpells: [string | null, string | null]` adicionados à entidade
- `UIScene`: slots J/K no footer com cooldown visual; mana atualizada em tempo real via `PLAYER_MANA_CHANGED`
- `XPSystem`: chama `SpellSystem.unlockSpellsForLevel()` ao subir de nível — desbloqueia magias automaticamente
- `_handleInventoryInput` (GameScene): ←/→ trocam de aba; na aba Magias, ↓ entra na lista e ↑ na primeira magia retorna às abas
- Barra de HP do inimigo sincronizada imediatamente após dano de magia (`_syncEnemySprite` chamado em `_castSpell`)

### Fixed

- `SpellCastingSystem` tipado com `EnemySystem` (não `Enemy`) — corrige `takeDamage` chamado sem o `emitter` obrigatório, eliminando o `TypeError: can't access property "emit", emitter is undefined`
- Testes atualizados: `potion_poison` removido de `Item.ts` → substituído por `potion_mana`; HP no teste de cura ajustado para não ultrapassar o cap com `POTION_HEAL_AMOUNT = 25`; gold esperado no shop corrigido (preço 30→40)

---

## [0.5.3] — 2026-05-11

### Added

#### Renderização de dungeon — Shell-not-Volume (8-bit bitmask autotiling)

- **`TileSemanticsProvider`** (`src/systems/TileSemanticsProvider.ts`): desacopla semântica visual (`isVisuallyOpen`) de semântica de colisão (`isWalkable`, `isSolid`) — o bitmask não hardcoda `=== TILE.FLOOR`; extensível para water/lava/chasm sem alterar o resolver
- **`SemanticClassifier`** (`src/systems/SemanticClassifier.ts`): classifica cada tile como `FLOOR`, `WALL_EDGE` ou `VOID`; shell de exatamente **1 tile de espessura** usando apenas 4 vizinhos cardinais — sem silhuetas diagonais grossas
- **`WallVariantLUT`** (`src/systems/WallVariantLUT.ts`): LUT canônica de 256 entradas; `sanitizeMask()` fecha diagonais sem suporte cardinal (evita artefatos); `classifyVariant()` pura sem chain de overwrites; 7 variantes confirmadas no atlas DawnLike: `FACE`, `FACE_END_W`, `FACE_END_E`, `FACE_T`, `INNER_NW`, `INNER_NE`, `BODY`
- **`BitmaskFrameSet`** em `dungeon-themes.ts`: interface com campos semânticos por variante; nenhum frame hardcoded no resolver (atlas-agnostic)
- **`wall_edge`** como nova `TileCategory` em todos os 4 temas (dungeon, mine, underworld, underworld_boss): bitmask frames mapeados para sprites corretos de Wall.png
- **`void`** como nova `TileCategory`: tiles de parede profunda sem contato com piso não emitem `RenderCommand` — câmera preta preenche o vazio
- Variação de body walls reduzida a **1 frame fixo** por tema — silhueta tem prioridade sobre detalhe; floors mantêm pool de variação intacto
- Background da câmera definido como `0x000000` em `_loadDungeonFloor()` — nenhuma área de void fica transparente

#### Ferramental de debug visual (dev-only, tree-shakeable)

- **`DebugOverlayRenderer`** (`src/systems/DebugOverlayRenderer.ts`): substitui output do `DungeonRenderer` em modos `semantic` (categorias), `variant` (LUT result) e `bitmask` (valor numérico da mask)
- **`MaskFrequencyLogger`** (`src/systems/MaskFrequencyLogger.ts`): loga frequência de masks e variantes após `buildCommands()` — identifica masks dominantes, detecta estados impossíveis, verifica que `BODY` aparece raramente
- **`VisualRegressionScene`** (`src/scenes/VisualRegressionScene.ts`): cena determinística com grid hardcoded cobrindo todos os casos críticos (paredes retas, cantos externos/côncavos, corredor de 1 tile, T-junction, sala aberta); teclas `1–4` alternam modos de visualização, `L` dispara log de frequências

### Changed

- `DungeonRenderer.buildCommands()`: integra `classifyGrid()` como primeiro passo; tiles `VOID` são skippados sem emitir `RenderCommand` (~50% menos sprites em dungeons típicas BSP); `AutoTileResolver.resolve()` recebe `SemanticGrid` como novo parâmetro
- `AutoTileResolver.resolve()`: nova assinatura `(grid, sem, x, y, theme, floorNum)` — usa `SemanticGrid` para resolveCategory; branch `wall_edge` usa bitmask 8-bit quando `bitmaskFrames` presente no tema; fallback legado preservado para temas sem migração
- `dungeon-themes.ts`: `TileCategory` estendido com `'wall_edge'`, `'void'` e `string` (biomas futuros); `AutoTileSet` com campos opcionais `bitmaskFrames?` e `voidFrame?`
- `GameScene._loadDungeonFloor()`: adicionado `cameras.main.setBackgroundColor(0x000000)` antes do loop de sprites

## [0.5.2] — 2026-05-10

### Added

#### Renderização semântica de dungeon com autotiling

- **`AutoTileResolver`** (`src/systems/AutoTileResolver.ts`): resolve frames de tile com base no contexto espacial (vizinhos cardinais) — substitui seleção por hash simples; sem instanciar objetos Phaser
- **`DungeonRenderer`** (`src/systems/DungeonRenderer.ts`): itera o grid, delega ao resolver e emite `RenderCommand[]` — `GameScene` apenas consome os comandos para criar sprites
- **`dungeon-themes.ts`** reestruturado: `TileCategory` extensível, `AutoTileSet` com `face`, `cornerOuter_TL/TR`, `bodyFrames`, `cornerInner_TL/TR`; 4 temas completos (dungeon, mine, underworld, underworld_boss) com frames corretos de Wall.png e Floor.png
- Temas visuais por andar: andares 1–2 → Dungeon (pedra cinza), 3–4 → Mine (terra), 5–6 → Underworld (pedra escura), 7+ → Underworld Boss (mix abismo)
- Inner corners compartilhados (`cornerInner_TL: 362`, `cornerInner_TR: 360`) em todos os temas
- Variação determinística de frames por hash posicional — mesma seed, visual idêntico em reentrada

#### Configuração de desenvolvimento

- **`DEV_CONFIG`** em `constants.ts`: flag `godMode` — quando `true`, player não recebe dano de inimigos; permite testes de exploração sem preocupação com HP

### Fixed

- Sprite de poção não desaparecia do mapa ao ser coletada: `delayedCall(0, s.destroy)` substituído por `item.sprite?.destroy()` imediato, eliminando race condition entre agendamento e cleanup de andar
- Loop de recriação de sprites (`_loadDungeonFloor`) agora destrói sprite anterior antes de criar novo, evitando leak se sprite ainda estiver ativo
- `ReferenceError: W is not defined` ao entrar na dungeon: `width: W, height: H` removidos inadvertidamente do destructuring durante refatoração; restaurados

### Changed

- `GameScene._loadDungeonFloor()`: loop inline de tiles substituído por `DungeonRenderer.buildCommands()` — zero lógica visual na cena
- `dungeon-themes.ts`: removidas funções `pickFloorFrame` e `pickWallFrame` (encapsuladas no `AutoTileResolver`)

### Changed

- Removidos arquivos de resumo/documentação obsoletos da raiz do repositório: `KIRO_RESUMO.md`, `IMPLEMENTATION_SUMMARY.md`, `fase_3.md`, `fase_5.md` — conteúdo migrado para `.kiro/` e `docs/`

## [0.5.1] — 2026-05-10

### Added

#### Área Bônus — expansão e sistema de debug

- **`BonusAreaData.ts`**: config isolada da área bônus (`BONUS_W=30`, `BONUS_H=22`) — `BONUS_AREA_OVERRIDES` separado de `MANUAL_MAP_OVERRIDES` da cidade; nunca misturar os dois
- **`BonusAreaRenderer`**: renderer com debug idêntico ao `TownTMXRenderer` — labels `x,y` sobre cada tile, toggle `[ coords: ON/OFF ]`, clique exibe `[DEBUG bonus] (x,y)`, coordenadas world e override atual
- Suporte a `forceGid`, `walkable` e `interaction` em `BONUS_AREA_OVERRIDES` — mesma ergonomia da cidade
- NPCs e objetos interativos estáticos (placas) definidos em `BONUS_AREA_NPCS` e via `interaction` nos overrides

### Fixed

- Área bônus não permitia movimento: condição de saída estava hardcoded em `gridY >= 9` (altura antiga 10); corrigido para `gridY >= BONUS_H - 1`
- `GameScene._loadBonusArea()` reescrito para delegar ao `BonusAreaRenderer`, eliminando lógica duplicada de renderização

### Added

#### Documentação interna (.kiro)

- `world.spec.md` atualizado: pipeline data-driven via `TownTMXRenderer + MANUAL_MAP_OVERRIDES`, NPCs com posições TMX e `interactRange`, transição cidade→dungeon via `_dungeonEntryTiles`
- `product.md` atualizado: placa interativa, `entrarDungeon` data-driven, `interactRange` por NPC, debug de tiles
- `game-steering.md`: 5 novas restrições arquiteturais — `interactRange`, objetos estáticos interativos, entradas data-driven, `TMX_REMOVED_POSITIONS` e `getAllNPCs()`

#### Melhorias no cenário da cidade

- **`entrarDungeon` data-driven**: campo `entrarDungeon?: boolean` em `TileOverride` permite marcar qualquer tile do mapa como entrada para a dungeon via `MANUAL_MAP_OVERRIDES` — elimina o array estático `TOWN_DUNGEON_EXITS`
- **Placa interativa** em TMX(12,12): ao pressionar `[T]`, exibe mensagem "Bem vindas à cidade. Taxa de sobrevivência: surpreendentemente baixa" — implementado via campo `interaction` em `TileOverride` sem alterar o visual do sprite
- **Interação com Estalajadeiro** ampliada para `interactRange: 2`: permite ativar o menu de descanso estando 2 tiles de distância (game(21,10))
- **Debug de tiles aprimorado**: log ao clicar agora exibe coordenadas game(`gX, gY`) além de TMX — facilita localizar sobreposições em `MANUAL_MAP_OVERRIDES`
- `TMX_PAD_X/Y` importados em `GameScene` para conversão TMX→game sem duplicar constantes

### Fixed

#### Correções de NPCs e transições da cidade

- Removidos NPCs residuais em TMX(16,5), TMX(13,13) e TMX(18,14) via `TMX_REMOVED_POSITIONS` — sprites sem interação que apareciam no mapa
- `TMX_REMOVED_POSITIONS` verificado antes de qualquer renderização de sprite (incluindo GIDs fora do intervalo NPC), eliminando sprites fantasma como o player-frame em TMX(13,13)
- `NPCController.getAllNPCs()` agora retorna posição atual (`gridX/gridY`) dos NPCs em vez da posição de spawn — corrige interação `[T]` que falhava após NPCs se moverem
- Fórmula de clique no debug corrigida: substituído cálculo manual por `cam.getWorldPoint(pointer.x, pointer.y)` — coordenadas TMX exibidas agora coincidem com os labels visuais
- `TOWN.BONUS_ENTRY_Y` corrigido de `10` para `0`: entrada da área bônus em game(12,0) = TMX(7,-5); valor anterior transportava o jogador para uma posição errada

### Added

#### Ferramental de debug de tiles (mapa da cidade)

- **Console.log ao clicar num tile** em `TownTMXRenderer.ts`: exibe coordenadas TMX e world, `forceGid` das layers Tiles e Sprites, e override atual — pronto para copiar em `MANUAL_MAP_OVERRIDES`
- **Botão toggle "[ coords: ON/OFF ]"** adicionado à `UIScene`: esconde/mostra os labels de coordenada nos tiles dinamicamente sem afetar o console.log; fica sempre visível acima de todos os painéis
- **Suporte a `overlayGid` no loop de padding**: overrides com `overlayGid` agora funcionam em coordenadas fora dos limites TMX (ex: `"-1,8"`)
- **Spritesheet `Decor0.png` carregado** no `BootScene`: GIDs 2136–2311 (mobília, tapetes, decorações) agora renderizam corretamente via `forceGid` e `overlayGid`

### Fixed

- Cálculo incorreto de coordenadas ao clicar no mapa: substituído cálculo manual `pointer.x / cam.zoom + cam.scrollX` por `pointer.worldX` / `pointer.worldY`, eliminando offset errado quando a câmera não estava na origem

#### Renderização de padding completo (30×25)

- **Loop de grama expandido** em `TownTMXRenderer.ts`: as 450 células de padding agora consultam `MANUAL_MAP_OVERRIDES` (suportando chaves com coordenadas negativas como `"-5,-3"`) e exibem `DEBUG_SHOW_COORDINATES` — todas as 750 células do mapa ficam visíveis no modo debug
- Células de padding com `forceGid` no override renderizam o tile customizado; sem override continuam com grama padrão (frames 16/17/18)
- `walkable: false` em overrides de padding marca a célula como sólida no `collisionGrid`; padrão é sempre passável

#### Sistema de Override de Tiles (mapa da cidade)

- **`TILE_GID`** em `TileProperties.ts`: ~70 aliases de TMX GID organizados por tileset (Wall, Floor, Pit0, Door0, Decor0, Ground0, Tree0) — permite referenciar tiles por nome em vez de número
- **`MANUAL_MAP_OVERRIDES`**: objeto de configuração por coordenada `"tmxX,tmxY"` com suporte a `forceGid`, `forceGidLike`, `overlayGid` e `walkable` — corrige tiles problemáticos do TMX sem alterar o renderer
- **`DEBUG_SHOW_COORDINATES`** em `TownTMXRenderer.ts`: flag que exibe textos de coordenada sobre cada tile e adiciona label interativo — ao clicar com o mouse mostra `tile: X,Y` no canto da tela
- Overrides aplicados antes de `getTileProp()` em ambos os layers (Tiles e Sprites), garantindo prioridade total sobre o TMX original; suporte a tiles vazios (GID 0) sendo preenchidos via override

### Fixed

- Quadrados pretos no lugar de árvores: frames 0–47 do Tree0.png são pretos/vazios — renderer agora os ignora; `isTreeTop` e aliases `TILE_GID.TREE*` atualizados para frames 48+ (primeira linha visível)
- GIDs incorretos em `TILE_GID` (GRASS/STONE/DIRT apontavam para frame index em vez de TMX GID): corrigidos com `firstgid=2312` para Ground0.png

#### Sistema de Comércio e Equipamentos

- **`ShopSystem`**: lógica de compra e venda catalog-driven; `buyItem()` e `sellItem()` retornam resultado tipado; `buildViewModel()` e `buildSellItems()` constroem ViewModel sem acoplamento à UI
- **`EquipmentSystem`**: 6 slots (capacete, escudo, espada, calça, botas, amuleto); `equip()`, `unequip()`, `getEquippedId()`, `getAllEquipped()` — armazena IDs, `InventorySystem` permanece dono dos objetos
- **`Player.applyEquipmentBonuses()` / `removeEquipmentBonuses()`**: bônus de equipamento acumulados em `_equipmentBonuses`; `recalcStats()` recalcula `maxHp` e `attack` a partir dos bônus — 100% reversível ao desequipar
- **`shop.catalog.ts`**: 18 itens (3 por slot + poções); `createItemFromCatalogEntry()` instancia `Item` com `slotId`, `bonuses`, `price`, `rarity`; `buildBonusText()` formata texto de atributo
- **`ShopPanel`**: painel de 2 abas (Comprar / Vender); mouse hover + click selecionam item; pool de 20 linhas reutilizáveis; detalhes de raridade, bônus e preço
- **Loja do Mercador**: interagir com o Mercador na cidade abre `ShopPanel`; aba Comprar navega catálogo (`↑↓`), compra com `E`/`Enter`; aba Vender mostra inventário (`←→` troca aba), venda com `V`
- **Gold no HUD**: `player.gold = 500` inicial; label `Ouro: N` atualizado em tempo real via `PLAYER_GOLD_CHANGED`

#### Sistema de Diálogo (`DialogPanel`)

- **`DialogPanel`**: painel genérico de menu com lista de opções à esquerda e área de conteúdo à direita; mouse `pointerdown` seleciona opção; hint `[↑↓] Navegar  [Enter/E] Selecionar  [ESC] Fechar`
- **Guarda** (cidade): interação abre menu com 4 opções informativas (Objetivos, Como jogar, Controles, Dicas)
- **Taberneiro** (renomeado de Estalajadeiro): interação abre menu; opção "Repousar (20 ouros)" deduz 20 moedas e restaura HP e Mana ao máximo; opção "Até mais" fecha

#### NPCs — Gato Vagante

- `NPCController.update()` reativado: FSM `idle → wander` percorre tiles FLOOR dentro de `wanderBounds`; paredes e edifícios respeitados automaticamente
- Gato movido para posição (3, 9) (tile FLOOR) com `customWanderBounds` dedicado — elimina posicionamento anterior em tile de parede

#### Correções de Log e Foco

- **`LogPanel`** reescrito para renderização bottom-up: `text.height` real após `setText()` determina posição — mensagens com quebra de linha não se sobrepõem mais
- **Foco de teclado**: `BLUR`/`FOCUS` do jogo chamam `keyboard.resetKeys()` — previne teclas "presas" ao voltar da aba/janela após alt+tab

### Fixed

#### Crash `vm.items is undefined` após compra

- `ShopSystem.buyItem()` e `sellItem()` emitiam `EVENTS.SHOP_UPDATED` com `{}` vazio; `ShopPanel.render()` acessava `vm.items[i]` → crash
- Removidos os emits vazios; `GameScene._emitShopState()` sempre constrói `ShopViewModel` completo após qualquer operação

#### Inventário fantasma / input travado após compra

- `UIScene`: handler `INVENTORY_STATE_RESPONSE` chamava `_inventoryPanel.show()` incondicionalmente — inventário abria em modo SHOP quando `_emitInventoryState()` era chamado durante compra
- **Fix**: `INVENTORY_OPENED` é o único evento autorizado a chamar `show()`; `INVENTORY_STATE_RESPONSE` só atualiza dados e marca dirty se o painel já estiver visível
- Removidas chamadas `_emitInventoryState()` das operações de compra/venda na loja
- `set('GAMEPLAY')` trocado por `pop()` no fechamento de INVENTORY e SHOP — stack do `InputModeManager` limpa corretamente

#### Desequipar itens

- Pressionar `E` em item já equipado agora o desequipa; novo método `_unequipSelectedItem()` reverte bônus via `player.removeEquipmentBonuses()` e emite `PLAYER_HP_CHANGED`
- Painel de detalhes do inventário exibe `[E] Desequipar` para itens equipados, `[E] Equipar` para os demais

---

#### Múltiplos Andares de Dungeon (`DungeonFloorManager`)
- `DungeonFloorManager`: cache de andares por sessão — andares já visitados preservam inimigos mortos e itens coletados
- `DungeonFeatureGenerator`: gera `stairUp` e `stairDown` em salas diferentes, com distância mínima de 5 tiles entre elas
- `DifficultyScalingSystem`: scaling de inimigos data-driven via `FLOOR_DIFFICULTY_TABLE` — HP e ATK aumentam por andar, base stats nunca mutados

#### IA Adaptativa — Fase 5

- `PlayerMetrics`: coleta métricas em tempo real (dano causado/recebido, kills, turnos sobrevividos, itens usados, mortes); score normalizado -100 a +100 com janela deslizante de 20 turnos
- `DifficultyManager`: dificuldade adaptativa com 3 níveis (EASY/NORMAL/HARD); histerese de 3 ciclos evita oscilação; recalcula a cada 10 turnos; combina tabela estática por andar com modificadores adaptativos
- `EnemySystem`: novo atributo `aggressionLevel` (0–1); HARD → raio de detecção +50%, sempre persegue; EASY → chance de idle mesmo detectando o player
- `TurnManager`: registra métricas de combate via `PlayerMetrics` (dano, kills, mortes, itens usados)
- `GameScene`: usa `DifficultyManager.getAdaptiveDifficulty()` no spawn; emite hints narrativos sutis ao mudar de dificuldade

### Changed (docs)
- `docs/prompts/Paolo.md`: descrição do prompt da fase 5 ajustada
- Descida: player nasce no `stairUp` do andar destino; subida: player nasce no `stairDown` do andar de origem
- Retorno à cidade via `stairUp` com `targetFloor = 'town'` — sem heurística de `startPos`
- Labels visuais nas escadas: `▲ CIDADE` (floor 1), `▲ SUBIR` (demais floors), `▼ DESCER`

#### Tela de Inventário Visual (`InventoryPanel` + `EquipmentSystem`)
- `InventoryPanel`: grid de itens com 6 slots de equipamento (capacete, escudo, espada, calça, botas, amuleto)
- `EquipmentSystem`: armazena IDs de itens equipados — `InventorySystem` permanece o dono dos objetos
- Tecla `I` abre/fecha o painel de inventário; `InputModeManager` bloqueia movimento enquanto aberto
- Comunicação UIScene ↔ GameScene via protocolo EventBus request/response (`INVENTORY_STATE_REQUESTED → INVENTORY_STATE_RESPONSE`)

#### Log Panel dedicado (`LogPanel` + `LogSystem`)
- `LogSystem`: buffer de até 50 mensagens, desacoplado do painel — comunica via `LogViewModel`
- `LogPanel`: Container Phaser próprio ocupando 1/3 esquerdo da tela, pool fixo de textos com dirty flag
- `LogPanel.layout()` aceita `reservedBottomHeight` — log não cobre a action bar

#### Action Bar separada (`ActionBarPanel`)
- `ActionBarPanel`: componente independente com Container próprio, 36px de altura, fundo visualmente distinto do log
- Delegação de `setItem()` / `clearItem()` a partir de eventos `ITEM_PICKED_UP` e `ITEM_USED`

#### Sistemas de suporte
- `MapTransitionSystem`: SpawnPoints e TransitionPoints registráveis — GameScene executa, sistema resolve lógica
- `InputModeManager`: máquina de estados (GAMEPLAY | INVENTORY | MODAL | DEBUG) com push/pop de modo

### Fixed
- Spawn de retorno à cidade: player nasce próximo à saída da dungeon (`EXIT_Y - 1`), não no centro
- `createEnemies` refatorada para `(dungeon, playerPos, difficulty?)` — scaling aplicado no spawn, constantes base preservadas
- `tests/enemy.test.js` atualizado para nova assinatura de `createEnemies`

---

#### Feedback Visual de Dano (`visual-damage-feedback`)
- Números flutuantes animados ao receber dano: vermelho (`-N`) sobre o player, amarelo sobre inimigos
- Flash vermelho no sprite atingido (pisca uma vez em ~160ms) para reforçar o impacto do golpe
- Dois novos eventos no `EventBus`: `DAMAGE_PLAYER` e `DAMAGE_ENEMY` — emitidos pelo `CombatSystem` com posição em pixels e valor do dano
- `CombatSystem.resolve()` agora aceita `getPixelPos()` opcional nos objetos passados — sem quebrar testes existentes
- `GameScene._flashSprite()`: método reutilizável de tween alpha + tint para qualquer sprite

### Fixed
- Script `test` no `package.json` ajustado para usar caminho direto ao `vitest.mjs` — corrige falha de resolução do executável no Windows com Node.js v21

### Added

#### Sistema de Mundo Persistente (`WorldSystem`)
- `src/systems/WorldSystem.ts`: singleton que persiste o estado da dungeon (grid, itens no chão) entre transições de área dentro da sessão
- `TownMap`: mapa fixo 24×20 implementado como subclasse de `DungeonGenerator` — compatível com `TurnManager` e `EnemySystem` sem alterações
- Player inicia na cidade (hub seguro, sem inimigos); pisa em `(12,18)` para entrar na dungeon
- Retorno à cidade: ao voltar ao `startPos` da dungeon, estado é salvo automaticamente
- Inimigos sempre respawnam ao entrar na dungeon; itens no chão persistem entre visitas
- Flag `_canExitDungeon`: previne saída imediata ao spawnar no startPos da dungeon

#### Sistema de Loot (`LootSystem`)
- `src/systems/LootSystem.ts`: drops ao matar inimigos — 30% poção de cura, 20% veneno, 10% ouro, 40% nada
- Tipo `gold` adicionado ao `ItemType`, com visual em `Items/Money.png` frame 0
- Loot emitido via `EVENTS.ITEM_DROPPED` — cena cria sprite sem conhecer a lógica de probabilidade

#### Sprites Dawnlike para Itens
- Itens no mapa e na action bar usam sprites reais (`Items/Potion.png`, `Items/Money.png`) em vez de retângulos coloridos
- Frames mapeados: poção vermelha = frame 0, poção azul = frame 7, ouro = frame 0

### Fixed
- Action bar da UIScene: ícones exibiam retângulo colorido em vez do sprite correto após migração para `Sprite`

### Docs
- Novos specs: `.kiro/specs/world.spec.md`, `.kiro/specs/loot.spec.md`, `.kiro/specs/sprites.spec.md`
- Atualizados: `gameloop.spec.md`, `input.spec.md`, `game-steering.md`

---

## [0.3.0] — 2026-05-05

### Added

#### Sistema de Inventário (`InventorySystem`)
- `src/systems/InventorySystem.ts`: 20 slots, métodos `addItem`, `removeItem`, `useItem`, `isFull`, `getInventoryLog`
- `src/entities/Item.ts`: entidade pura com `id`, `type`, `identified`, `gridX/Y`, `getDisplayName()`

#### Sistema de Identificação Roguelike
- Itens aparecem com nomes genéricos ("Poção Vermelha", "Poção Azul") até serem usados
- Após uso, o nome real ("Poção de Cura", "Poção de Veneno") é revelado para todos os itens do tipo nesta partida
- Identificação persistida em `player.identifiedItems: Record<string, boolean>` — resetado ao reiniciar

#### Itens e Efeitos
- `potion_heal`: cura +10 HP (limitado ao `maxHp`)
- `potion_poison`: causa −5 HP (não reduz abaixo de 0)
- Spawn de 3–6 itens em tiles FLOOR aleatórios, sem sobreposição com player

#### Integração com o Jogo
- Coleta automática ao pisar sobre o tile do item
- Ação `USE_ITEM` integrada ao `TurnManager` — usar item consome turno
- Tecla `I`: lista inventário no log da UI
- Teclas `1–9`: usam o item do slot correspondente

#### Action Bar (UIScene)
- 9 slots visuais centralizados na barra inferior da tela
- Slot acende com ícone colorido ao coletar (amarelo = cura, roxo = veneno)
- Slot apaga ao usar o item
- `EventBus` tornando genérico (`on<T>` / `off<T>`) — handlers tipados sem cast

#### Fullscreen Responsivo
- `#game-container` com `width: 100vw; height: 100vh` — canvas ocupa toda a tela
- `main.ts`: `width`/`height`/`parent` consolidados dentro do objeto `scale` (configuração canônica do Phaser)

### Fixed
- `GameScene._checkItemPickup()`: sprite destruído no próximo frame via `delayedCall(0)` — corrige `Uncaught TypeError: can't access property "drawImage", this.data is null` ao coletar poção

### Changed
- Evento `ITEM_PICKED_UP` agora inclui `slotIndex` para a UIScene saber qual slot acender
- `EventBus.on/off` agora são genéricos — elimina erros de tipo nos handlers da UIScene

---

## [0.2.0] — 2026-05-04

### Added

#### Sistema de Turnos Real (`TurnManager`)
- Novo `src/systems/TurnManager.ts`: centraliza o controle de turno — o jogo só avança quando o jogador age
- Tipo `Action` explícito: `MOVE | ATTACK | WAIT` — cada tecla pressiona gera exatamente uma ação
- Input migrado de `isDown` (contínuo) para `JustDown` (um keypress = um turno) — elimina o cooldown de 150ms
- Tecla `SPACE` registrada para ação `WAIT` (passa o turno sem mover)
- Inimigos só agem após a ação do jogador ser processada — sem paralelismo de turno

#### Entidade Enemy pura (`src/entities/Enemy.ts`)
- Nova classe `Enemy` sem dependência de Phaser: apenas dados (`gridX`, `gridY`, `hp`, `attack`, `alive`) e lógica de domínio
- Método `takeDamage(amount)` com guarda de `alive`
- Método `getPixelPos()` para conversão de grid para pixels
- Separação clara entre entidade de domínio (`Enemy.ts`) e lógica de IA + sprite (`EnemySystem.ts`)

#### Combate com Chance de Acerto
- `CombatSystem.attack(attacker, defender)`: novo método com **80% de chance de acerto** por ataque
- Miss resulta em mensagem `"Você errou o ataque"` / `"Inimigo errou"` no log
- Método `resolve()` anterior mantido para não quebrar testes existentes

#### Feedback de Combate no Log
- Mensagens detalhadas por evento: dano causado, miss, morte de inimigo, morte do player
- Todas as mensagens emitidas via `EventBus` (`EVENTS.UI_LOG`) para o log da UIScene

### Changed

- `GameScene._handleInput()`: removidos `_tickEnemies()` e `_resolveCombat()` — lógica migrada para `TurnManager`
- `GameScene._setupInput()`: SPACE registrado como tecla de WAIT
- Spec de Fog of War (`.kiro/specs/fog-of-war.spec.md`): 3 estados de visibilidade (`HIDDEN`, `VISIBLE`, `REVEALED`), raio Chebyshev, revelação de sala inteira, 10 cenários testáveis
- Variantes de chão aleatórias por sessão: 14 frames do `Ground0.png` sorteados por partida
- Reorganização de documentação: specs movidas de `.kiro/steering/` para `.kiro/specs/`

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

[Unreleased]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.5.4...HEAD
[0.5.4]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.3.0...v0.5.1
[0.3.0]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/IA-para-DEVs-SCTEC-T2/projeto_final/releases/tag/v0.1.0
