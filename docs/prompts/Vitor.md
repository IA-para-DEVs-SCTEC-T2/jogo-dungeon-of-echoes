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
