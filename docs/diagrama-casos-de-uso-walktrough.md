# Dungeon of Echoes — Casos de Uso e Walkthrough Técnico

> Documento gerado a partir da leitura direta do código-fonte em `src/`. Nenhuma informação foi inferida ou inventada.
> Versão do projeto: 0.6.0 | Engine: Phaser 4.0.0 | Linguagem: TypeScript 6.0.3

---

## 1. Visão Geral do Jogo

**Gênero:** RPG 2D tile-based com geração procedural de dungeons (roguelite).

**Gameplay Loop:**
1. Escolher classe na tela de seleção.
2. Iniciar na cidade (hub) com 500 moedas de ouro.
3. Entrar na dungeon pelo tile de entrada (pit0).
4. Explorar andares proceduralmente gerados, combater inimigos, coletar loot e usar baús.
5. Subir de nível, gastar pontos de atributo, equipar itens.
6. Descer andares (stairDown) para aumentar a dificuldade.
7. Morrer → tela de game over com narrativa gerada por IA → recomeçar.

**Objetivo do Jogador:** Sobreviver o máximo de andares possível. Não há condição de vitória explícita no código.

**Estrutura Geral:**
- A cidade é um mapa estático TMX renderizado por `TownTMXRenderer`.
- A dungeon é gerada proceduralmente por `DungeonGenerator` (BSP-like: rooms + corredores).
- O jogo corre em modo turn-based: a cada ação do player, todos os inimigos reagem.
- A dificuldade se adapta dinamicamente com base no desempenho do jogador (`DifficultyManager`).
- Há integração opcional com LLM (OpenAI GPT-3.5-turbo) para narrativa emergente.

**Resolução e Tecnologia:**
- Canvas 800×600px, pixel art, escala FIT centralizado.
- Spritesheet Dawnlike 16×16px por tile/frame.
- Física Arcade sem gravidade (movimento grid-based manual).
- Build: Vite. Testes: Vitest.

---

## 2. Fluxo Completo do Jogador (Walkthrough Técnico)

### Etapa 1 — Boot e Carregamento de Assets

**Arquivo:** `src/scenes/BootScene.ts`

1. Phaser inicia a `BootScene` (primeira da lista em `main.ts`).
2. `preload()` é chamado:
   - Carrega todos os spritesheets definidos em `FLOOR_ATLAS`, `OBJECT_ATLAS`, `NPC_ATLAS` (`sprites-config.ts`), deduplicando por `textureKey`.
   - Carrega assets fixos: `wall`, `player`, `player1`, `undead`, `potion`, `money`, `reptiles`.
   - Carrega spritesheets de inimigos: `pest0/1`, `misc0/1`, `reptile0/1`, `undead1`, `humanoid1`, `demon0/1`.
   - Carrega assets do TMX da cidade: `floor`, `pit0`, `door0`, `decor0`, `chest0`, `quad0`.
   - Carrega efeitos de magia: `effect0`, `effect1`.
   - Exibe barra de carregamento visual.
3. `create()` é chamado:
   - `_registerSpellAnims()`: registra animações de magia (fogo frames 0-3/4-7, gelo 20-23/24-27, vento 0-3/4-7 em effect1).
   - `_registerEnemyAnims()`: para cada `EnemyDef` em `enemies.config.ts`, cria animação ping-pong entre `{categoria}0.png` e `{categoria}1.png` no mesmo `frameIndex`.
   - Exibe texto "Dungeon of Echoes" por 200ms.
   - Se `DEV_CONFIG.devMode === true`: vai direto para `GameScene`. Caso contrário, vai para `MainMenuScene`.

**Dados alterados:** Nenhum estado de jogo. Apenas registro de texturas e animações no Phaser global.

### Etapa 2 — Menu Principal

**Arquivo:** `src/scenes/MainMenuScene.ts`

- Exibe opções de menu (não lido em detalhe, mas registrado no fluxo de cenas).
- Navega para `CharacterSelectScene` ao confirmar nova partida.
- Navega para `CreditsScene` ao selecionar créditos.

### Etapa 3 — Seleção de Classe

**Arquivo:** `src/scenes/CharacterSelectScene.ts`

1. Lista as 4 classes de `PLAYER_CLASSES` (`player-classes.config.ts`):
   - `Aventureiro (base)`, `Guerreiro`, `Arqueiro`, `Mago`.
2. Hover sobre botão: atualiza preview sprite (ping-pong entre `player` e `player1` no `frame` da classe) e exibe `description`.
3. Seleção via mouse (`pointerdown`) ou teclado (UP/DOWN + ENTER/SPACE).
4. Confirmar (`_confirm()`): chama `this.scene.start('GameScene', { playerClass: this._selected.id })`.
5. A classe selecionada é passada como `initData` para `GameScene`.

**Dados criados:** `{ playerClass: string }` passado como dado de cena.

### Etapa 4 — Inicialização da GameScene

**Arquivo:** `src/scenes/GameScene.ts`, método `create()`

Ordem de inicialização (todos os sistemas criados **uma única vez** por sessão):

1. `gameState = GAME_STATE.PLAYING`
2. `_dungeonCache.clear()`
3. Sistemas criados: `XPSystem`, `CombatSystem`, `TurnManager`, `LootSystem`, `InputModeManager`, `MapTransitionSystem`, `DungeonFloorManager`, `DifficultyScalingSystem`, `PlayerMetrics`, `DifficultyManager`, `DungeonFeatureGenerator`, `EquipmentSystem`, `ShopSystem`, `SpellSystem`, `SpellCastingSystem`, `EventMemory`, `NarrativeService`.
4. `_registerTransitions()`: registra spawnPoints e transitionPoints.
5. `player = new Player(this, TOWN.START_X, TOWN.START_Y)` — criado **uma única vez**.
6. Aplicar classe: lê `initData.playerClass`, busca em `PLAYER_CLASSES`, chama `player.applyClassBonus(classDef)`.
7. `_spellSystem.unlockSpellsForLevel(player, 1)` — desbloqueia magias de nível 1.
8. `_setupInput()`, `_registerEvents()`, `this.scene.launch('UIScene')`, `_emitInitialUIState()`, `_applyClassStartingItems()`.
9. Após 50ms: `player.applySkin(classDef.frame)` + emite `CLASS_INFO`.
10. `_loadArea('town')` — carrega a cidade.

### Etapa 5 — Cidade (Hub)

**Arquivo:** `src/scenes/GameScene.ts`, método `_loadTown()`

1. `TownTMXRenderer.render(scene)` constrói o mapa a partir dos dados TMX.
2. `TownMap` recebe o `collisionGrid`.
3. Escaneia `MANUAL_MAP_OVERRIDES` por tiles com `entrarDungeon: true`.
4. `NPCController.spawn()`: cria sprites dos NPCs com animações idle.
5. `InteractiveObjectSystem.load()`: registra objetos interativos.
6. Player é reposicionado. Câmera segue com zoom 2x.

**Na cidade, o jogador pode:**
- Mover-se com WASD/setas.
- Interagir com NPCs (tecla E) → abre diálogo.
- Entrar na loja → abre `ShopPanel`.
- Entrar na taverna → descansa (restaura HP, custa 20 moedas).
- Pisar no tile `pit0` → transição para a dungeon.

### Etapa 6 — Entrada na Dungeon

**Arquivo:** `src/scenes/GameScene.ts`, `_checkAreaTransition()` + `_loadDungeonFloor()`

1. Player pisa em tile com `entrarDungeon: true`.
2. `_cleanup()`: destrói todos os GameObjects da área atual.
3. `_loadDungeonFloor(1)`:
   - Verifica cache. Se novo: `DungeonGenerator.generate()`.
   - `_generateInitialItems()`: spawna 1–3 poções.
   - `featureGenerator.generate()`: gera stairUp, stairDown, baús.
   - `DungeonRenderer.buildCommands()`: constrói comandos de render.
   - `createEnemies()`: cria inimigos com stats escalados.
   - Player spawna ao lado do `stairUp`.

### Etapa 7 — Gameplay: Combate Turn-Based

**Loop de input:**
1. ESC: fecha overlay ativo.
2. I: toggle inventário.
3. J/K: lançar magia nos slots 0/1.
4. 1–9: usar item do slot correspondente (consome turno).
5. WASD/Setas: movimento.
6. SPACE: ação WAIT.

**Resolução do turno (`TurnManager.processPlayerAction()`):**
- **MOVE:** valida walkability, move player.
- **ATTACK:** 80% de chance de acerto, dano = `player.attack`.
- **USE_ITEM:** aplica hpDelta/manaDelta.
- **WAIT:** nenhuma ação.

**Turno dos inimigos:** cada inimigo vivo executa `enemy.update()`.

### Etapa 8 — Coleta de Loot

**Drop de inimigo (`LootSystem.roll()`):**
- Tabela por andar: nothing (40–50%), potion (6–8%), gold (42–56%).
- Elite: força drop.
- Aventureiro: `luckMultiplier = 1.4`, `extraDropChance = 0.15`.

**Coleta pelo player:**
- Ouro: vai direto para `player.gold`.
- Outros: `player.inventory.addItem(item)` (max 20 slots).

**Baús (`lootSystem.rollChestLoot()`):**
- Andares 1–2: 60% ouro, 40% poção.
- Andares 3–5: 50% ouro, 30% poção, 20% mímica.
- Andares 6+: 50% equipamento, 30% ouro, 20% poção.

### Etapa 9 — Progressão (Level Up e Atributos)

- XP necessário para nível N: `100 * N * (N+1) / 2`.
- Level up: `level++`, `attack += 5`, `freePoints += 3`, `recalcStats()`, HP e mana restaurados.
- `recalcStats()`:
  - `maxHp = CON * 5 + level * 3 + bonusEquipamento`
  - `maxMana = WIS * 5 + INT * 2`
  - `attack = 10 + (STR - 10) * 0.8 + bonusEquipamento`
  - `critChance = min((DEX - 10) * 0.015, 0.30)`
  - `cdReduction = min((WIS - 10) * 0.02, 0.40)`
  - `spellBonus = max((INT - 10) * 1.2, 0)`

### Etapa 10 — Inventário e Equipamentos

**Acessar (tecla I):** UIScene exibe `InventoryPanel`.
- Aba `Inventário`: lista slots.
- Aba `Status`: atributos, pontos livres.
- Aba `Magias`: lista magias, permite equipar nos slots J/K.

**Identificação de itens:**
- Consumíveis aparecem com nome genérico até serem usados.
- No primeiro uso: `identifiedItems[type] = true`.

### Etapa 11 — Magias

- Player tem 2 slots de magia (J e K).
- `SpellCastingSystem.cast()`: verifica cooldown, mana, encontra inimigos adjacentes, consome mana, aplica dano com bônus de INT.

### Etapa 12 — Troca de Andares

**Pisar em stairDown:**
1. `_cleanup()`.
2. `floorManager.descend()`.
3. `_loadDungeonFloor(nextFloor)`.

**Pisar em stairUp (andar 1):**
1. `mapTransitionSystem.requestTransition('dungeon-to-town')`.
2. `_loadTown()`.

### Etapa 13 — Game Over

1. `player.hp <= 0` → emite `PLAYER_DIED`.
2. `GameScene` → `scene.start('GameOverScene', { level, xp, events, métricas })`.
3. `GameOverScene` exibe painel de estatísticas: nível, XP, andares, inimigos, dano, turnos, itens usados.
4. `_generateDeathStory()`: chama `NarrativeService.generateDeathStory(events)` (async).
5. Botão "Jogar Novamente" → `scene.start('GameScene')`.

---

## 3. Casos de Uso Reais

### CU-01: Combate Melee

**Objetivo:** Atacar um inimigo adjacente com ataque físico.

**Classes envolvidas:** `GameScene`, `TurnManager`, `CombatSystem`, `Player`, `EnemySystem`, `XPSystem`, `LootSystem`

**Fluxo principal:**
1. Player pressiona tecla de movimento em direção a um inimigo vivo.
2. `TurnManager.processPlayerAction({ type: 'ATTACK', target: enemy })`.
3. `ClassRulesEngine.canMelee()` → true.
4. `combat.attack(player, enemy)` → 80% hit, dano = `player.attack`.
5. `enemy.hp -= damage`. Se `hp <= 0`: `alive = false`, `xpSystem.addXP()`.
6. Turno dos inimigos: cada inimigo vivo executa `enemy.update()`.

**Eventos disparados:** `COMBAT_HIT`, `DAMAGE_ENEMY`, `ENEMY_DIED`, `PLAYER_HP_CHANGED`, `UI_LOG`

**Regras de negócio:**
- Chance de acerto: 80% fixo.
- Guerreiro reduz dano recebido em 30%.
- Mago não pode atacar melee (`canMelee = false`).
- Arqueiro sem flechas → "Sem flechas!".

### CU-02: Combate Ranged (Arqueiro)

**Objetivo:** Atacar inimigo à distância com flecha.

**Fluxo principal (clique no sprite do inimigo):**
1. `enemy.sprite.on('pointerdown')` → `_tryRangedAttack(enemy)`.
2. Verifica `classDef.attackType === 'ranged'` e distância ≤ 4 tiles.
3. Cria `Projectile`. Projétil move-se em pixel-space.
4. `checkEnemyHit()` → se hit, aplica dano. Consome 1 flecha.

### CU-03: Loot de Inimigo

**Fluxo:**
1. Inimigo morre → `lootSystem.roll()`.
2. Se item gerado: emite `EVENTS.ITEM_DROPPED`.
3. `GameScene` cria sprite no tile.
4. Player move-se para o tile: coleta automática.

### CU-04: Level Up

**Fluxo:**
1. `xpSystem.addXP(player, amount)`.
2. Loop de level up: `level++`, `attack += 5`, `freePoints += 3`, `recalcStats()`.
3. `SpellSystem.unlockSpellsForLevel()` desbloqueia magias.
4. Emite `PLAYER_LEVELED_UP`, `PLAYER_XP_CHANGED`, `PLAYER_HP_CHANGED`.

### CU-05: Uso de Item

**Fluxo:**
1. Player pressiona 1–9 ou ENTER no item selecionado.
2. `TurnManager.processPlayerAction({ type: 'USE_ITEM', itemIndex })`.
3. `inventory.useItem()` aplica hpDelta ou manaDelta.
4. Na primeira vez: `identifiedItems[type] = true`.

### CU-06: Compra na Loja

**Fluxo:**
1. Player interage com NPC lojista → `EVENTS.SHOP_OPENED`.
2. `shopSystem.buyItem()`: verifica gold, inventário, cria item, debita gold.

**Venda:** `shopSystem.sellItem()`: 40% do preço base.

### CU-07: Equipar Item

**Fluxo:**
1. Selecionar equipamento + ENTER no painel.
2. `equipmentSystem.equip()` valida regras de classe.
3. `player.applyEquipmentBonuses()` → `recalcStats()`.

### CU-08: Troca de Andar (Descida)

**Fluxo:**
1. Player pisa em `stairDown`.
2. `_cleanup()`, `floorManager.descend()`, `_loadDungeonFloor(floor)`.
3. `difficultyManager.getAdaptiveDifficulty(floor)` → `createEnemies()`.

### CU-09: Narrativa IA

**Fluxo (ao descer de andar):**
1. `_eventMemory.getImportantEvents(8)`.
2. `_narrativeService.generateNarrative(events)` (async).
3. Resposta emitida via `EVENTS.NARRATIVE_GENERATED` e `EVENTS.UI_LOG`.

**Fluxo (game over):**
1. `GameOverScene._generateDeathStory()`.
2. `NarrativeService.generateDeathStory(events)`.
3. Resultado exibido em "— A sua história —".

---

## 4. Sistemas do Jogo

| Sistema | Responsabilidade |
|---------|-----------------|
| `XPSystem` | Calcular e aplicar ganho de XP, detectar level up |
| `LootSystem` | Decidir e gerar drops com tabelas escaladas por andar |
| `CombatSystem` | Resolver ataques físicos com cálculo de hit/miss |
| `TurnManager` | Orquestrar sequência player → inimigos |
| `EnemySystem` | IA turn-based, movimento com desvio de obstáculos |
| `EquipmentSystem` | Gerenciar 8 slots de equipamento |
| `SpellSystem` | Slots de magia, cooldowns, desbloqueio |
| `SpellCastingSystem` | Executar lançamento: mana, dano, alvos adjacentes |
| `ShopSystem` | Compra e venda catalog-driven |
| `DifficultyManager` | Ajuste adaptativo baseado na performance |
| `DungeonFloorManager` | Rastrear andar atual e conexões |
| `MapTransitionSystem` | Transições entre áreas com spawn points |
| `EventMemory` | Registrar eventos para alimentar IA narrativa |

---

## 5. Fluxos Técnicos Importantes

### Fluxo de Spawn de Inimigos

```
GameScene._loadDungeonFloor(floor)
  → difficultyManager.getAdaptiveDifficulty(floor)
  → createEnemies(dungeon, playerPos, difficulty)
      → Para cada inimigo: pickEnemyDef(floor) → new EnemySystem()
      → Aplica hpScale, atkScale, xpScale, aggressionLevel
  → GameScene._createEnemySprites()
```

### Fluxo de Dano ao Player

```
TurnManager.processPlayerAction()
  → enemy.update() retorna { attacked: true, damage }
  → combat.attack(enemy, player) → 80% hit
  → reduced = max(1, round(rawDmg * physicalDamageMultiplier))
  → if (!DEV_CONFIG.godMode): player.hp -= reduced
  → if player.hp <= 0: scene.start('GameOverScene')
```

### Fluxo de Transição Cidade → Dungeon

```
player move para tile com entrarDungeon=true
  → _checkAreaTransition()
  → mapTransitionSystem.requestTransition('town-to-dungeon')
  → _cleanup() → _loadDungeonFloor(1)
  → EventBus.emit(AREA_CHANGED, { area: 'dungeon' })
```

---

## 6. Convenções Arquiteturais

- **EventBus Global:** canal pub/sub entre `GameScene` e `UIScene`. Todos os eventos são strings em `EVENTS`.
- **Sistemas Stateless vs. Stateful:** `CombatSystem`, `ClassRulesEngine`, `SpellCastingSystem` são puramente funcionais. `InventorySystem`, `EquipmentSystem`, `SpellSystem` mantêm estado.
- **Duck Typing:** `XPSystem.addXP()` aceita `PlayerLike` — permite testes com plain objects.
- **Cache de Andares:** `_dungeonCache` persiste dungeons visitadas. Inimigos são recriados a cada visita.
- **Modos de Input (Pilha):** `GAMEPLAY → INVENTORY → SHOP → DIALOG`. ESC faz pop.

---

## 7. Como Adicionar Novas Funcionalidades

### Nova Classe de Personagem
1. Adicionar entrada em `PLAYER_CLASSES` (`src/config/player-classes.config.ts`).
2. Escolher `frame` do spritesheet.
3. Se tiver magias exclusivas: adicionar em `exclusiveSpells` e `spells.db.ts`.
4. Se tiver regras especiais: atualizar `ClassRulesEngine.canEquipSlot()`.

### Novo Inimigo
1. Adicionar em `ENEMY_DEFS` (`src/config/enemies.config.ts`).
2. Se categoria nova: adicionar spritesheets e carregar na `BootScene`.

### Novo Item Consumível
1. Adicionar tipo em `ConsumableItemType` (`src/entities/Item.ts`).
2. Adicionar nomes em `UNKNOWN_NAMES` e `REAL_NAMES`.
3. Adicionar case em `InventorySystem.useItem()`.

### Nova Magia
1. Adicionar em `SPELLS_DB` (`src/config/spells.db.ts`).
2. Registrar animações em `BootScene._registerSpellAnims()`.
3. Adicionar ao `SPELL_PROGRESSION` no nível desejado.

---

## 8. Problemas Arquiteturais Encontrados

| Problema | Impacto |
|----------|---------|
| `GameScene` com ~1000+ linhas (Classe Deus) | Difícil testar e adicionar features |
| EventBus sem tipagem forte nos payloads | Erros silenciosos se formato mudar |
| `CombatSystem.resolve()` duplica lógica do `TurnManager` | Risco de dupla-aplicação de dano |
| Cache de dungeon não serializa inimigos | Inimigos ressurgem ao revisitar andares |
| `console.log` de debug em produção | Poluição do console, strings no bundle |
| `GameOverScene._restart()` não passa classe | Reinício sempre usa Aventureiro |
| Mago sem mana/magia não consegue causar dano | Sem mensagem clara para este estado |
