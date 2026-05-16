## Prompt 1
Autor: Vitor
Data: 2026-05-01

Contexto:
Estou trabalhando em um projeto versionado com Git e quero padronizar o controle de mudanças.

Objetivo:
1. Criar um arquivo CHANGELOG.md seguindo boas práticas
2. Gerar o histórico inicial com base nos commits já existentes na branch "staging"
3. Definir um padrão para que novas mudanças sejam adicionadas corretamente no futuro

Tarefas:

1. Estrutura do CHANGELOG:
- Criar um CHANGELOG.md seguindo o padrão "Keep a Changelog"
- Utilizar versionamento semântico (SemVer)
- Organizar as entradas em:
  - Added
  - Changed
  - Fixed
  - Removed
  - (outros se necessário)

2. Geração do histórico:
- Considerar os commits da branch "staging"
- Agrupar commits relacionados em entradas mais legíveis (não apenas listar commits brutos)
- Traduzir mensagens técnicas em descrições claras de funcionalidades
- Ignorar commits irrelevantes (ex: ajustes pequenos, typos, etc.), a menos que impactem o comportamento

3. Qualidade das entradas:
- Cada item deve descrever impacto real (feature, bugfix, mudança de comportamento)
- Evitar mensagens genéricas como "ajustes" ou "melhorias"
- Manter consistência de linguagem

4. Evolução futura:
- Incluir uma seção inicial explicando como manter o changelog
- Definir convenção para novos commits contribuírem facilmente para o changelog
- Sugerir padrão de commit (ex: Conventional Commits)


## Prompt 2
Autor: Vitor
Data: 2026-05-01

Contexto:
Estou desenvolvendo um jogo chamado "Dungeon of Echoes", um roguelike tile-based inspirado em Castle of the Winds, com uso de IA generativa (LLMs).

O projeto já possui:
- README.md com descrição do jogo
- Estrutura .kiro com product.md, structure.md, tech.md e specs/
- Uso de Phaser + Vite
- Histórico de desenvolvimento com commits reais

Objetivo:
Gerar documentação exigida para um trabalho acadêmico.

Tarefas:

1. Criar o arquivo docs/PRD.md (Product Requirements Document)

O PRD deve conter:

- Visão geral do produto
- Problema que o jogo resolve
- Público-alvo
- Proposta de valor
- Core gameplay
- Mecânicas principais
- Requisitos funcionais (baseados nas specs existentes)
- Requisitos não funcionais
- Roadmap inicial (versões ou marcos)
- Métricas de sucesso (mesmo que simples)
- Escopo (o que está dentro e fora)

Regras:
- Ser coerente com o README e com a proposta do jogo
- Não inventar features que não existem
- Ser objetivo e técnico (evitar texto genérico)

---

2. Criar o arquivo docs/prompts.md

Este arquivo deve documentar os prompts utilizados no desenvolvimento com IA.

Conteúdo esperado:

- Explicação breve do uso de IA no projeto
- Lista de prompts organizados por contexto, por exemplo:
  - Estruturação do projeto
  - Geração de código
  - Correção de bugs
  - Documentação
- Para cada prompt:
  - Contexto
  - Prompt utilizado
  - Objetivo
  - Resultado esperado

Importante:
- NÃO inventar prompts irreais
- Pode sugerir prompts plausíveis baseados no tipo de trabalho realizado
- Manter formato claro e organizado

---

Formato da resposta:

- Retornar os dois arquivos completos:
  - docs/PRD.md
  - docs/prompts.md
- Usar Markdown bem estruturado
- Separar claramente cada arquivo com título

---

Critérios de qualidade:

- Clareza
- Coerência com o projeto
- Organização
- Linguagem técnica adequada

## Prompt 3
Autor: Vitor
Data: 2026-05-01

Contexto:
O projeto utiliza Husky para validação de commits. Quero garantir que todo commit
inclua obrigatoriamente CHANGELOG.md e o arquivo de prompts do membro que está commitando.
Também quero padronizar a criação de Pull Requests no GitHub com um template obrigatório.

Objetivo:
1. Atualizar .husky/pre-commit para bloquear commits que não incluam CHANGELOG.md
   e pelo menos um arquivo em docs/prompts/
2. Criar .github/pull_request_template.md com template padronizado para PRs

Tarefas:
1. Implementar validação no pre-commit usando git diff --cached --name-only
2. Exibir mensagem clara de erro com instrução de correção quando bloqueado
3. Criar template de PR com: descrição, tipo, o que foi feito, como testar,
   evidências, checklist e observações

Requisitos:
- Shell script Unix compatível com o Husky
- Não quebrar o npm test que já existe no hook
- Template em Markdown com comentários <!-- --> explicativos
- Checklist alinhado com as regras do projeto (CHANGELOG, prompts, Conventional Commits)

--

## Prompt 4
Autor: Vitor
Data: 2026-05-01

Contexto:
Estou fornecendo um conjunto de arquivos do projeto, incluindo documentação e especificações relacionadas à fase_1.

Objetivo:
Analisar o estado atual do projeto em relação à fase_1 e gerar um plano claro de execução do que ainda falta.

Tarefas:

1. Análise do estado atual:
- Identificar o que já foi implementado ou documentado
- Relacionar explicitamente cada item com os requisitos da fase_1
- Classificar cada item como:
  - ✅ Concluído
  - ⚠️ Parcial
  - ❌ Não iniciado

2. Identificação de lacunas:
- Listar tudo que ainda não atende aos requisitos da fase_1
- Explicar brevemente o que falta em cada item

3. Planejamento de execução:
- Criar um plano estruturado para completar a fase_1
- Organizar em ordem lógica de implementação
- Sugerir divisão em tarefas menores (estilo backlog técnico)

4. Priorização:
- Indicar o que deve ser feito primeiro
- Justificar a ordem (dependências, risco, impacto)

5. Saída estruturada:

## Status da Fase 1
(lista com ✅ ⚠️ ❌)

## Lacunas Identificadas
(lista objetiva)

## Plano de Execução
(passos numerados e claros)

## Prioridades
(explicação da ordem sugerida)

Regras:
- Basear-se apenas no contexto fornecido
- Não inventar funcionalidades
- Ser objetivo e técnico
- Evitar respostas genéricas

## Prompt 5 — PR: feat(dashboard): add project tracking dashboard with GitHub API
Autor: Vitor
Data: 2026-05-02

Contexto:
O projeto possui um repositório no GitHub (`IA-para-DEVs-SCTEC-T2/jogo-dungeon-of-echoes`).
Crie um dashboard estático em `dashboard/index.html` que mostre o estado do projeto
em tempo real, consumindo apenas a API do GitHub.

Objetivo:
Criar uma página HTML com tailwindcss que exiba:
1. Timeline dos últimos commits do branch `staging` com diferenciação visual entre commits de feature e merges
2. Painel de contribuidores com avatar, login e número de commits
3. Renderização do `CHANGELOG.md` diretamente do repositório

Requisitos:
- Layout dark com efeito glassmorphism nos cards
- Responsivo: coluna única em mobile, grid 7/5 em desktop
- Sem dependências de backend — apenas fetch à API pública do GitHub e CDNs
- Exibir skeleton loader enquanto os dados carregam

Arquivos gerados/modificados: `dashboard/index.html`, `CHANGELOG.md`

---

## Prompt 6 — PR: feat(ui): UIScene overlay, atributos base RPG e EventBus
Autor: Vitor
Data: 2026-05-02

Contexto:
O jogo possui HUD rudimentar embutido na GameScene (texto simples). Precisamos de uma
cena overlay dedicada que se atualize via eventos sem acoplar diretamente ao Player.

Objetivo:
1. Criar `src/scenes/UIScene.ts` rodando em paralelo à GameScene via `this.scene.launch()`
2. Criar `src/utils/EventBus.ts` (singleton sem dependência de Phaser) para comunicação cross-cena
3. Adicionar atributos base RPG ao Player (STR/INT/DEX/CON/WIS/CHA) com fórmulas derivadas:
   - HP máximo = CON × 5 + Nível × 3
   - Mana máxima = WIS × 4 + INT × 2
4. UIScene exibe: barras de HP e Mana, labels de Nível/ATK/XP e log de 5 mensagens

Requisitos:
- UIScene nunca lê o Player diretamente a cada frame
- Emitir PLAYER_HP_CHANGED, PLAYER_MANA_CHANGED, PLAYER_XP_CHANGED via EventBus
- Cleanup de listeners no shutdown() para evitar memory leak
- EventBus compatível com Node.js (testes Vitest sem mock de browser)

Arquivos gerados/modificados: `src/utils/EventBus.ts`, `src/scenes/UIScene.ts`,
`src/entities/Player.ts`, `src/systems/XPSystem.ts`, `src/scenes/GameScene.ts`,
`src/main.ts`, `src/utils/constants.ts`

---

## Prompt 7 — PR: fix(combat)+feat(enemy-ai)+feat(input): correções de combate, IA e movimento contínuo
Autor: Vitor
Data: 2026-05-02

Contexto:
Três problemas identificados no protótipo funcional:
1. HP visual do inimigo não diminuía após sofrer dano (_syncEnemySprite nunca chamada)
2. Inimigos eram estáticos (sem lógica de perseguição)
3. Movimento exigia clique por ação (JustDown) em vez de ser contínuo ao segurar

Objetivo:
1. Corrigir fluxo de dano: chamar _syncEnemySprite após combate e emitir PLAYER_HP_CHANGED
   quando CombatSystem modifica player.hp diretamente (sem passar por takeDamage)
2. Implementar IA de perseguição no EnemySystem:
   - Máquina de estados IDLE → CHASING → ATTACKING
   - Detecção por setor (mesma Room BSP) e por raio (detectionRadius = 8 tiles)
   - Movimentação: 1 tile por turno, eixo de maior distância primeiro, sem atravessar paredes
3. Substituir JustDown por isDown — movimento contínuo com cadência controlada pelo
   cooldown interno de 150ms do Player.tryMove
4. Gerar testes Vitest:
   - tests/combat.test.js: +2 cenários de HP (7 total)
   - tests/player-collision.test.js: 8 testes de colisão e cooldown (novo)
   - tests/enemy-ai.test.js: 8 testes de IA (novo) — 48 testes total

Arquivos gerados/modificados: `src/systems/EnemySystem.ts`, `src/scenes/GameScene.ts`,
`src/utils/constants.ts` (DETECTION_RADIUS), `tests/combat.test.js`,
`tests/player-collision.test.js`, `tests/enemy-ai.test.js`

---

## Prompt 8 — PR: feat(dashboard): redesign completo com visão geral, PRs, contributors corrigidos
Autor: Vitor
Data: 2026-05-03

Contexto:
O dashboard existente em `dashboard/index.html` exibia apenas a timeline de commits e
contribuidores, porém apresentava um bug crítico: apenas um usuário aparecia como
contributor porque o endpoint `/contributors` da API do GitHub considera apenas a
branch padrão, ignorando commits feitos em branches como `staging`.

Objetivo:
1. Redesenhar o dashboard com layout em grid moderno e seções bem definidas
2. Adicionar barra de stat cards com: Total de Commits, Branches ativas, PRs Abertos,
   PRs Fechados e Total de Contribuidores
3. Adicionar seção dedicada de Pull Requests (abertos e fechados) com badges de status
4. Corrigir a listagem de contributors para incluir todos os membros do repositório,
   independente da branch em que fizeram commits
5. Adicionar ranking de contributors com medalhas (🥇🥈🥉)
6. Melhorar UX com skeleton loaders, hover effects e responsividade
7. Mensagem de erro quando o total de acessos atingir o límite na dashboard

Correção do bug dos contributors:
- Causa: `/contributors` só contabiliza commits na branch padrão
- Solução: listar todas as branches, buscar commits de cada uma com paginação via
  header `Link`, agregar por `author.login` num `Map` e ordenar por total de commits

Requisitos:
- JavaScript puro, sem frameworks
- Separação clara de responsabilidades (funções para API, renderização, orquestração)
- Paginação tratada via `apiFetchAllPages()` com suporte ao header `Link` do GitHub
- Skeleton loaders durante o carregamento de todos os dados

Arquivos gerados/modificados: `dashboard/index.html`, `CHANGELOG.md`, `docs/prompts/Vitor.md`

---

## Prompt 9 — fix(dashboard): substituir varredura de branches por /stats/contributors e tratar rate limit
Autor: Vitor
Data: 2026-05-03

Contexto:
A correção anterior de contributors (varrer todas as branches + deduplicar por SHA) gerava
dois problemas novos:
1. Commits com `c.author === null` eram adicionados ao Set de SHAs vistos, impedindo que a
   mesma SHA fosse contada em outra branch onde o autor estivesse vinculado — zerando a
   contagem de alguns membros.
2. Múltiplas chamadas paralelas à API (uma por branch) esgotavam o rate limit de 60 req/hora
   da API pública do GitHub, retornando 403 e travando o dashboard inteiro via exceção no
   `Promise.all`.

Objetivo:
1. Substituir `fetchAllContributors` por chamada única ao endpoint `/stats/contributors`,
   que retorna contagem real de commits únicos por autor em todo o repositório sem risco
   de duplicatas e sem múltiplas chamadas
2. Tratar retorno 202 (GitHub calculando stats) com retry automático após 3s
3. Refatorar `fetchData` para usar `safeApiFetch` — wrapper que captura erros individualmente
   e retorna `null` em vez de lançar exceção, evitando que um 403 derrube todas as seções
4. Exibir banner de aviso amarelo quando rate limit for detectado

Arquivos gerados/modificados: `dashboard/index.html`, `CHANGELOG.md`, `docs/prompts/Vitor.md`

---

## Prompt 11 — feat(turn-system): TurnManager, Enemy entity, combate com 80% hit chance
Autor: Vitor
Data: 2026-05-04

Contexto:
O jogo possuía um sistema "turno-based" simulado via cooldown de 150ms em `GameScene.update()`,
usando `isDown` (input contínuo). Isso não é verdadeiramente turn-based: o jogo avançava em
tempo real com throttle, não esperando a ação do jogador.

Objetivo:
Implementar a Fase 2 do roguelike com arquitetura de turno real, seguindo o documento `fase_2.md`:
1. Criar `src/entities/Enemy.ts` — entidade pura sem Phaser (apenas dados e lógica de domínio)
2. Adicionar `attack(attacker, defender)` ao `CombatSystem` com 80% chance de acerto (miss ou hit)
3. Criar `src/systems/TurnManager.ts` — controla estado do turno, bloqueia input fora do turno do
   jogador, processa ação do player, executa turno de todos os inimigos, retorna resultados
4. Refatorar `src/scenes/GameScene.ts`:
   - Substituir `isDown` (contínuo) por `JustDown` (um keypress = um turno)
   - Remover `_tickEnemies()` e `_resolveCombat()` — lógica migrada para TurnManager
   - Adicionar tecla SPACE para ação WAIT (passa o turno)
   - Delegar todo fluxo de turno ao TurnManager

Tipo de Ação (Action):
```ts
type Action =
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'ATTACK'; target: EnemySystem }
  | { type: 'WAIT' }
```

Regras arquiteturais mantidas:
- TurnManager não importa Phaser diretamente
- Sistemas nunca importam cenas
- Feedback visual via EventBus (EVENTS.UI_LOG)

Arquivos gerados/modificados: `src/entities/Enemy.ts` (novo), `src/systems/TurnManager.ts` (novo),
`src/systems/CombatSystem.ts`, `src/scenes/GameScene.ts`, `docs/fase_2_plano.md` (novo)

---

## Prompt 10 — fix(dashboard): fallback para /contributors quando /stats/contributors falha
Autor: Vitor
Data: 2026-05-03

Contexto:
O endpoint `/stats/contributors` pode retornar erro (ex: repositório sem histórico calculado
ou rate limit) deixando o ranking de contributors vazio mesmo com o retry de 202.

Objetivo:
Adicionar fallback automático em `fetchAllContributors`: se `/stats/contributors` falhar
ou retornar dado inválido, a função tenta o endpoint simples `/contributors` como segunda
opção, garantindo que o ranking sempre exiba dados disponíveis.

Arquivos gerados/modificados: `dashboard/index.html`, `CHANGELOG.md`, `docs/prompts/Vitor.md`

---

## Prompt 12 — feat(inventory): sistema de inventário, itens e identificação roguelike (Fase 3)
Autor: Vitor
Data: 2026-05-05

Contexto:
O jogo possui o sistema de turnos real implementado (Fase 2). Preciso implementar a Fase 3
conforme o documento `fase_3.md`: inventário com slots, dois tipos de poção, sistema de
identificação roguelike clássico (itens com nomes desconhecidos até serem usados) e
integração visual na UIScene com action bar estilo Diablo.

Objetivo:
1. Criar `src/entities/Item.ts` com entidade pura: `id`, `type`, `identified`, `gridX/Y`, `getDisplayName()`
2. Criar `src/systems/InventorySystem.ts` com 20 slots, `addItem`, `removeItem`, `useItem`, `isFull`
3. Adicionar `player.inventory` e `player.identifiedItems` ao Player
4. Adicionar ação `USE_ITEM` ao `TurnManager` (consome turno)
5. Implementar coleta automática ao pisar sobre item em `GameScene._checkItemPickup()`
6. Adicionar action bar visual à `UIScene`: 9 slots com ícone colorido por tipo, acende ao coletar, apaga ao usar

Regras do sistema de identificação:
- Antes de usar: mostrar nome genérico ("Poção Vermelha" / "Poção Azul")
- Após usar qualquer item do tipo: revelar nome real para todos da partida
- Identificação em `player.identifiedItems: Record<string, boolean>` — resetado ao reiniciar

Bugs corrigidos no mesmo PR:
- `GameScene`: sprite de item destruído no próximo frame via `this.time.delayedCall(0, ...)` para
  corrigir "can't access property drawImage, this.data is null" no Canvas renderer do Phaser
- `EventBus`: `on/off` tornados genéricos (`on<T>`) para eliminar erros de tipo nos handlers tipados da UIScene
- `index.html` + `main.ts`: fullscreen responsivo com `#game-container { width: 100vw; height: 100vh }`

Arquivos gerados/modificados: `src/entities/Item.ts` (novo), `src/systems/InventorySystem.ts` (novo),
`src/entities/Player.ts`, `src/systems/TurnManager.ts`, `src/scenes/GameScene.ts`,
`src/scenes/UIScene.ts`, `src/utils/EventBus.ts`, `src/utils/constants.ts`,
`index.html`, `src/main.ts`

---

## Prompt 13 — feat(sprites): integração do tileset Dawnlike com sprites reais e LootSystem
Autor: Vitor
Data: 2026-05-06

Contexto:
O jogo usava retângulos coloridos para representar itens no mapa e na action bar da UIScene.
Os spritesheets Dawnlike estavam carregados mas não utilizados para itens.
Inimigos mortos não dropavam loot.

Objetivo:
1. Substituir retângulos de itens por sprites reais do Dawnlike (`Items/Potion.png`, `Items/Money.png`)
2. Carregar `Potion.png` e `Money.png` no `BootScene.preload()`
3. Adicionar tipo `gold` ao `ItemType` com visual em `Money.png` frame 0
4. Criar `LootSystem` (novo sistema) com tabela de drop: 40% nada, 30% heal, 20% poison, 10% gold
5. Wiring: morte de inimigo → `lootSystem.roll()` → `ITEM_DROPPED` → sprite no mapa
6. Action bar da UIScene: trocar `Rectangle` por `Sprite` real, mapeado por `_getItemVisual()`
7. Sprites são estáticos (sem animação de frame swap)

Frames inspecionados em Potion.png (32 colunas × 16px):
- Frame 0 = poção vermelha (heal)
- Frame 7 = poção azul (poison)
- Money.png frame 0 = moeda de ouro (pixels amarelos confirmados)

Arquivos gerados/modificados: `src/systems/LootSystem.ts` (novo), `src/entities/Item.ts`,
`src/utils/constants.ts`, `src/scenes/BootScene.ts`, `src/scenes/GameScene.ts`,
`src/scenes/UIScene.ts`, `.kiro/specs/loot.spec.md` (novo), `.kiro/specs/sprites.spec.md` (novo)

---

## Prompt 14 — feat(world): sistema de mundo persistente (town + dungeon) e correções de UI
Autor: Vitor
Data: 2026-05-06

Contexto:
O jogo iniciava diretamente na dungeon sem hub. Não havia persistência de estado entre
transições de área. A action bar mostrava retângulo colorido em vez de sprite real (bug
introduzido na migração para Sprite sem atualizar o handler `_onItemPickedUp`).

Objetivo:
1. Implementar `TownMap` (subclasse de `DungeonGenerator`, mapa 24×20 fixo) como hub seguro
2. Implementar `WorldSystem` (singleton): `saveDungeon`, `loadDungeon`, `hasDungeon`, `clearDungeon`
3. GameScene inicia na cidade; player pisa em tile (12,18) → entra na dungeon
4. Ao retornar ao startPos da dungeon com `_canExitDungeon = true` → salva estado e volta à cidade
5. Dungeon persiste entre visitas (mesmo grid, mesmos itens no chão); inimigos SEMPRE respawnam
6. `_canExitDungeon` começa `false` ao entrar na dungeon; torna-se `true` após mover do startPos
7. Player (HP, inventário, XP) persiste entre áreas — GameScene nunca reinicia
8. Corrigir bug da action bar: `slot.icon.setTexture(texture, frame)` em vez de `setFillStyle`

Arquitetura de transição:
- `_loadArea('town' | 'dungeon')` → `_cleanup()` + recria tiles/entidades
- `_tileObjects` e `_decorObjects` rastreados para destruição no cleanup
- `_handleItemDropped` como arrow function estável (referência para `EventBus.off` em `shutdown()`)
- `EVENTS.AREA_CHANGED` emitido para futura integração com UIScene

Arquivos gerados/modificados: `src/systems/WorldSystem.ts` (novo), `src/scenes/GameScene.ts`,
`src/scenes/UIScene.ts`, `src/utils/constants.ts`, `.kiro/specs/world.spec.md` (novo),
`.kiro/specs/gameloop.spec.md`, `.kiro/specs/input.spec.md`, `.kiro/steering/game-steering.md`

---

## Prompt 15 — feat: melhorias gerais e adaptação roguelike (múltiplos andares, inventário visual, log panel, correção de escadas)
Autor: Vitor
Data: 2026-05-07

Contexto:
O jogo possuía transição de área funcional (cidade ↔ dungeon) mas apenas um único andar de dungeon,
sem sistema de escadas funcional, sem painel de log dedicado e com a action bar fundida visualmente
ao fundo do log.

Objetivo:
Implementar quatro melhorias estruturais de acordo com restrições arquiteturais definidas (R1–R15):

1. **Correção do spawn de retorno à cidade** — player nasce próximo à saída da dungeon, não no centro da cidade
2. **Log panel dedicado** — LogPanel em Container próprio, ocupando 1/3 esquerdo da tela estilo console RPG
3. **Múltiplos andares de dungeon** — DungeonFloorManager com cache por andar, DifficultyScalingSystem com tabela de dados, DungeonFeatureGenerator com escadas (stairUp/stairDown) em salas diferentes
4. **Tela de inventário visual** — InventoryPanel com 6 slots de equipamento (capacete, escudo, espada, calça, botas, amuleto) via EquipmentSystem

Restrições arquiteturais aplicadas:
- GameScene só executa — MapTransitionSystem resolve lógica de transição
- Sem singletons excessivos — sistemas instanciados como campos da cena
- DungeonFloorState apenas serializado — sem lógica
- Dificuldade data-driven via FLOOR_DIFFICULTY_TABLE
- UIScene recebe apenas ViewModels (nunca sistemas diretamente)
- EquipmentSystem armazena IDs, não itens
- Container raiz único com dirty flags por painel
- InputModeManager centralizado (GAMEPLAY | INVENTORY | MODAL | DEBUG)
- LogSystem desacoplado do LogPanel via ViewModel
- Payloads padronizados no EventBus com timestamp
- Scaling de inimigos apenas no spawn

Problemas adicionais corrigidos (UX):
- Action bar visualmente separada do log: novo ActionBarPanel com Container próprio, 36px de altura, fundo distinto
- LogPanel.layout() recebe reservedBottomHeight para não cobrir a hotbar
- Sistema de escadas corrigido: stairUp e stairDown sempre em salas diferentes, distância mínima de 5 tiles
- Spawn ao descer: player nasce no stairUp do andar destino (não em startPos)
- Spawn ao subir: player nasce no stairDown do andar anterior
- Retorno à cidade via stairUp explícito (targetFloor = 'town') — sem heurística de startPos
- tests/enemy.test.js atualizado para nova assinatura de createEnemies(dungeon, playerPos, difficulty?)

Arquivos gerados/modificados:
- `src/types/dungeon.ts` — StairConnection, FloorConnectionData
- `src/types/equipment.ts` — EquipmentSlotId, EQUIPMENT_SLOT_ORDER, EQUIPMENT_SLOT_LABELS
- `src/types/input.ts` — InputMode
- `src/types/transitions.ts` — SpawnPoint, TransitionPoint, TransitionResolution
- `src/types/viewmodels.ts` — LogViewModel, InventoryViewModel
- `src/config/difficulty.config.ts` — FLOOR_DIFFICULTY_TABLE, getFloorDifficulty()
- `src/generators/DungeonFeatureGenerator.ts` — geração de stairUp/stairDown com distância mínima
- `src/systems/InputModeManager.ts` — máquina de estados de input
- `src/systems/LogSystem.ts` — buffer de log desacoplado do painel
- `src/systems/MapTransitionSystem.ts` — SpawnPoints e TransitionPoints registráveis
- `src/systems/DungeonFloorManager.ts` — cache de andares, saveFloorConnections/getFloorConnections
- `src/systems/DifficultyScalingSystem.ts` — scaling data-driven
- `src/systems/EquipmentSystem.ts` — equipamento por ID de item
- `src/ui/LogPanel.ts` — Container próprio, dirty flag, pool de texto, reservedBottomHeight
- `src/ui/InventoryPanel.ts` — grid de inventário + slots de equipamento
- `src/ui/ActionBarPanel.ts` (novo) — hotbar compacta visualmente separada
- `src/scenes/UIScene.ts` — refatorado para ViewModels, compõe ActionBarPanel + LogPanel
- `src/scenes/GameScene.ts` — _loadDungeonFloor com spawn posicional, _checkAreaTransition via features
- `src/systems/EnemySystem.ts` — createEnemies com nova assinatura (playerPos, difficulty?)
- `tests/enemy.test.js` — atualizado para nova API de createEnemies

---

## Prompt 16 — feat(commerce): sistema de comércio, equipamentos com bônus e loja do mercador
Autor: Vitor
Data: 2026-05-08

Contexto:
O jogo possuía inventário visual e slots de equipamento, mas sem lógica de comércio, sem itens
equipáveis com stats e sem interação funcional com o Mercador da cidade.

Objetivo:
Implementar o sistema completo de comércio e equipamentos seguindo arquitetura EventBus/UIScene/GameScene:

1. Itens equipáveis com bônus de stat (`StatBonuses`: attack, maxHp, con, str, dex)
2. `Player.applyEquipmentBonuses()` / `removeEquipmentBonuses()` — bônus reversíveis acumulados em `_equipmentBonuses`; `recalcStats()` como fonte de verdade (nunca muta stats base)
3. `shop.catalog.ts` — 18 itens (3 por slot + poções); `createItemFromCatalogEntry()` e `buildBonusText()`
4. `ShopSystem` — `buyItem()`, `sellItem()`, `buildViewModel()`, `buildSellItems()` sem acoplamento à UI
5. `ShopPanel` — 2 abas (Comprar / Vender); mouse hover + click; pool de 20 linhas; detalhes de raridade/bônus/preço
6. `EquipmentSystem` integrado ao inventário: `E` equipa item selecionado, stats atualizados em tempo real
7. Gold no HUD (começa com 500); `PLAYER_GOLD_CHANGED` atualiza label em tempo real
8. Loja do Mercador: `InteractiveObjectSystem` emite `SHOP_OPENED` ao interagir (dentro de `houseBounds`); `GameScene` empilha modo SHOP via `InputModeManager`
9. `InputModeManager` estendido com modo SHOP

Restrições arquiteturais aplicadas:
- `ShopSystem` nunca emite `SHOP_UPDATED` — `GameScene._emitShopState()` constrói ViewModel completo
- Bônus reversíveis: `removeEquipmentBonuses()` subtrai; `recalcStats()` recalcula do zero
- `EquipmentSystem` armazena IDs; `InventorySystem` é dono dos objetos
- Comunicação UIScene ↔ GameScene exclusivamente via EventBus

Testes gerados:
- `tests/shop.test.js` — 17 testes: `createItemFromCatalogEntry`, `buildBonusText`, `ShopSystem.buyItem()` (3 cenários), `ShopSystem.sellItem()` (3 cenários), bônus de equipamento (5 cenários), `buildViewModel` (2 cenários)

Arquivos gerados/modificados:
- `src/config/shop.catalog.ts` (novo)
- `src/types/equipment.ts` — StatBonuses, novos EquippableItemTypes
- `src/types/viewmodels.ts` — ShopItemViewModel, ShopViewModel
- `src/types/town.ts` — houseBounds, interaction type 'shop'
- `src/types/input.ts` — adicionado 'SHOP' ao InputMode
- `src/entities/Item.ts` — slotId?, bonuses?, price?, rarity?, name?
- `src/entities/Player.ts` — gold, _equipmentBonuses, recalcStats(), applyEquipmentBonuses(), removeEquipmentBonuses()
- `src/systems/ShopSystem.ts` (novo)
- `src/systems/InteractiveObjectSystem.ts` — houseBounds, SHOP_OPENED
- `src/systems/NPCController.ts` — getAllNPCs()
- `src/config/town.config.ts` — Mercador com shop interaction e houseBounds
- `src/generators/CityLayoutProcessor.ts` — pass-through de houseBounds/interaction
- `src/scenes/GameScene.ts` — _handleShopInput(), _equipSelectedItem(), _emitShopState(), SHOP_OPENED listener
- `src/scenes/UIScene.ts` — ShopPanel, _goldLabel, SHOP_OPENED/UPDATED/CLOSED handlers
- `src/ui/ShopPanel.ts` (novo)
- `src/utils/constants.ts` — SHOP_OPENED, SHOP_CLOSED, SHOP_UPDATED, PLAYER_GOLD_CHANGED, INVENTORY_SELECTION_CHANGED, SHOP constant
- `tests/shop.test.js` (novo)

---

## Prompt 17 — feat(city): evolução cidade/NPCs/comércio — abas loja, diálogos, gato vagante, fix log
Autor: Vitor
Data: 2026-05-08

Contexto:
Após o sistema de comércio básico, necessidade de evoluir a cidade com mais interatividade:
loja com abas de compra e venda, sistema de diálogo genérico para NPCs, gato vagante
pela cidade e correção de sobreposição de mensagens longas no log.

Objetivo:
1. **Fix crash `vm.items undefined`**: `ShopSystem.buyItem/sellItem` emitiam `SHOP_UPDATED: {}` vazio — removidos; `GameScene._emitShopState()` sempre constrói ViewModel completo
2. **Enter key compra** na loja (além de E); **V key vende** (separado de U para uso de item)
3. **Duas abas na loja** — Comprar (catálogo) / Vender (inventário filtrado); `←→` troca aba; `ShopViewModel` estendido com `tab`, `buyItems`, `sellItems`, `SellItemViewModel`
4. **Mouse na loja** — `setInteractive()` em cada item, `SHOP_ITEM_HOVERED` / `SHOP_ITEM_SELECTED` via EventBus; `GameScene` ouve e atualiza seleção
5. **Fix foco de teclado** — `BLUR`/`FOCUS` do jogo chamam `keyboard.resetKeys()` — previne teclas "presas" após alt+tab
6. **Gato vagante** — posição corrigida de (4,13) para (3,9); `customWanderBounds` em `TownNPCDef`; `NPCController.update()` FSM reativado
7. **`DialogPanel`** (novo) — painel genérico com lista de opções e área de conteúdo; mouse `pointerdown` seleciona; `[↑↓ Enter/E ESC]`
8. **Guarda** — `interaction.type: 'menu'` com 4 opções informativas (objetivos, como jogar, controles, dicas)
9. **Taberneiro** (renomeado de Estalajadeiro) — `type: 'menu'`; "Repousar (20 ouros)" restaura HP+Mana; `TAVERN.REST_COST = 20`
10. **Fix log multiline** — `LogPanel.render()` reescrito bottom-up usando `text.height` real após `setText()`

Arquivos gerados/modificados:
- `src/utils/constants.ts` — SHOP_ITEM_HOVERED, SHOP_ITEM_SELECTED, DIALOG_OPENED, DIALOG_CLOSED, DIALOG_OPTION_SELECTED, TAVERN
- `src/types/viewmodels.ts` — SellItemViewModel, ShopViewModel com tab/buyItems/sellItems
- `src/types/town.ts` — interaction type 'menu', menuOptions, DialogMenuOption
- `src/types/input.ts` — adicionado 'DIALOG'
- `src/config/town.config.ts` — cat fix (3,9), Taberneiro rename, Guard menu, Taberneiro menu, customWanderBounds
- `src/systems/ShopSystem.ts` — removidos emits vazios, buildSellItems()
- `src/generators/CityLayoutProcessor.ts` — customWanderBounds support
- `src/systems/InteractiveObjectSystem.ts` — type 'menu' → DIALOG_OPENED
- `src/systems/NPCController.ts` — wander FSM reativado
- `src/scenes/GameScene.ts` — enterKey, vKey, _shopTab, _handleDialogInput(), _emitShopState() atualizado, DIALOG_OPENED/SHOP_ITEM_SELECTED listeners, focus fix
- `src/ui/LogPanel.ts` — renderização bottom-up dinâmica
- `src/ui/ShopPanel.ts` — abas buy/sell, mouse interativo
- `src/ui/DialogPanel.ts` (novo)
- `src/scenes/UIScene.ts` — DialogPanel integrado, novos listeners

---

## Prompt 18 — fix(ui): inventário fantasma, input travado, desequipar e ações corretas por item
Autor: Vitor
Data: 2026-05-08

Contexto:
Após as implementações de comércio, o inventário abria automaticamente ao comprar um item
na loja. Com o inventário visível e o GameScene em modo GAMEPLAY, os direcionais moviam o
personagem em vez de navegar o inventário, tornando-o inutilizável.

Causa raiz identificada:
`UIScene.INVENTORY_STATE_RESPONSE` chamava `_inventoryPanel.show()` incondicionalmente.
`GameScene._handleShopInput()` chamava `_emitInventoryState()` após compra/venda, disparando
o evento acima enquanto o modo ainda era SHOP. Resultado: inventário aberto + modo GAMEPLAY
após ESC fechar a loja.

Correções implementadas:

1. **Fix crítico — separar show de update (UIScene)**:
   - `INVENTORY_OPENED` é o único evento autorizado a chamar `_inventoryPanel.show()`
   - `INVENTORY_STATE_RESPONSE` apenas atualiza dados e chama `markDirty()` se o painel já estiver visível

2. **Fix crítico — remover `_emitInventoryState()` das operações de loja (GameScene)**:
   - `_handleShopInput()` não emite mais estado de inventário após compra/venda
   - Inventário sempre atualizado quando aberto via `I` (que chama `_emitInventoryState()` diretamente)

3. **Fix de stack — usar `pop()` no fechamento de modos (GameScene)**:
   - ESC em INVENTORY e SHOP agora usa `inputMode.pop()` em vez de `inputMode.set('GAMEPLAY')`
   - Stack do `InputModeManager` limpa corretamente

4. **Desequipar (GameScene)**:
   - `E` em item já equipado agora o desequipa (toggle)
   - Novo método `_unequipSelectedItem()`: chama `equipmentSystem.unequip()`, `player.removeEquipmentBonuses()`, emite `PLAYER_HP_CHANGED`

5. **Ações corretas por tipo de item (UIScene + InventoryPanel)**:
   - `_buildInventoryViewModel()` detecta `item.slotId` e passa `hasSlot` para o ViewModel
   - Painel de detalhes exibe `[E] Equipar` para não equipados, `[E] Desequipar` para equipados, `[U] Usar` / `[D] Dropar` para consumíveis
   - `InventoryDetailViewModel.actions` estendido com `'unequip'`

Fluxo correto pós-fix:
Comprar item → inventário NÃO abre → ESC fecha loja → GAMEPLAY → I abre inventário →
E equipa/desequipa → ESC fecha inventário → player pode mover

Arquivos gerados/modificados:
- `src/scenes/UIScene.ts` — Fix 1 e Fix 5
- `src/scenes/GameScene.ts` — Fix 2, Fix 3, Fix 4
- `src/types/viewmodels.ts` — InventoryDetailViewModel com 'unequip'
- `src/ui/InventoryPanel.ts` — actionMap com '[E] Desequipar'

## Prompt 19
Autor: Vitor
Data: 2026-05-09

Contexto:
O mapa da cidade (Town.tmx) apresentava tiles problemáticos: animais estáticos visíveis, fundos escuros, árvores com quadrados pretos, e tiles sem colisão correta. Precisávamos de uma forma rápida de corrigir esses problemas sem alterar o renderer.

Objetivo:
Implementar um sistema de override por coordenada que permita ajustes manuais rápidos no mapa, com aliases de GID amigáveis e modo debug visual.

Tarefas:
1. Criar `TILE_GID` em `TileProperties.ts` com ~70 aliases de TMX GID organizados por tileset
2. Criar `MANUAL_MAP_OVERRIDES` com suporte a `forceGid`, `forceGidLike`, `overlayGid` e `walkable`
3. Implementar `DEBUG_SHOW_COORDINATES` no renderer com textos estáticos por tile e label interativo ao clicar
4. Corrigir frames pretos do Tree0.png (frames 0–47 vazios, árvores visíveis a partir do frame 48)
5. Corrigir GIDs incorretos no `TILE_GID` (frame index vs TMX GID real)

Arquivos a modificar:
- `src/config/TileProperties.ts` — TILE_GID, MANUAL_MAP_OVERRIDES
- `src/systems/TownTMXRenderer.ts` — DEBUG_SHOW_COORDINATES, lógica de override, fix árvores
- `docs/guia-sprites.md` — seção "Override Manual por Coordenada"

## Prompt 20
Autor: Vitor
Data: 2026-05-09

Contexto:
A área de padding (fundo escuro com flores) fora dos limites do TMX (20×15) não exibia coordenadas de debug nem permitia uso de MANUAL_MAP_OVERRIDES. O renderer só processava as 300 células do TMX, ignorando as 450 células de padding que completam o mapa 30×25.

Objetivo:
Expandir o loop de grama de preenchimento para suportar MANUAL_MAP_OVERRIDES e DEBUG_SHOW_COORDINATES em todas as 750 células (30×25), incluindo as de padding com coordenadas negativas.

Tarefas:
1. Refatorar o loop de grama em TownTMXRenderer.ts para verificar MANUAL_MAP_OVERRIDES por coordenada (incluindo chaves negativas como "-5,-3")
2. Renderizar tile customizado via forceGid quando override presente; grama padrão caso contrário
3. Exibir DEBUG_SHOW_COORDINATES em todas as células de padding
4. Respeitar walkable: false nos overrides de padding (padrão é walkable)

Arquivos a modificar:
- `src/systems/TownTMXRenderer.ts` — loop de grama expandido com override e debug

## Prompt 21
Autor: Vitor
Data: 2026-05-09

Contexto:
O modo DEBUG_SHOW_COORDINATES exibia coordenadas nos tiles mas não havia feedback ao clicar sobre qual GID correspondia ao tile clicado, dificultando o preenchimento de MANUAL_MAP_OVERRIDES. Além disso, overlayGid não funcionava em coordenadas fora dos limites TMX (padding) e o spritesheet Decor0.png não era carregado.

Objetivo:
Melhorar o ferramental de debug de tiles para facilitar a identificação e configuração de overrides no mapa da cidade.

Tarefas:
1. Adicionar console.log ao clicar num tile com coordenadas TMX, world, forceGid das layers Tiles e Sprites, e override atual
2. Corrigir cálculo de coordenadas do clique usando pointer.worldX/worldY em vez de cálculo manual incorreto
3. Adicionar botão toggle "[ coords: ON/OFF ]" na UIScene para mostrar/esconder os labels de coordenada dinamicamente sem interromper o console.log
4. Expandir o log para tiles fora dos limites TMX: detectar grama procedural, borda de caminho ou override de padding
5. Corrigir overlayGid para funcionar também no loop de padding (coordenadas negativas como "-1,8")
6. Adicionar carregamento do spritesheet Decor0.png no BootScene (estava ausente, impedindo renderização de GIDs 2136–2311)

Arquivos a modificar:
- `src/systems/TownTMXRenderer.ts` — console.log de clique, botão toggle, overlayGid no loop de padding
- `src/scenes/BootScene.ts` — carregamento de decor0
- `src/config/TileProperties.ts` — ajustes de overrides

## Prompt 22 — feat(city): entrarDungeon data-driven, melhorias de debug e limpeza de NPCs
Autor: Vitor
Data: 2026-05-10

Contexto:
A entrada para a dungeon era definida por um array hardcoded `TOWN_DUNGEON_EXITS` em constants.ts.
NPCs residuais (Ajudante, sprite de player no TMX, Viajante) apareciam em posições erradas.
O debug de clique usava fórmula manual incorreta para converter coordenadas de tela em mundo.
NPCs com wanderBounds não respondiam ao [T] porque getAllNPCs() retornava posições de spawn originais.

Objetivo:
1. Substituir `TOWN_DUNGEON_EXITS` por campo `entrarDungeon: boolean` em `MANUAL_MAP_OVERRIDES`
2. Corrigir fórmula do debug de clique para usar `camera.getWorldPoint()`
3. Exibir conversão `game(x,y)` no output do debug de clique
4. Remover NPCs residuais: Ajudante (TMX 16,5), Viajante (TMX 18,14), sprite estático (TMX 13,13)
5. Corrigir `getAllNPCs()` para retornar posição atual dos NPCs (não posição de spawn)
6. Adicionar suporte a `interaction` em `TileOverride` para sprites estáticos interativos (placas)
7. Corrigir `TOWN.BONUS_ENTRY_Y` de 10 para 0 (game(12,0) = TMX(7,-5))
8. `TMX_REMOVED_POSITIONS` expandido para cobrir sprites estáticos (não só NPCs)
9. Estalajadeiro com `interactRange: 2` para interação do balcão

Tarefas:
1. Remover `TOWN_DUNGEON_EXITS` de constants.ts; adicionar `entrarDungeon?` ao `TileOverride`
2. Em `GameScene._loadTown()`: escanear `MANUAL_MAP_OVERRIDES` por `entrarDungeon:true`, computar game coords, registrar spawn de retorno dinamicamente
3. Em `GameScene._checkAreaTransition()`: usar `_dungeonEntryTiles` em vez de array hardcoded
4. Em `TownTMXRenderer`: não sobrepor tile com `forceGid` no pit0; mover check de `TMX_REMOVED_POSITIONS` para antes de todo rendering de sprite
5. Em `TownTMXRenderer`: substituir fórmula do clique por `cam.getWorldPoint()`; exibir `→ game(x,y)` no debug
6. Em `NPCController.getAllNPCs()`: retornar `{...n.def, gridX: n.gridX, gridY: n.gridY}` com posição atual
7. Em `TileOverride`: adicionar `npcName?` e `interaction?`; sprites com interaction viram sign NPCs no renderer
8. Em `TownTMXData`: remover Ajudante e Viajante via `TMX_REMOVED_POSITIONS`; restringir guardas com `wanderBounds` a `maxX:16, maxY:17`

Arquivos a modificar:
- `src/utils/constants.ts` — remover TOWN_DUNGEON_EXITS, TOWN.BONUS_ENTRY_Y = 0
- `src/config/TileProperties.ts` — TileOverride com entrarDungeon, npcName, interaction; MANUAL_MAP_OVERRIDES com placa
- `src/config/TownTMXData.ts` — TMX_REMOVED_POSITIONS expandido, overrides de NPC atualizados
- `src/scenes/GameScene.ts` — _dungeonEntryTiles, scan de entrarDungeon, pit0 condicional
- `src/systems/TownTMXRenderer.ts` — getWorldPoint, game() no debug, TMX_REMOVED_POSITIONS antes do rendering, sign NPC
- `src/systems/NPCController.ts` — getAllNPCs() com posição atual

---

## Prompt 23

Contexto:
Após o commit das melhorias no cenário da cidade, atualizar a documentação interna do projeto.

Objetivo:
1. Atualizar `.kiro/specs/world.spec.md` com pipeline data-driven, NPCs com posições/ranges corretos e transição via `_dungeonEntryTiles`
2. Atualizar `.kiro/specs/product.md` com placa interativa, `entrarDungeon` data-driven, `interactRange` e debug
3. Atualizar `.kiro/steering/game-steering.md` com 5 novas restrições arquiteturais

Tarefas:
1. Em `world.spec.md`: substituir pipeline por `TownTMXRenderer + MANUAL_MAP_OVERRIDES`; atualizar NPCs com posições TMX, `interactRange` e comportamento corretos; documentar transição cidade→dungeon via `_dungeonEntryTiles`
2. Em `product.md`: atualizar seções Cidade e NPCs — placa, `entrarDungeon`, `interactRange`, debug de tiles
3. Em `game-steering.md`: adicionar restrições para `interactRange`, objetos estáticos interativos, entradas data-driven, `TMX_REMOVED_POSITIONS` e `getAllNPCs()`

Arquivos a modificar:
- `.kiro/specs/world.spec.md` — pipeline, NPCs, transição data-driven
- `.kiro/specs/product.md` — seções Cidade e NPCs
- `.kiro/steering/game-steering.md` — novas restrições arquiteturais

---

## Prompt 24

Contexto:
Área bônus (acessível em game(12,0)) era um mapa pequeno 15×10 sem debug. O sistema de debug de clique (coords, toggle, console.log) só existia na cidade.

Objetivo:
1. Expandir área bônus para preencher a tela inteira (≥25×19 tiles com zoom=2)
2. Criar config isolada `BonusAreaData.ts` com `BONUS_AREA_OVERRIDES` separado de `MANUAL_MAP_OVERRIDES`
3. Criar `BonusAreaRenderer` com debug idêntico ao `TownTMXRenderer` (labels, toggle, clique → console)
4. Corrigir condição de saída da área bônus (estava hardcoded em `gridY >= 9`)

Tarefas:
1. Criar `src/config/BonusAreaData.ts`: `BONUS_W=30`, `BONUS_H=22`, `BONUS_AREA_OVERRIDES`, `BONUS_AREA_NPCS`
2. Criar `src/systems/BonusAreaRenderer.ts`: renderizar chão com suporte a `forceGid`, labels de coord, toggle ON/OFF, clique exibe `[DEBUG bonus] (x,y)` e override atual
3. Reescrever `GameScene._loadBonusArea()` para delegar ao `BonusAreaRenderer` (igual ao `_loadTown` com `TownTMXRenderer`)
4. Corrigir condição de saída: `gridY >= 9` → `gridY >= BONUS_H - 1`

Arquivos a criar:
- `src/config/BonusAreaData.ts` — config isolada da área bônus
- `src/systems/BonusAreaRenderer.ts` — renderer com debug completo

Arquivos a modificar:
- `src/scenes/GameScene.ts` — `_loadBonusArea()` reescrito, import de `BonusAreaRenderer`, condição de saída corrigida

---

## Prompt 25

Contexto:
Limpeza de arquivos de documentação obsoletos da raiz do repositório.

Objetivo:
Remover `KIRO_RESUMO.md`, `IMPLEMENTATION_SUMMARY.md`, `fase_3.md` e `fase_5.md` — conteúdo já migrado para `.kiro/` e `docs/`.

Tarefas:
1. Deletar e fazer stage para remoção dos arquivos obsoletos
2. Atualizar CHANGELOG.md e Vitor.md para o commit passar

Arquivos a modificar:
- `KIRO_RESUMO.md` — remover
- `IMPLEMENTATION_SUMMARY.md` — remover
- `fase_3.md` — remover
- `fase_5.md` — remover

---

## Prompt 26 — feat(dungeon): autotiling semântico por tema de andar

Contexto:
A renderização de dungeon usava seleção de frames por hash simples (sem contexto espacial) com lógica embutida diretamente no loop da GameScene. Um único tema visual era aplicado a todos os andares.

Objetivo:
1. Introduzir arquitetura de semantic rendering com separação estrita de camadas
2. Implementar autotiling de 4 vizinhos com cantos externos/côncavos e corpo sólido
3. Temas visuais distintos por faixa de andares (dungeon/mine/underworld/boss)
4. Preparar extensão futura (water, lava, chasm) sem alterar renderer

Tarefas:
1. Reestruturar `dungeon-themes.ts`: `TileCategory`, `AutoTileSet` (face, cornerOuter_TL/TR, bodyFrames, cornerInner_TL/TR), `DungeonTheme` com `autoTileSets`; 4 temas com frames corretos de Wall.png e Floor.png
2. Criar `AutoTileResolver`: interpretar vizinhos cardinais, resolver `TileRenderData`; sem objetos Phaser
3. Criar `DungeonRenderer`: iterar grid, delegar ao resolver, emitir `RenderCommand[]`
4. Em `GameScene._loadDungeonFloor()`: substituir loop inline por `DungeonRenderer.buildCommands()`; remover imports de `pickFloorFrame`/`pickWallFrame`

Arquivos a criar:
- `src/systems/AutoTileResolver.ts`
- `src/systems/DungeonRenderer.ts`

Arquivos a modificar:
- `src/config/dungeon-themes.ts` — reescrever com AutoTileSet e 4 temas
- `src/scenes/GameScene.ts` — delegação ao DungeonRenderer, `width: W, height: H` restaurados

---

## Prompt 27 — fix(dungeon): sprite de poção não desaparecia ao coletar; feat(dev): godMode

Contexto:
Ao coletar uma poção na dungeon, o sprite permanecia visível no mapa. Além disso, foi solicitado um modo de desenvolvimento onde o player não toma dano.

Objetivo:
1. Corrigir sprite de item não desaparecendo ao coletar
2. Adicionar flag `godMode` em configuração de desenvolvimento

Tarefas:
1. Em `_checkItemPickup()`: substituir `delayedCall(0, s.destroy)` por `item.sprite?.destroy()` imediato
2. No loop de recriação de sprites em `_loadDungeonFloor()`: adicionar `item.sprite?.destroy()` antes de criar novo sprite
3. Em `constants.ts`: adicionar `DEV_CONFIG = { godMode: false }` ao final do arquivo
4. Em `CombatSystem`: importar `DEV_CONFIG`; condicionar dano ao player a `!DEV_CONFIG.godMode`

Arquivos a modificar:
- `src/scenes/GameScene.ts` — destroy imediato, destroy antes de recriar
- `src/utils/constants.ts` — DEV_CONFIG
- `src/systems/CombatSystem.ts` — godMode check

---

## Prompt 28 — docs: atualização pós-v0.5.2

Contexto:
Após implementação do autotiling semântico, godMode e correções de bugs, atualizar toda a documentação.

Objetivo:
Manter documentação sincronizada com o estado atual do código.

Tarefas:
1. Em `CHANGELOG.md`: adicionar nova seção `[0.5.2]` com Added, Fixed e Changed
2. Em `docs/guia-sprites.md`: reescrever seção de dungeon para API de autotiling; atualizar tabela resumo
3. Em `docs/PRD.md`: atualizar para versão 0.5.2, status e seção dungeon com múltiplos andares/temas, expandir escopo
4. Em `.kiro/steering/game-steering.md`: atualizar estrutura de pastas e adicionar 6 novas restrições arquiteturais
5. Em `.kiro/specs/product.md`: atualizar tabela de sistemas e seção Dungeon; documentar área bônus
6. Em `.kiro/specs/world.spec.md`: expandir tabela de áreas e transições com área bônus e múltiplos andares

Arquivos a modificar:
- `CHANGELOG.md`
- `docs/guia-sprites.md`
- `docs/PRD.md`
- `.kiro/steering/game-steering.md`
- `.kiro/specs/product.md`
- `.kiro/specs/world.spec.md`

---

## Prompt 29 — feat(render): Shell-not-Volume Wall System com 8-bit Bitmask Autotiling (v0.5.3)
Autor: Vitor
Data: 2026-05-11

Contexto:
O renderer atual (v0.5.2) tratava toda a massa de parede como volume sólido — body tiles variados em toda área inacessível. Isso gerava ruído visual, quebrando a leitura espacial e não distinguindo "parede que importa" (adjacente ao piso) de "fundo profundo" (inacessível). O objetivo foi migrar para o estilo visual de roguelikes modernos (Caves of Qud, Stoneshard, Soulash): espaço esculpido dentro da escuridão, não massa texturizada de paredes.

Objetivo:
Implementar o sistema Shell-not-Volume completo com bitmask 8-bit canônico, mantendo arquitetura pura e todas as garantias arquiteturais existentes.

Requisitos principais submetidos ao agente:
- Parede é casca, não volume: apenas tiles adjacentes ao piso recebem sprite; interior vira VOID (preto)
- SemanticClassifier usando 4 vizinhos cardinais para shell (não diagonais) — espessura exata de 1 tile
- Bitmask de 8 vizinhos com sanitizeMask() que fecha diagonais sem suporte cardinal
- LUT canônica com classifyVariant() pura (sem chain de overwrites) — determinístico e debuggável
- TileSemanticsProvider desacoplando isVisuallyOpen de isWalkable (extensível para water/lava)
- Variação de body walls = 1 frame fixo (silhouette first, não detalhe)
- Retrocompatibilidade: fallback legado para temas sem bitmaskFrames
- Ferramental dev: DebugOverlayRenderer (semantic/variant/bitmask), MaskFrequencyLogger, VisualRegressionScene
- Filosofia: validação visual iterativa > completude teórica; quando em dúvida, remover variação

Decisões técnicas:
- LUT não pode ser chain de set() com overwrites — deve ser classifyVariant() pura
- Diagonais sem cardinais de suporte devem ser sanitizadas (fechadas)
- WALL_EDGE deve ter espessura de exatamente 1 tile (cardinais apenas para classificação)
- Silhueta tem prioridade sobre correção local de autotiling
- VOID deve cobrir fundo com cor sólida (setBackgroundColor), nunca transparente
- Variantes raras (PILLAR, CROSS) colapsadas em equivalentes visuais sem sprite dedicado
- MaskFrequencyLogger para diagnóstico de distribuição de masks em runtime
- VisualRegressionScene determinística para screenshot comparison após mudanças

Tarefas:
1. Criar `TileSemanticsProvider.ts`: interface TileSemantics, tabela extensível, getTileSemantics()
2. Criar `SemanticClassifier.ts`: classifyGrid() com 4 vizinhos cardinais, SemanticValue enum, SemanticGrid type
3. Criar `WallVariantLUT.ts`: BIT constants, sanitizeMask(), WallVariant enum (7 variantes), classifyVariant() pura, buildWallVariantLUT(), computeRawMask()
4. Modificar `dungeon-themes.ts`: estender TileCategory com wall_edge/void/string; adicionar BitmaskFrameSet interface; incluir AutoTileSet com bitmaskFrames?/voidFrame?; wall_edge + bitmaskFrames para todos os 4 temas; body = 1 frame por tema
5. Modificar `AutoTileResolver.ts`: nova assinatura resolve(grid, sem, ...); resolveCategory usa SemanticGrid; branch wall_edge com bitmask; preservar fallback legado; adicionar _computeRawMask, _frameForVariant
6. Modificar `DungeonRenderer.ts`: integrar classifyGrid(); skip VOID sem RenderCommand; passar sem para resolver
7. Modificar `GameScene.ts`: chamar setBackgroundColor(0x000000) em _loadDungeonFloor()
8. Criar `DebugOverlayRenderer.ts`: modos semantic/variant/bitmask, atlas-agnostic via DEBUG_FRAMES
9. Criar `MaskFrequencyLogger.ts`: record() por tile, report() com top masks + variant totals + unused count
10. Criar `VisualRegressionScene.ts`: grid hardcoded 20×15 cobrindo casos críticos, toggle de modos via teclas 1–4, L para log

Arquivos a criar:
- `src/systems/TileSemanticsProvider.ts`
- `src/systems/SemanticClassifier.ts`
- `src/systems/WallVariantLUT.ts`
- `src/systems/DebugOverlayRenderer.ts`
- `src/systems/MaskFrequencyLogger.ts`
- `src/scenes/VisualRegressionScene.ts`

Arquivos a modificar:
- `src/config/dungeon-themes.ts`
- `src/systems/AutoTileResolver.ts`
- `src/systems/DungeonRenderer.ts`
- `src/scenes/GameScene.ts`
- `docs/dungeon-sprite-rendering.md`
- `CHANGELOG.md`
- `README.md`
- `.kiro/steering/game-steering.md`
- `.kiro/specs/dungeon.spec.md`
- `docs/prompts/Vitor.md`

---

## Prompt 30 — PR: feat(spells): sistema de magias melee-range v0.5.4
Autor: Vitor
Data: 2026-05-12

Contexto:
Branch `feature/game-structure-fixes`. Implementação do sistema de magias integrado ao jogo, com múltiplas iterações de correção durante a sessão.

Objetivo:
Adicionar sistema de magias jogável: desbloqueio por nível, dois slots equipáveis (J/K), mecânica melee-range (sem projétil), painel de magias integrado ao `I`, slots no footer e navegação por teclado.

Decisões técnicas:
- Magias melee-range (4 cardinais adjacentes) em vez de projétil — eliminar `Projectile` para evitar bugs de ciclo de vida do sprite fora da cena
- `SpellCastingSystem` tipado com `EnemySystem` (não `Enemy`) para compatibilidade com `takeDamage(amount, emitter)`
- `hitEnemies: EnemySystem[]` em vez de `hitEnemy | null` — dano em todos os adjacentes simultâneo
- Slots J/K movidos para dentro do footer (action bar), tamanho 20×20, mesmo padrão dos slots de poção
- Navegação por teclado no painel de magias: estado `_spellsFocus: 'tabs' | 'list'` em GameScene; `SPELLS_SELECTION_CHANGED` sincroniza visual no SpellsPanel
- `INVENTORY_TAB_CHANGED` com flag `_fromKeyboard` para distinguir origem teclado vs clique e evitar loop de eventos

Tarefas:
1. Criar `SpellSystem.ts`: desbloqueio, equipamento, cooldown por slot
2. Criar `SpellCastingSystem.ts`: cast melee — 4 tiles cardinais, retornar `SpellCastResult` com `hitEnemies[]`
3. Criar `SpellsPanel.ts`: painel integrado ao `I`, 85%×80%, adicionar `clearSelection()`
4. Criar `StatusPanel.ts`: atributos detalhados do player
5. Criar `spells.db.ts` + `spell-progression.ts` + `types/spells.ts`: definições data-driven
6. Modificar `GameScene.ts`: implementar `_castSpell()` melee, `_inventoryTab`, `_spellsFocus`, `_spellsSelectedIndex`, navegação ←/→/↑/↓ no painel
7. Modificar `UIScene.ts`: adicionar slots J/K no footer (20×20), ouvir `SPELLS_SELECTION_CHANGED`, tratar `INVENTORY_TAB_CHANGED` com `_fromKeyboard`
8. Modificar `constants.ts`: adicionar `SPELLS_SELECTION_CHANGED`
9. Corrigir testes: `potion_poison` → `potion_mana`; HP ajustado para cap de `POTION_HEAL_AMOUNT=25`; gold do shop 470→460

Arquivos a criar:
- `src/systems/SpellSystem.ts`
- `src/systems/SpellCastingSystem.ts`
- `src/ui/SpellsPanel.ts`
- `src/ui/StatusPanel.ts`
- `src/config/spells.db.ts`
- `src/config/spell-progression.ts`
- `src/types/spells.ts`
- `.kiro/specs/spells.spec.md`

Arquivos a modificar:
- `src/scenes/GameScene.ts`
- `src/scenes/UIScene.ts`
- `src/entities/Player.ts`
- `src/utils/constants.ts`
- `tests/inventory.test.js`
- `tests/shop.test.js`
- `CHANGELOG.md`
- `docs/PRD.md`
- `README.md`
- `.kiro/steering/game-steering.md`
- `docs/prompts/Vitor.md`

---

## Prompt 31
Autor: Vitor
Data: 2026-05-12

Contexto:
Correção de bug visual: sprites de itens no chão da dungeon não desapareciam após o jogador coletá-los. O item era adicionado ao inventário corretamente (lógica de coleta funcionando), mas o sprite permanecia visível na dungeon.

Decisões técnicas:
1. **Causa raiz**: as chamadas `setVisible(false).setActive(false)` antes de `destroy()` em `_checkItemPickup` são problemáticas no Phaser 4 — desativar o sprite antes de destruí-lo pode impedir que o objeto seja removido corretamente da display list do Phaser. Usar `item.sprite.destroy()` diretamente, sem as chamadas intermediárias.
2. **Cache sincronizado**: após `this._items = this._items.filter(i => i.gridX !== null)`, atualizar o cache do andar (`_dungeonCache`) com a referência filtrada (`cached.items = this._items`). Isso garante que ao re-entrar no mesmo andar, apenas os itens ainda no chão tenham sprites recriados.
3. Em Phaser 4, `destroy()` é síncrono e remove o objeto da display list imediatamente — não requer `setVisible(false)` ou `setActive(false)` previamente.

Tarefas:
1. Em `_checkItemPickup()`: remover `setVisible(false).setActive(false)` antes de `destroy()` em ambos os branches (gold e regular items)
2. Após o filtro de items, atualizar o cache: `cached.items = this._items`
3. Em `CHANGELOG.md`: adicionar entrada na seção `[Unreleased]` descrevendo a correção

Arquivos a modificar:
- `src/scenes/GameScene.ts` — `_checkItemPickup()` corrigido e cache atualizado após o filtro
- `CHANGELOG.md` — entrada na seção `[Unreleased]`

---

## Prompt 32 — fix(classes): aplicar bônus de atributo da classe selecionada ao iniciar o jogo
Autor: Vitor
Data: 2026-05-16

Contexto:
Ao iniciar uma nova partida com qualquer classe diferente do Guerreiro padrão, todos os personagens começam com os mesmos atributos base (STR/INT/DEX/WIS = 10, CON = 18). O campo `classDef.statBonus` existe e contém os bônus corretos por classe, mas nenhum código chama `recalcStats()` com esses bônus — o `player.classDef` é atribuído, mas os campos individuais de atributo (`str`, `intel`, `dex`, `con`, `wis`) nunca são atualizados.

Objetivo:
Garantir que a classe selecionada pelo jogador aplique corretamente seus bônus de atributo ao Player na inicialização da partida.

Tarefas:
1. Em `src/entities/Player.ts`, adicionar método `applyClassBonus(classDef: PlayerClassDef)`:
   - Para cada stat em `classDef.statBonus`, calcular `BASE_STATS.<STAT> + bonus` e atribuir ao campo correspondente do Player
   - Chamar `recalcStats()` após aplicar todos os atributos
   - Restaurar `this.hp = this.maxHp` e `this.mana = this.maxMana` após recalcular
2. Em `src/scenes/GameScene.ts`, na função que inicializa o Player com a classe selecionada:
   - Após `this.player.classDef = classDef`, chamar `this.player.applyClassBonus(classDef)`

Requisitos:
- Os valores de `BASE_STATS` não devem ser mutados — apenas os campos individuais do Player recebem o valor calculado
- `recalcStats()` deve ser chamado depois de todos os atributos ajustados para derivar `maxHp`, `maxMana`, `attack`, `critChance`, `cdReduction` e `spellBonus` corretamente
- HP e Mana do player devem refletir os novos máximos imediatamente ao entrar no jogo

Arquivos a modificar:
- `src/entities/Player.ts` — novo método `applyClassBonus(classDef: PlayerClassDef)`
- `src/scenes/GameScene.ts` — chamada a `applyClassBonus()` ao iniciar com classe selecionada

---

## Prompt 33 — feat(loot): drops visuais por quantidade de ouro e sistema de baús na dungeon
Autor: Vitor
Data: 2026-05-16

Contexto:
O spritesheet `Money.png` é 128×128 pixels com frames 16×16 (8 colunas × 8 linhas = 64 frames). A Row 2 (linha de índice 1, frames 8 a 15) contém representações visuais de quantidades de ouro e um baú vermelho fechado. Atualmente todos os drops de ouro usam frame 0 (frame errado). Não existem baús nas dungeons.

Objetivo:
1. Usar frames da Row 2 para mostrar a quantidade visual de ouro dropado por inimigos
2. Implementar baús gerados proceduralmente nas dungeons com sistema de loot por profundidade
3. Corrigir a propriedade `goldAmount` que está sendo atribuída dinamicamente em `LootSystem` sem declaração formal na classe `Item`

Especificação de frames (Money.png, 0-indexed):
- Frame 8 (Row 2, Col 1): pilha grande — usar quando `goldAmount >= 50`
- Frame 9 (Row 2, Col 2): pilha média — usar quando `20 <= goldAmount < 50`
- Frame 10 (Row 2, Col 3): moeda única — usar quando `goldAmount < 20`
- Frame 14 (Row 2, Col 7): baú vermelho fechado

Tarefas:
1. `src/utils/constants.ts` — substituir `GOLD: 0` por:
   ```ts
   GOLD_SMALL:  10,  // moeda única
   GOLD_MEDIUM:  9,  // pilha média
   GOLD_LARGE:   8,  // pilha grande
   CHEST:       14,  // baú fechado
   ```
2. `src/entities/Item.ts` — declarar `goldAmount?: number` como propriedade formal da classe
3. `src/systems/LootSystem.ts`:
   - Escalar o valor de ouro dropado por inimigos com o andar (base + andar × 6, ±30% de variação)
   - Adicionar interface `ChestLootResult` e método `rollChestLoot(floor: number): ChestLootResult`
   - Loot de baú por profundidade:
     - Andar 1–2: 60% ouro | 40% poção
     - Andar 3–5: 50% ouro | 30% poção | 20% mímica (player toma 15–25 de dano)
     - Andar 6+: 50% equipamento (gerado para o andar) | 30% ouro | 20% poção forte
   - Para equipamentos: sortear pool adequada ao andar, atribuir `name`, `slotId`, `rarity`, `bonuses` e `price` proporcionais ao andar
4. `src/generators/DungeonFeatureGenerator.ts`:
   - Adicionar `'chest'` ao union `FeatureType`
   - Após gerar as escadas, spawnar 1–2 baús em rooms intermediárias (excluindo rooms 0 e última)
   - Excluir posições já ocupadas por escadas e `startPos`; adicionar `metadata: { opened: false }` a cada baú
5. `src/scenes/GameScene.ts`:
   - Adicionar campo `_chestSprites = new Map<string, Phaser.GameObjects.Sprite>()` para rastrear sprites de baús
   - `_cleanup()`: destruir e limpar `_chestSprites`
   - `_getItemVisual(type, goldAmount?)`: selecionar frame baseado nos limiares de `goldAmount`; adicionar `default` case no switch
   - `_renderDungeonFeatures()`: para features `chest` não abertas, criar sprite com frame `DAWNLIKE_FRAMES.CHEST` e registrar em `_chestSprites`
   - Novo método `_checkChestInteraction()`: ao pisar em feature `chest` não aberta, chamar `lootSystem.rollChestLoot()`, processar resultado (mímica → dano, ouro/poção → spawn+coleta, equipamento → inventário), destruir sprite do baú, marcar `metadata.opened = true`
   - Chamar `_checkChestInteraction()` imediatamente após `_checkItemPickup()` no fluxo de movimento (`result.playerMoved`)
6. `src/ui/ActionBarPanel.ts` — atualizar referência de `DAWNLIKE_FRAMES.GOLD` para `DAWNLIKE_FRAMES.GOLD_SMALL`

Requisitos:
- `_spawnDroppedItem()` deve ser idempotente: destruir sprite existente antes de criar novo; não adicionar o mesmo item a `_items` duas vezes (`includes()` check)
- Baús abertos não devem reaparecer ao re-entrar no andar (flag `metadata.opened` persiste no cache)
- Equipamentos de baú não emitem `ITEM_DROPPED` — são adicionados diretamente ao inventário

Arquivos a modificar:
- `src/utils/constants.ts`
- `src/entities/Item.ts`
- `src/systems/LootSystem.ts`
- `src/generators/DungeonFeatureGenerator.ts`
- `src/scenes/GameScene.ts`
- `src/ui/ActionBarPanel.ts`
