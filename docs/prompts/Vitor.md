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
