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

Tarefas realizadas:
1. Criar `TILE_GID` em `TileProperties.ts` com ~70 aliases de TMX GID organizados por tileset
2. Criar `MANUAL_MAP_OVERRIDES` com suporte a `forceGid`, `forceGidLike`, `overlayGid` e `walkable`
3. Implementar `DEBUG_SHOW_COORDINATES` no renderer com textos estáticos por tile e label interativo ao clicar
4. Corrigir frames pretos do Tree0.png (frames 0–47 vazios, árvores visíveis a partir do frame 48)
5. Corrigir GIDs incorretos no `TILE_GID` (frame index vs TMX GID real)

Arquivos modificados:
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

Tarefas realizadas:
1. Refatorar o loop de grama em TownTMXRenderer.ts para verificar MANUAL_MAP_OVERRIDES por coordenada (incluindo chaves negativas como "-5,-3")
2. Renderizar tile customizado via forceGid quando override presente; grama padrão caso contrário
3. Exibir DEBUG_SHOW_COORDINATES em todas as células de padding
4. Respeitar walkable: false nos overrides de padding (padrão é walkable)

Arquivos modificados:
- `src/systems/TownTMXRenderer.ts` — loop de grama expandido com override e debug

## Prompt 21
Autor: Vitor
Data: 2026-05-09

Contexto:
O modo DEBUG_SHOW_COORDINATES exibia coordenadas nos tiles mas não havia feedback ao clicar sobre qual GID correspondia ao tile clicado, dificultando o preenchimento de MANUAL_MAP_OVERRIDES. Além disso, overlayGid não funcionava em coordenadas fora dos limites TMX (padding) e o spritesheet Decor0.png não era carregado.

Objetivo:
Melhorar o ferramental de debug de tiles para facilitar a identificação e configuração de overrides no mapa da cidade.

Tarefas realizadas:
1. Adicionar console.log ao clicar num tile com coordenadas TMX, world, forceGid das layers Tiles e Sprites, e override atual
2. Corrigir cálculo de coordenadas do clique usando pointer.worldX/worldY em vez de cálculo manual incorreto
3. Adicionar botão toggle "[ coords: ON/OFF ]" na UIScene para mostrar/esconder os labels de coordenada dinamicamente sem interromper o console.log
4. Expandir o log para tiles fora dos limites TMX: detectar grama procedural, borda de caminho ou override de padding
5. Corrigir overlayGid para funcionar também no loop de padding (coordenadas negativas como "-1,8")
6. Adicionar carregamento do spritesheet Decor0.png no BootScene (estava ausente, impedindo renderização de GIDs 2136–2311)

Arquivos modificados:
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

Tarefas realizadas:
1. Remover `TOWN_DUNGEON_EXITS` de constants.ts; adicionar `entrarDungeon?` ao `TileOverride`
2. `GameScene._loadTown()`: escaneia `MANUAL_MAP_OVERRIDES` por `entrarDungeon:true`, computa game coords, registra spawn de retorno dinamicamente
3. `GameScene._checkAreaTransition()`: usa `_dungeonEntryTiles` em vez de array hardcoded
4. `TownTMXRenderer`: pit0 não sobrepõe tile com `forceGid`; check de `TMX_REMOVED_POSITIONS` movido para antes de todo rendering de sprite
5. `TownTMXRenderer`: fórmula do clique substituída por `cam.getWorldPoint()`; debug exibe `→ game(x,y)`
6. `NPCController.getAllNPCs()`: retorna `{...n.def, gridX: n.gridX, gridY: n.gridY}` com posição atual
7. `TileOverride`: adicionados `npcName?` e `interaction?`; sprites com interaction viram sign NPCs no renderer
8. `TownTMXData`: removidos Ajudante e Viajante via `TMX_REMOVED_POSITIONS`; guardas com `wanderBounds` restritos a `maxX:16, maxY:17`

Arquivos modificados:
- `src/utils/constants.ts` — removido TOWN_DUNGEON_EXITS, TOWN.BONUS_ENTRY_Y = 0
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

Tarefas realizadas:
1. `world.spec.md`: pipeline substituído por `TownTMXRenderer + MANUAL_MAP_OVERRIDES`; NPCs com posições TMX, `interactRange` e comportamento corretos; transição cidade→dungeon documenta `_dungeonEntryTiles`
2. `product.md`: seções Cidade e NPCs atualizadas — placa, `entrarDungeon`, `interactRange`, debug de tiles
3. `game-steering.md`: adicionadas restrições para `interactRange`, objetos estáticos interativos, entradas data-driven, `TMX_REMOVED_POSITIONS` e `getAllNPCs()`

Arquivos modificados:
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

Tarefas realizadas:
1. `src/config/BonusAreaData.ts` criado: `BONUS_W=30`, `BONUS_H=22`, `BONUS_AREA_OVERRIDES`, `BONUS_AREA_NPCS`
2. `src/systems/BonusAreaRenderer.ts` criado: renderiza chão com suporte a `forceGid`, labels de coord, toggle ON/OFF, clique exibe `[DEBUG bonus] (x,y)` e override atual
3. `GameScene._loadBonusArea()` reescrito para delegar ao `BonusAreaRenderer` (igual ao `_loadTown` com `TownTMXRenderer`)
4. Condição de saída corrigida: `gridY >= 9` → `gridY >= BONUS_H - 1`

Arquivos modificados:
- `src/config/BonusAreaData.ts` — novo, config isolada da área bônus
- `src/systems/BonusAreaRenderer.ts` — novo, renderer com debug completo
- `src/scenes/GameScene.ts` — `_loadBonusArea()` reescrito, import de `BonusAreaRenderer`, condição de saída corrigida
