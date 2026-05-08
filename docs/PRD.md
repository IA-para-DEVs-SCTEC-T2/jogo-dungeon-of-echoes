# PRD — Product Requirements Document
# Dungeon of Echoes

**Versão:** 0.3.0  
**Data:** 2026-05-05  
**Equipe:** Equipe 7 — IA para DEVs SCTEC T2  
**Status:** Fase 3 entregue — Sistema de Inventário e Itens

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

- Grid de **40×60 tiles** (WALL ou FLOOR)
- Geração procedural: até **8 salas** (4×4 a 10×8 tiles), conectadas por corredores em L
- Borda sempre WALL; posição inicial do player sempre em tile FLOOR
- Suporte a `seed` para reprodutibilidade em debug

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

## 9. Escopo

### Dentro do escopo (v0.3.0 — estado atual)

- [x] Geração procedural de dungeon (salas + corredores BSP, 40×40 tiles)
- [x] Player controlável (4 direções, turn-based real via TurnManager)
- [x] Atributos base RPG (CON/WIS/INT/STR/DEX/CHA) com fórmulas derivadas
- [x] Combate automático turn-based com 80% hit chance
- [x] IA de inimigos: IDLE → CHASING → ATTACKING, detecção por sala e raio
- [x] Sistema de XP e progressão de nível com recálculo de atributos
- [x] HUD persistente via UIScene overlay (barras HP/Mana, log, action bar de inventário)
- [x] Sistema de inventário: 20 slots, coleta automática, uso por tecla
- [x] Sistema de identificação roguelike de itens (nome desconhecido → real ao usar)
- [x] Game Over com tela de resultado e restart
- [x] 108 testes unitários
- [x] Dashboard estático de acompanhamento do projeto

### Fora do escopo (planejado para versões futuras)

| Feature | Motivo da exclusão |
|---------|-------------------|
| FOG of War | Complexidade visual; spec pronta em `.kiro/specs/fog-of-war.spec.md` |
| Múltiplos tipos de inimigo | Balanceamento adiado para pós-refinamento |
| Múltiplos andares | Depende de progressão de dificuldade não especificada |
| IA generativa (lore, inimigos) | Requer API key e backend; fora do escopo acadêmico atual |
| Sistema de save | Permadeath intencional; sem persistência é comportamento esperado |
| Magia e habilidades | Mana implementada; uso em habilidades planejado para v0.4.0 |
| Equipamentos (armas, armaduras) | Escopo post-v0.3 |

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

### v0.4.0 — Dungeon Completa (planejado)
- [ ] FOG of War (HIDDEN / VISIBLE / REVEALED)
- [ ] Múltiplos tipos de inimigo com atributos distintos
- [ ] Escadas para próximo andar com dificuldade crescente

### v1.0.0 — IA Generativa (planejado)
- [ ] Integração com LLM (Claude Haiku) para lore dinâmica
- [ ] Inimigos elite com variações geradas por IA
- [ ] Narrativa emergente baseada no histórico da partida

---

## 11. Métricas de Sucesso

| Métrica | Critério de sucesso |
|---------|-------------------|
| Jogabilidade | Partida completa possível do boot ao game over sem erros no console |
| Estabilidade | Zero crashes reportados em sessão de 10 minutos de jogo |
| Testes | 100% dos testes unitários passando em `npm test` (108/108 em v0.3.0) |
| Build | `npm run build` produz bundle funcional sem warnings críticos |
| Commits | 100% dos commits na branch `main` e `staging` validados pelo Commitlint |
| Cobertura de specs | Cada sistema implementado possui spec correspondente em `.kiro/specs/` |
