# Product — Dungeon of Echoes

## Visão do Produto

Dungeon of Echoes é um RPG roguelike tile-based jogado inteiramente no navegador. Inspirado no clássico Castle of the Winds (1989–1993), o jogo combina exploração de masmorras geradas proceduralmente com combate turn-based e progressão de personagem. O MVP entrega uma experiência jogável e coesa, priorizando mecânicas sólidas antes de qualquer complexidade adicional.

O projeto é de contexto acadêmico e serve como demonstração de arquitetura modular em JavaScript com Phaser 4, com estrutura preparada para integração futura de IA generativa.

## Público-Alvo

- Jogadores familiarizados com RPGs clássicos e roguelikes (nethack, Castle of the Winds, Angband)
- Desenvolvedores e avaliadores acadêmicos interessados em arquitetura de jogos com JS/Phaser
- Entusiastas de jogos browser-based sem necessidade de instalação

## Core Gameplay

O loop central é turn-based e tile-based:

1. O jogador explora um mapa de dungeon gerado proceduralmente (grid 40×40, BSP)
2. Cada ação (mover, atacar, usar item, usar magia, esperar) consome um turno
3. Após a ação do jogador, todos os inimigos vivos executam seu turno
4. O jogador ganha XP ao derrotar inimigos e avança de nível automaticamente
5. Ao encontrar a escada, desce para um andar mais difícil (tema visual muda por faixa de andares)
6. Morte é permanente (permadeath) — cada sessão começa do zero

**Ciclo de turno:**
```
Input do jogador → Resolve ação (mover/atacar/item/magia/esperar) → Turno dos inimigos → Verifica condições → Atualiza HUD
```
*(Fog of War não implementado — spec pronta em `.kiro/specs/fog-of-war.spec.md`)*

## Principais Funcionalidades (MVP)

### Sistemas Implementados
| Sistema | Responsabilidade |
|---------|-----------------|
| PlayerSystem | Atributos, HP/Mana, gold, bônus de equipamento acumulados em `_equipmentBonuses`; `recalcStats()` como fonte de verdade |
| DungeonGenerator | Geração procedural BSP (40×40), corredores L-shaped |
| DungeonFloorManager | Cache de estado por andar; inimigos respawnam, itens persistem; `ascend()`/`descend()` |
| DifficultyScalingSystem | Multiplicadores de HP/ATK por andar; 4 temas (Dungeon/Mine/Underworld/Boss) |
| DifficultyManager | Agression score (0–1) por inimigo via `PlayerMetrics`; sliding window de 20 turnos; histeresis |
| PlayerMetrics | Rastreia turnos, dano, kills para alimentar `DifficultyManager` |
| SemanticClassifier | Classifica grid → `SemanticGrid` (FLOOR/WALL_EDGE/VOID); apenas 4 vizinhos cardinais |
| TileSemanticsProvider | Fonte de verdade para `isVisuallyOpen` e `isSolid`; extensível para novos tiles |
| WallVariantLUT | 256 entradas de bitmask → frame; sanitização de padrões inválidos |
| AutoTileResolver | Interpreta vizinhos cardinais → `TileRenderData`; puro, sem Phaser |
| DungeonRenderer | Itera grid + tema → `RenderCommand[]`; sem conhecer a Scene |
| BonusAreaRenderer | Renderiza área bônus (30×22) com debug e overrides isolados de `BONUS_AREA_OVERRIDES` |
| DebugOverlayRenderer | Modos de debug visual: semântico/variante/bitmask; toggle por tecla |
| EnemySystem | Spawn, estados de IA (IDLE/CHASING/ATTACKING), detecção por raio e por sala |
| CombatSystem | Resolução de ataque (80% hit chance), dano, morte |
| XPSystem | Ganho de XP, multi-level-up, fórmula `100 × N × (N+1) / 2` |
| SpellSystem | Desbloqueio por nível, 2 slots equipados (J/K), cooldown por slot |
| SpellCastingSystem | Valida mana/cooldown, aplica dano em todos os 4 cardinais adjacentes, retorna `SpellCastResult` |
| InventorySystem | 20 slots, roguelike identification, `useItem()`, `addItem()`, `removeItem()` |
| EquipmentSystem | 6 slots (helmet/shield/sword/pants/boots/amulet); equip/unequip com eventos; bônus reversíveis |
| ShopSystem | Compra/venda catalog-driven; `buildViewModel()` + `buildSellItems()` para UI; sem lógica de cena |
| InputModeManager | Stack-based: GAMEPLAY / INVENTORY / SHOP / DIALOG / MODAL / DEBUG — `push()` / `pop()` / `is()` |
| LogSystem | Buffer de 50 mensagens, dirty flag, eventos de combate/itens/sistema |
| EventMemory | Histórico de eventos tipados; summaries para uso narrativo |
| CityLayoutProcessor | Pipeline TOWN_CONFIG → ProcessedTownLayout; atribui biomas e resolve tile visuals |
| TileVariantResolver | Seleção determinística de frame por posição + bioma (hash xorshift + peso) |
| NPCController | FSM Idle → Wander para NPCs da cidade; `customWanderBounds` por NPC |
| InteractiveObjectSystem | Detecta proximidade player↔NPC; respeita `houseBounds`; dispara SHOP_OPENED ou DIALOG_OPENED |
| CityDecorationSystem | Renderização de objetos do mundo com Y-sort automático |
| LootSystem | Drop probability data-driven (40% nada, 30% heal, 20% poison, 10% gold) |
| WorldSystem | Cache singleton: estado de dungeon e itens persistem dentro da sessão |
| MapTransitionSystem | Orquestra transições town ↔ dungeon ↔ bonus |

### Funcionalidades do Jogador
- 6 atributos: STR, INT, DEX, CON, WIS, CHA
- HP (`CON × 5 + Level × 3`) e Mana (`WIS × 4 + INT × 2`) derivados dos atributos; stats recalculados ao equipar/desequipar
- Movimento por teclado (setas ou WASD) no grid; cooldown 150ms por tile
- Gold (começa com 500) exibido no HUD; atualizado em tempo real
- 2 slots de magia (J/K) com cooldown independente

### Comércio e Equipamentos
- **Loja do Mercador**: 2 abas (Comprar / Vender); navegação por teclado e mouse
- **Catálogo**: 18 itens (espadas, capacetes, escudos, calças, botas, amuletos + poções)
- **Bônus de stat**: itens equipáveis adicionam `attack`, `maxHp`, `con` etc. de forma reversível
- **Inventário visual** (`I`): 3 colunas (slots de equipamento / lista de itens / detalhes); `E` equipa ou desequipa, `U` usa, `D` dropa

### NPCs e Diálogos
- **Mercador**: abre loja ao interagir (`interactRange: 2`)
- **Guarda**: diálogo de patrulha; vaga pela área central da cidade (`wanderBounds`)
- **Estalajadeiro**: menu de descanso — 20 ouro restauram HP e Mana ao máximo (`interactRange: 2`)
- **Gato**: vaga livremente pela cidade respeitando paredes
- **Placa**: objeto estático interativo via `TileOverride.interaction` — mensagem ao pressionar `[T]`

### Dungeon
- Geração por BSP (Binary Space Partitioning) com corredores L-shaped
- Múltiplos andares com cache de estado por andar: inimigos reiniciam, itens persistem
- Escadas bidirecionais: descida (andar N+1), subida (andar N-1), retorno à cidade pelo andar 1
- **Autotiling semântico**: `AutoTileResolver` interpreta vizinhos cardinais e escolhe frame — face, cantos externos, cantos côncavos, corpo sólido
- **Temas visuais por andar**: andares 1–2 Dungeon (pedra cinza), 3–4 Mine (terra), 5–6 Underworld (pedra escura), 7+ Underworld Boss (mix abismo)
- `DungeonRenderer` emite `RenderCommand[]` — `GameScene` apenas cria sprites; arquitetura extensível para novas categorias (water, lava, chasm)
- FOG of War: spec pronta em `.kiro/specs/fog-of-war.spec.md` (não implementado)

### Área Bônus
- Mapa 30×22 tiles em game(12,0), acessível pela entrada norte da cidade
- `BonusAreaRenderer` com sistema de overrides próprio (`BONUS_AREA_OVERRIDES`) isolado da cidade
- Debug de tiles idêntico à cidade: labels `x,y`, toggle ON/OFF, clique exibe coordenadas e override atual

### Cidade (Town)

- Layout 30×25 baseado em `Town.tmx` renderizado por `TownTMXRenderer`
- Overrides de tile por coordenada TMX via `MANUAL_MAP_OVERRIDES` (`forceGid`, `walkable`, `entrarDungeon`, `interaction`)
- Entradas da dungeon data-driven: `entrarDungeon: true` em `MANUAL_MAP_OVERRIDES` — sem array estático
- Sprites removidos via `TMX_REMOVED_POSITIONS` (verificado antes de qualquer renderização)
- NPCs com comportamento de wander configurável (`wanderBounds`); `interactRange` por NPC
- Objetos interativos estáticos (placas) via `TileOverride.interaction` — sem NPC dedicado
- Objetos do mundo (árvores, barris) com Y-sort automático para profundidade correta
- Debug de tiles: clique exibe coordenadas TMX + game e GIDs das layers; toggle de labels na `UIScene`

### Inimigos
- Estados de IA: IDLE → CHASING → ATTACKING
- Raio de detecção configurável (padrão 8 tiles ou mesma sala BSP)
- Agression score (0–1) pelo `DifficultyManager`: alto → raio 1.5×, perseguição garantida
- Variantes elite geradas por IA generativa (nome, habilidade especial, descrição narrativa)
- Recompensa de XP ao morrer

### Progressão
- XP necessário: `100 × N × (N + 1) / 2`
- Level up: +3 pontos de atributo para distribuir
- HP e Mana recalculados automaticamente

### Magias (v0.5.4)

- 5 magias data-driven (`spells.db.ts`): Fire Bolt, Ice Shard, Wind Cyclone, Fire Explosion, Blizzard
- Desbloqueio automático por nível (`spell-progression.ts`): nível 1, 5, 10, 15, 20
- Melee-range AoE: atinge todos os inimigos nos 4 tiles cardinais adjacentes
- Mana e cooldown por slot, verificados antes do cast
- UI: `SpellsPanel` na aba `I`, slots J/K no action bar com barra de cooldown

### IA Narrativa (v0.5.2+)

- `AIService.ts` + `NarrativeService.ts`: chamadas assíncronas não-bloqueantes ao LLM
- Triggers: itens raros (raridade ≥ 80%), inimigos elite, locais especiais
- Cache por sessão — sem chamadas duplicadas
- Fallback gracioso quando API indisponível

### Dificuldade Adaptativa

- `PlayerMetrics`: sliding window de 20 turnos (dano recebido, kills, mortes)
- `DifficultyManager`: calcula aggression score (0–1) com histeresis para evitar oscilação
- `DifficultyScalingSystem`: multiplicadores fixos por andar (1.0× → 2.0× HP/ATK)

## Funcionalidades Fora do Escopo Atual (Planejadas)

Estas features **não estão implementadas** mas têm specs ou estrutura preparada:

- **Fog of War**: spec pronta em `.kiro/specs/fog-of-war.spec.md` (HIDDEN/VISIBLE/REVEALED)
- **Minimap**: spec pronta em `.kiro/specs/minimap.spec.md`
- **Árvore de habilidades por classe**
- **Sistema de save / placar local**

## Diferenciais

- **100% client-side**: sem backend, sem instalação, roda em qualquer navegador moderno
- **Arquitetura modular**: cada sistema é independente e testável isoladamente
- **Spec-driven**: nenhuma feature existe sem especificação correspondente em `.kiro/specs/`
- **Preparado para IA**: hooks e estrutura de pastas prontos para integração com LLM (Claude Haiku)
- **Permadeath real**: sem save entre sessões, cada partida é única
- **Fidelidade ao clássico**: mecânicas fiéis ao Castle of the Winds com modernização visual via Phaser 4
