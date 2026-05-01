# PRD — Product Requirements Document
# Dungeon of Echoes

**Versão:** 0.1.0  
**Data:** 2026-04-30  
**Equipe:** Equipe 7 — IA para DEVs SCTEC T2  
**Status:** MVP entregue

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

| Atributo | Valor inicial |
|----------|--------------|
| HP | 100 |
| Ataque | 10 |
| Nível | 1 |
| XP | 0 |

- Movimento por **WASD ou setas** (4 direções, sem diagonal)
- Bloqueado por WALL; um movimento por turno (cooldown de 150ms)
- Ao mover para tile com inimigo → inicia combate

### 6.3 Combate

- **Automático** ao tentar mover para tile ocupado por inimigo vivo
- Sequência: player ataca → inimigo contra-ataca (se vivo)
- Dano fixo = `attacker.attack` (sem aleatoriedade no MVP)
- Feedback visual: texto flutuante por 800ms + flash de câmera

### 6.4 Inimigos

| Atributo | Valor padrão |
|----------|-------------|
| HP | 30 |
| Ataque | 8 |
| XP ao morrer | 25 |
| Quantidade por dungeon | 6 |

- Spawnam em tiles FLOOR, sem sobreposição com player ou entre si
- MVP: estáticos (não se movem). Estrutura preparada para IA futura

### 6.5 XP e Progressão

- `xpToNextLevel = nível_atual × 100`
- A cada level up: `maxHp += 20`, `attack += 5`, HP restaurado ao máximo
- Suporte a múltiplos level-ups encadeados em uma única concessão de XP

### 6.6 HUD

| Elemento | Conteúdo |
|----------|----------|
| HP | "HP: X/Y" + barra visual |
| XP | "XP: X / Y" |
| Nível | "Nível: X" |

Atualizado após cada ação do player.

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

### Dentro do escopo (MVP v0.1.0)

- Geração procedural de dungeon (salas + corredores)
- Player controlável (4 direções, sem diagonal)
- Combate automático turn-based
- 1 tipo de inimigo estático com atributos fixos
- Sistema de XP e progressão de nível
- HUD com HP, XP e Nível
- Game Over com tela de resultado e restart
- 17 testes unitários (DungeonSystem, CombatSystem, XPSystem)

### Fora do escopo (planejado para versões futuras)

| Feature | Motivo da exclusão |
|---------|-------------------|
| FOG of War | Complexidade visual não prioritária no MVP |
| Inventário e itens | Escopo separado; requer UI adicional |
| Múltiplos tipos de inimigo | Balanceamento adiado para pós-MVP |
| IA de inimigos (movimento) | Inimigos estáticos suficientes para validar combate |
| Múltiplos andares | Depende de progressão de dificuldade não especificada |
| IA generativa (lore, inimigos) | Requer APIkey e backend; fora do escopo acadêmico atual |
| Sistema de save | Permadeath intencional; sem persistência é comportamento esperado |
| Magia e habilidades | Planejado para expansão pós-MVP |

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

### v0.2.0 — Dungeon completa (planejado)
- [ ] FOG of War (tiles visitados vs. visíveis vs. escuros)
- [ ] Múltiplos tipos de inimigo com atributos distintos
- [ ] IA de inimigos: movimentação e perseguição do player
- [ ] Escadas para próximo andar

### v0.3.0 — Expansão de mecânicas (planejado)
- [ ] Inventário com itens no chão (poções, armas)
- [ ] Sistema de classes do player (Warrior, Mage, Rogue)
- [ ] Múltiplos andares com dificuldade crescente

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
| Testes | 100% dos testes unitários passando em `npm test` |
| Build | `npm run build` produz bundle funcional sem warnings críticos |
| Commits | 100% dos commits na branch `main` e `staging` validados pelo Commitlint |
| Cobertura de specs | Cada sistema implementado possui spec correspondente em `.kiro/specs/` |
