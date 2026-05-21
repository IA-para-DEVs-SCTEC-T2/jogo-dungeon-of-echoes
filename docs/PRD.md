# PRD — Product Requirements Document
# Dungeon of Echoes

**Versão:** 1.0.2  
**Data:** 2026-05-21  
**Equipe:** Equipe 7 — IA para DEVs SCTEC T2  
**Status:** v1.0.2 — Fix: testes do sistema de magias desatualizados após rebalanceamento de fire_bolt e spell-progression

---

## 1. Visão Geral do Produto

**Dungeon of Echoes** é um RPG roguelike tile-based jogado inteiramente no navegador, sem instalação e sem backend. O jogador controla um personagem que explora masmorras geradas proceduralmente, combate inimigos em turnos e progride de nível até ser eliminado permanentemente.

O projeto é desenvolvido em JavaScript com Phaser 4 e Vite, seguindo arquitetura em camadas com sistemas independentes e testáveis. A estrutura é preparada para expansão futura com IA generativa (LLMs), mas o MVP não depende de conectividade externa.

---

## 2. Problema que o Produto Resolve

Jogos roguelike clássicos como *Castle of the Winds* e *NetHack* oferecem alta rejogabilidade por combinar geração procedural com permadeath. Porém, sua distribuição é limitada a executáveis nativos com instalação obrigatória.

**Dungeon of Echoes** resolve isso entregando a mesma essência de exploração e risco em um formato acessível via browser, sem fricção de instalação, e com código aberto que serve como referência de arquitetura modular para jogos 2D em JavaScript.

---

## 3. Público-Alvo

| Perfil | Interesse principal |
|--------|-------------------|
| Jogadores de RPG/roguelike | Experiência clássica sem instalação |
| Estudantes de desenvolvimento de jogos | Referência de arquitetura com Phaser 4 |
| Avaliadores acadêmicos | Demonstração de arquitetura modular, testes e boas práticas de engenharia |

---

## 4. Proposta de Valor

- **Zero fricção**: roda no browser, sem instalação, sem conta, sem backend
- **Arquitetura documentada**: cada sistema tem spec em Markdown antes de qualquer código
- **Testável**: lógica de domínio isolada das cenas Phaser, coberta por testes unitários com Vitest
- **Extensível**: estrutura de pastas e convenções preparadas para IA generativa, múltiplos andares e inventário sem reescrita
- **Reproduzível**: suporte a seed no gerador de dungeon para debug determinístico

---

## 5. Core Gameplay

O loop central é **turn-based e tile-based**:

```
Input do jogador
    → Resolve ação (mover / atacar / esperar)
    → Atualiza estado do jogo
    → Executa turno dos inimigos
    → Verifica condições (game over)
    → Atualiza HUD
    → Aguarda próximo input
```

Cada partida começa em uma dungeon nova. O jogador avança derrotando inimigos, acumulando XP e subindo de nível. Não há vitória — o objetivo é sobreviver o máximo possível. A morte é permanente (permadeath).

---

## 6. Mecânicas Principais

### 6.1 Dungeon

- Grid de **40×40 tiles** (WALL ou FLOOR)
- Geração procedural: até **8 salas** (4×4 a 10×8 tiles), conectadas por corredores em L
- Borda sempre WALL; posição inicial do player sempre em tile FLOOR
- Suporte a `seed` para reprodutibilidade em debug
- **Múltiplos andares** com cache de estado por andar (`_dungeonCache`): escadas para baixo (andar N+1) e para cima (andar N-1), retorno à cidade pelo andar 1
- **Tema visual por andar**: andares 1–2 → Dungeon, 3–4 → Mine, 5–6 → Underworld, 7+ → Underworld Boss
- **Pipeline de renderização Shell-not-Volume** (v0.5.3): dungeon como espaço esculpido dentro da escuridão
  - `SemanticClassifier.classifyGrid()` — classifica tiles em `FLOOR / WALL_EDGE / VOID` usando 4 vizinhos cardinais; garante casca de exatamente 1 tile
  - `TileSemanticsProvider` — desacopla semântica visual (`isVisuallyOpen`) de semântica de colisão (`isWalkable`, `isSolid`); bitmask usa `isVisuallyOpen`, não `=== TILE.FLOOR`
  - `WallVariantLUT` — tabela canônica de 256 entradas com `sanitizeMask()` (fecha diagonais sem cardinal suporte) e `classifyVariant()` pura sem chain de overwrites
  - `AutoTileResolver` — branch wall_edge com bitmask 8-bit; fallback 4-vizinhos para temas sem `bitmaskFrames`
  - `DungeonRenderer` — skipa VOID (câmera preta cobre); emite `RenderCommand[]` atlas-agnósticos
  - Tooling dev: `MaskFrequencyLogger`, `DebugOverlayRenderer` (modos: semantic/variant/bitmask), `VisualRegressionScene` (layout determinístico 20×15)
- **`DungeonRenderer`** emite `RenderCommand[]`; `GameScene` apenas cria sprites — zero lógica visual na cena

### 6.2 Player

**Atributos base (inicializados via `BASE_STATS`):**

| Atributo | Valor | Efeito derivado |
|----------|-------|----------------|
| CON | 18 | HP máximo = CON × 5 + Nível × 3 |
| WIS | 10 | Mana máxima = WIS × 4 + INT × 2 |
| INT | 10 | Contribui para Mana máxima |
| STR | 10 | — (reservado para bônus de ataque futuro) |
| DEX | 10 | — (reservado para evasão futura) |
| CHA | 10 | — (reservado para IA generativa futura) |
| Ataque | 10 | Dano fixo por golpe (escala com level up) |
| Nível | 1 | — |
| XP | 0 | — |

- [x] Movimento por **WASD ou setas** (4 direções, sem diagonal)
- [x] Movimento contínuo ao segurar direcional (cooldown interno de 150ms por tile)
- [x] Bloqueado por WALL; ao mover para tile com inimigo → inicia combate
- [x] Atributos derivados calculados por fórmula (não bônus fixo)

### 6.3 Combate

- **Automático** ao tentar mover para tile ocupado por inimigo vivo
- Sequência: player ataca → inimigo contra-ataca (se vivo) no turno seguinte
- **80% de chance de acerto** por ataque — miss gera mensagem no log sem causar dano
- Feedback visual: texto flutuante por 800ms + flash de câmera

### 6.4 Inimigos

| Atributo | Valor padrão |
|----------|-------------|
| HP | 30 |
| Ataque | 8 |
| XP ao morrer | 25 |
| Quantidade por dungeon | 6 |
| Raio de detecção | 8 tiles |

- [x] Spawnam em tiles FLOOR, sem sobreposição com player ou entre si
- [x] **IA com máquina de estados**: `IDLE → CHASING → ATTACKING`
  - `IDLE`: parado, aguardando detecção
  - `CHASING`: movimenta 1 tile por turno em direção ao player; detecção ativa quando player entra na **mesma sala** (bounds do Room BSP) ou dentro do `detectionRadius`
  - `ATTACKING`: executa dano quando em tile adjacente ao player
- [x] Não atravessa paredes; não ocupa tile de outro inimigo vivo

### 6.5 XP e Progressão

- [x] Fórmula: `xpToNextLevel = 100 × N × (N + 1) / 2` (acumulativa)
- [x] A cada level up: `recalcStats()` recalcula `maxHp` e `maxMana` pelas fórmulas de atributos; `attack += 5`; HP restaurado ao máximo
- [x] Suporte a múltiplos level-ups encadeados em uma única concessão de XP

### 6.6 Inventário e Itens

- [x] Inventário com **20 slots** (`InventorySystem`) — sem stack por slot
- [x] Entidade `Item`: `id`, `type`, `identified`, `gridX/Y`
- [x] Dois tipos de poção: `potion_heal` (+10 HP) e `potion_poison` (-5 HP)
- [x] **Sistema de identificação roguelike**: itens aparecem com nomes genéricos ("Poção Vermelha / Azul") até serem usados; após uso, nome real revelado para todos os itens do mesmo tipo na partida
- [x] Spawn de 3–6 itens em tiles FLOOR aleatórios
- [x] Coleta automática ao pisar sobre o tile com item
- [x] Uso via teclas `1–9`; tecla `I` lista inventário no log
- [x] Usar item **consome turno** (integrado ao `TurnManager`)
- [x] Action bar visual na UIScene: 9 slots na barra inferior com ícone colorido por tipo
- [x] HP limitado a `[0, maxHp]` ao usar qualquer poção

### 6.7 HUD

| Elemento | Conteúdo |
|----------|----------|
| Barra HP | Visual proporcional; cor muda para vermelho quando HP < 30% |
| Barra Mana | Visual proporcional (azul) |
| Labels | Nível, ATK, "XP: atual / próximo" |
| Log | Últimas 5 mensagens (dano, level up, coleta, uso de item, morte) na base da tela |
| Action bar | 9 slots de inventário com ícone colorido (amarelo = cura, roxo = veneno) |

- [x] `UIScene` executa como overlay paralelo à `GameScene` via `this.scene.launch()`
- [x] Atualizada via `EventBus` — nunca lê o Player diretamente a cada frame
- [x] Cleanup de listeners no `shutdown()` — sem memory leak ao reiniciar

---

## 7. Requisitos Funcionais

Os requisitos abaixo são derivados diretamente das specs em `.kiro/specs/`.

### RF-01 — Geração de Dungeon
- O sistema deve gerar um grid de tiles WALL/FLOOR ao iniciar a GameScene
- Deve garantir ao menos 1 sala e `startPos` sempre em FLOOR
- Acesso fora dos limites deve retornar WALL sem lançar exceção

### RF-02 — Controle do Player
- O player deve responder a WASD e teclas de seta (4 direções)
- Movimento para WALL deve ser ignorado silenciosamente
- Apenas um input deve ser processado por turno
- HP nunca abaixo de 0; ao chegar a 0, emite `player-died`

### RF-03 — Combate
- Combate deve ser iniciado automaticamente ao mover para tile com inimigo vivo
- Player ataca primeiro; inimigo contra-ataca se sobreviver
- Morte do inimigo deve conceder XP ao player imediatamente
- Inimigo morto não bloqueia movimento do player

### RF-04 — Inimigos
- Spawn em tiles FLOOR sem sobreposição
- Morte remove o sprite e emite `enemy-died`
- Inimigo morto não participa de combate
- **[v0.1.2]** IA de perseguição: detecta player por sala ou raio; move 1 tile/turno; ataca quando adjacente

### RF-05 — Progressão de XP
- XP acumulativo; nunca resetado ao subir de nível
- Fórmula: `xpToNextLevel = level × 100`
- Múltiplos level-ups em uma única concessão devem ser processados em sequência
- Valores de XP inválidos (≤ 0, NaN) devem ser ignorados

### RF-06 — Estados do Jogo
- Estado `PLAYING`: input ativo, inimigos reativos, HUD visível
- Estado `GAME_OVER`: input bloqueado, tela de resultado exibida
- Reiniciar deve gerar nova dungeon e resetar player completamente

### RF-07 — HUD
- HP, XP e Nível devem ser exibidos e atualizados após cada ação
- Câmera deve seguir o player mantendo-o centralizado

### RF-08 — Input
- Tecla Espaço deve passar o turno sem mover o player
- Input ignorado completamente no estado `GAME_OVER`
- Teclas não mapeadas devem ser ignoradas silenciosamente

### RF-09 — Inventário
- Item coletado vai para primeiro slot livre; slot cheio bloqueia coleta com feedback
- Uso de item inválido (slot vazio) deve ser ignorado silenciosamente
- HP resultante de uso de poção deve ser limitado ao intervalo `[0, maxHp]`
- Identificação é por partida: se `potion_heal` foi identificada, todos os itens do tipo mostram nome real

### RF-10 — Itens no Mapa
- Itens visualmente renderizados na UIScene com cor correspondente ao tipo
- Coleta remove sprite do mapa e atualiza action bar
- Ao usar, slot correspondente é limpo na action bar

---

## 8. Requisitos Não Funcionais

| ID | Requisito | Critério |
|----|-----------|---------|
| RNF-01 | Performance | Jogo deve rodar a 60 FPS em hardware comum com WebGL |
| RNF-02 | Compatibilidade | Funcionar nos últimos 2 releases de Chrome, Firefox e Edge |
| RNF-03 | Sem dependência de rede | Jogo completamente funcional offline após carregamento inicial |
| RNF-04 | Testabilidade | Lógica de domínio (sistemas) testável sem instanciar cenas Phaser |
| RNF-05 | Manutenibilidade | Nenhuma feature implementada sem spec correspondente em `.kiro/specs/` |
| RNF-06 | Qualidade de commits | Todas as mensagens de commit validadas pelo Commitlint (Conventional Commits) |
| RNF-07 | Build reproduzível | `npm install && npm run build` deve produzir bundle funcional sem intervenção |
| RNF-08 | Separação de camadas | Sistemas nunca importam cenas; cenas nunca calculam lógica de domínio |

---

## 8.1 User Stories

As histórias abaixo representam os principais fluxos do jogador e guiaram as decisões de design e implementação do produto.

**US-01 — Seleção de Classe**
> Como jogador, quero escolher uma classe antes de iniciar a partida (Guerreiro, Arqueiro, Mago ou Aventureiro), para que minha experiência de jogo reflita um estilo de combate distinto desde o primeiro turno.

**Critérios de aceite:**
- Tela de seleção exibe as 4 classes com atributos e habilidades de cada uma
- Ao confirmar, os bônus da classe são aplicados aos atributos base do personagem
- Não é possível trocar de classe após iniciar a partida

---

**US-02 — Exploração com Memória de Mapa**
> Como jogador, quero que as áreas já exploradas permaneçam visíveis no mapa mesmo após sair do andar ou visitar a cidade, para que eu possa me orientar sem precisar reexplorar áreas já conhecidas.

**Critérios de aceite:**
- Tiles visitados ficam com iluminação reduzida (estado REVEALED) ao saírem do campo de visão
- O estado de exploração persiste ao transitar entre dungeon e cidade
- Tiles nunca visitados permanecem completamente escuros (estado HIDDEN)

---

**US-03 — Narrativa Dinâmica via IA**
> Como jogador, quero receber descrições narrativas geradas por IA ao encontrar inimigos elite e ao interagir com NPCs, para que cada partida tenha uma identidade única e imersiva.

**Critérios de aceite:**
- Inimigos elite recebem nome e habilidade especial gerados pelo modelo de linguagem
- Diálogos de NPCs são contextualizados com os eventos recentes da partida
- A narrativa é exibida no painel de log sem interromper o fluxo de jogo

---

## 9. Escopo

### Dentro do escopo (v0.6.0 — estado atual)

- [x] Geração procedural de dungeon (salas + corredores BSP, 40×40 tiles)
- [x] Player controlável (4 direções, turn-based real via TurnManager)
- [x] Atributos base RPG (CON/WIS/INT/STR/DEX/CHA) com fórmulas derivadas
- [x] Combate automático turn-based com 80% hit chance
- [x] IA de inimigos: IDLE → CHASING → ATTACKING, detecção por sala e raio
- [x] Sistema de XP e progressão de nível com recálculo de atributos
- [x] HUD persistente via UIScene overlay (barras HP/Mana, log, action bar de inventário)
- [x] Sistema de inventário: 20 slots, coleta automática, uso por tecla
- [x] Sistema de identificação roguelike de itens (nome desconhecido → real ao usar)
- [x] Equipamentos: armas e armaduras com slots, bônus reversíveis, loja de compra/venda
- [x] Múltiplos andares de dungeon com cache de estado e escadas bidirecionais
- [x] Tema visual por andar: Dungeon/Mine/Underworld/Boss
- [x] **Shell-not-Volume rendering com bitmask 8-bit** (SemanticClassifier + TileSemanticsProvider + WallVariantLUT)
- [x] Tooling de desenvolvimento: MaskFrequencyLogger, DebugOverlayRenderer, VisualRegressionScene
- [x] Mapa da cidade (TMX) com NPCs, loja, estalajadeiro e debug de tiles
- [x] Área bônus (30×22 tiles) com renderer próprio, debug idêntico à cidade e overrides isolados
- [x] `DEV_CONFIG.godMode` para testes sem risco de morte
- [x] Integração com IA generativa (AIService — descrições atmosféricas de itens e inimigos elite)
- [x] Game Over com tela de resultado e restart (estatísticas completas via PlayerMetrics)
- [x] 125+ testes unitários (+ testes guia de LogSystem e PlayerMetrics)
- [x] Dashboard estático de acompanhamento do projeto
- [x] Classes de herói com bônus de atributo aplicados ao iniciar (`applyClassBonus`)
- [x] Drops de ouro com tier visual (GOLD_SMALL/MEDIUM/LARGE) baseados em quantidade
- [x] Baús nas dungeons: geração procedural, loot por profundidade, interação com mímica

### Fora do escopo (planejado para versões futuras)

| Feature | Motivo da exclusão |
|---------|-------------------|
| FOG of War | Complexidade visual; spec pronta em `.kiro/specs/fog-of-war.spec.md` |
| Múltiplos tipos de inimigo | Balanceamento adiado para pós-refinamento |
| Sistema de save | Permadeath intencional; sem persistência é comportamento esperado |
| Magia e habilidades ativas | Mana implementada; uso em habilidades planejado para versão futura |
| Minimap | Spec pronta em `.kiro/specs/minimap.spec.md` |

---

## 10. Roadmap

### v0.1.0 — MVP (entregue em 2026-04-30)
- [x] Geração procedural de dungeon
- [x] Player com movimento e atributos
- [x] Combate turn-based com feedback visual
- [x] Sistema de XP e level up
- [x] HUD e câmera
- [x] Game Over e restart
- [x] 17 testes unitários
- [x] Infraestrutura: Vite, Vitest, Husky, Commitlint, CI

### v0.1.1 — Tileset e TypeScript (entregue em 2026-05-01)
- [x] Migração para TypeScript (strict)
- [x] Integração do tileset Dawnlike 16×16 (CC-BY 4.0)
- [x] Easter egg Platino (cumprimento da licença)
- [x] Template de Pull Request e hook pre-commit

### v0.1.2 — Refinamento Fase 1 (entregue em 2026-05-02)
- [x] Atributos base RPG (STR/INT/DEX/CON/WIS/CHA) com fórmulas derivadas
- [x] HP máximo = CON × 5 + Nível × 3; Mana máxima = WIS × 4 + INT × 2
- [x] UIScene overlay com barras HP/Mana, labels e log de mensagens
- [x] EventBus cross-cena (sem dependência de Phaser, compatível com Node)
- [x] IA de inimigos: IDLE → CHASING → ATTACKING com detecção por sala e raio
- [x] Movimento contínuo ao segurar direcional (isDown + cooldown 150ms)
- [x] Correção: HP visual do inimigo sincronizado após combate
- [x] Correção: UIScene sincroniza HP do player após contra-ataque
- [x] 48 testes unitários (+18 novos: colisão, IA, combate)
- [x] Dashboard estático de acompanhamento do projeto (GitHub API)

### v0.2.0 — Sistema de Turnos Real (entregue em 2026-05-04)
- [x] `TurnManager`: turno real — jogo só avança ao agir
- [x] `Enemy` entidade pura desacoplada de Phaser
- [x] `CombatSystem.attack()` com 80% hit chance
- [x] Input: `JustDown` (um keypress = um turno), `SPACE` para WAIT
- [x] Log de combate com mensagens detalhadas por evento

### v0.3.0 — Inventário e Itens (entregue em 2026-05-05)
- [x] `InventorySystem` com 20 slots
- [x] `Item` com sistema de identificação roguelike
- [x] Dois tipos de poção: heal (+10 HP) e poison (−5 HP)
- [x] Coleta automática ao pisar; uso via teclas 1–9
- [x] Action bar visual na UIScene
- [x] Fullscreen responsivo (FIT + parent 100vw/100vh)

### v0.4.0 — Cidade + Equipamentos (entregue em 2026-05-07)
- [x] Mapa da cidade (TMX) com NPCs deambulatórios, loja e estalajadeiro
- [x] `EquipmentSystem`: slots de arma/armadura, bônus reversíveis
- [x] `ShopSystem`: compra/venda com gold, catálogo configurável
- [x] `InputModeManager`: push/pop de modos de input (GAMEPLAY / DIALOG / INVENTORY / SHOP)
- [x] Painéis de UI: `InventoryPanel`, `ShopPanel`, `DialogPanel`, `LogPanel`, `ActionBarPanel`
- [x] `WorldSystem`: persistência de estado entre dungeon e cidade dentro da sessão
- [x] `MapTransitionSystem`: transição cidade ↔ dungeon com posição preservada

### v0.5.0 — Múltiplos Andares + Dificuldade (entregue em 2026-05-08)
- [x] `DungeonFloorManager`: múltiplos andares com cache de estado por andar
- [x] `DifficultyScalingSystem`: atributos de inimigos escalam por andar
- [x] Escadas bidirecionais (andar N+1 / N-1 / retorno à cidade)
- [x] Temas visuais por andar: Dungeon → Mine → Underworld → Boss

### v0.5.1 — Área Bônus (entregue em 2026-05-09)
- [x] `BonusAreaRenderer`: renderer dedicado para área bônus 30×22 tiles
- [x] `BONUS_AREA_OVERRIDES` isolado de `MANUAL_MAP_OVERRIDES`
- [x] Debug visual idêntico ao da cidade (modo dev)
- [x] `DEV_CONFIG.godMode` em `constants.ts`

### v0.5.2 — IA Generativa (entregue em 2026-05-10)
- [x] `AIService`: integração com LLM (OpenAI-compatible) para narrativa procedural
- [x] Descrições atmosféricas de itens raros geradas em background (não-bloqueante)
- [x] Variantes de inimigos elite com atributos e nome gerados por IA
- [x] Fallback gracioso quando API key ausente ou serviço indisponível
- [x] Cache de respostas por sessão

### v0.5.3 — Shell-not-Volume Rendering (entregue em 2026-05-11)
- [x] `SemanticClassifier`: FLOOR / WALL_EDGE / VOID com 4 vizinhos cardinais (casca de 1 tile)
- [x] `TileSemanticsProvider`: `isVisuallyOpen` / `isWalkable` / `isSolid` desacoplados
- [x] `WallVariantLUT`: LUT canônica 256 entradas + `sanitizeMask()` + `classifyVariant()` puro
- [x] `AutoTileResolver`: bitmask 8-bit com fallback 4-vizinhos para temas sem `bitmaskFrames`
- [x] `DungeonRenderer`: skipa VOID; câmera preta cobre massa de parede
- [x] `MaskFrequencyLogger`, `DebugOverlayRenderer`, `VisualRegressionScene` (dev-only)
- [x] Todos os 4 temas de dungeon migrados para `bitmaskFrames`

### v0.5.4 — Sistema de Magias (entregue em 2026-05-12)
- [x] `SpellSystem`: desbloqueio de magias por nível, dois slots J/K com cooldown independente
- [x] `SpellCastingSystem`: mecânica melee-range — verifica mana e cooldown, aplica dano em todos os inimigos adjacentes (4 cardinais)
- [x] `SpellsPanel`: integrado ao painel `I`; mesmas dimensões do inventário; navegação por teclado (↓ entra na lista, ↑ na primeira magia volta às abas, Enter/E equipa em J, K equipa em K)
- [x] `StatusPanel`: painel de atributos detalhados (STR/INT/DEX/CON/WIS/CHA, HP, Mana)
- [x] `spells.db.ts`: 5 magias data-driven (fire_bolt, ice_shard, wind_cyclone, fire_explosion, blizzard)
- [x] `spell-progression.ts`: tabela de desbloqueio por nível extendível
- [x] Slots J/K no footer (action bar), canto direito, tamanho 20×20 com barra de cooldown
- [x] Player com `facingDir`, `unlockedSpells` e `equippedSpells`
- [x] XPSystem integrado: desbloqueia magias automaticamente ao subir de nível
- [x] Barra de HP do inimigo atualizada imediatamente após dano de magia

### v0.6.0 — Classes, Drops Visuais e Baús (entregue em 2026-05-16)
- [x] `Player.applyClassBonus()`: aplica `statBonus` da classe selecionada aos atributos reais; `recalcStats()` + restauro de HP/Mana
- [x] Drops de ouro com tier visual: `GOLD_SMALL` / `GOLD_MEDIUM` / `GOLD_LARGE` baseados em `goldAmount` (frames da Row 2 de `Money.png`)
- [x] `DungeonFeatureGenerator`: tipo `chest` — 1–2 baús por andar em rooms intermediárias com `metadata.opened`
- [x] `LootSystem.rollChestLoot()`: loot de baú por profundidade (ouro/poção/mímica/equipamento)
- [x] `GameScene._checkChestInteraction()`: interação completa com baú (dano de mímica, coleta de ouro/poção, equipamento direto ao inventário)
- [x] `Item.goldAmount` declarada como propriedade formal (era assignment dinâmico sem tipagem)
- [x] `_spawnDroppedItem()` idempotente: evita sprites duplicados e dupla inserção em `_items`
- [x] Tela de Game Over com estatísticas completas da partida via `PlayerMetrics`
- [x] Testes guia para `LogSystem` e `PlayerMetrics` com exercícios

### v0.7.0 — FOG of War (planejado)
- [ ] FOG of War: HIDDEN / VISIBLE / REVEALED por tile
- [ ] Minimap com estado de exploração

### v1.0.0 — IA Generativa Avançada (planejado)
- [ ] Narrativa emergente baseada no histórico da partida
- [ ] Múltiplos tipos de inimigo com comportamentos distintos
- [ ] Pathfinding A* para inimigos

---

## 11. Métricas de Sucesso

| Métrica | Critério de sucesso |
|---------|-------------------|
| Jogabilidade | Partida completa possível do boot ao game over sem erros no console |
| Estabilidade | Zero crashes reportados em sessão de 10 minutos de jogo |
| Testes | 100% dos testes unitários passando em `npm test` |
| Build | `npm run build` produz bundle funcional sem warnings críticos |
| Commits | 100% dos commits na branch `main` e `staging` validados pelo Commitlint |
| Cobertura de specs | Cada sistema implementado possui spec correspondente em `.kiro/specs/` |
