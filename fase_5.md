# Fase 5 — IA Adaptativa (Dificuldade Dinâmica + Comportamento)

Você é um desenvolvedor sênior especialista em:

* Game AI
* Sistemas adaptativos
* Arquitetura de jogos
* Phaser.js

Continue a implementação do projeto baseado nas fases anteriores.

---

## 🎯 OBJETIVO DESTA FASE

Implementar um sistema de IA adaptativa que:

* Ajusta a dificuldade do jogo dinamicamente
* Modifica comportamento dos inimigos
* Reage ao desempenho do jogador

⚠️ IMPORTANTE:
A adaptação deve ser feita via lógica local (rápida), NÃO via chamadas contínuas a LLM.

---

## 🧠 CONCEITO CENTRAL

Sistema híbrido:

* Métricas do jogador → análise local
* Ajustes de dificuldade → em tempo real
* IA generativa (LLM) → usada apenas para enriquecer (opcional)

---

## 📊 1. PLAYER METRICS SYSTEM

Criar:

```plaintext
src/systems/PlayerMetrics.ts
```

Estrutura:

```ts
class PlayerMetrics {
  turnsSurvived: number
  damageDealt: number
  damageTaken: number
  enemiesKilled: number
  itemsUsed: number

  deaths: number

  getPerformanceScore(): number
}
```

---

### 2. Cálculo de Performance

Exemplo:

```ts
score =
  (damageDealt * 1.2)
  - (damageTaken * 1.0)
  + (enemiesKilled * 5)
  + (turnsSurvived * 0.5)
```

Normalizar score:

```ts
range: -100 → +100
```

---

## ⚖️ 2. DIFFICULTY MANAGER

Criar:

```plaintext
src/systems/DifficultyManager.ts
```

---

### 3. Níveis de dificuldade

```ts
enum DifficultyLevel {
  EASY,
  NORMAL,
  HARD
}
```

---

### 4. Atualização dinâmica

A cada:

* novo andar
  OU
* X turnos

Executar:

```ts
if (score < -20) → EASY
if (-20 <= score <= 20) → NORMAL
if (score > 20) → HARD
```

---

## 👾 3. ADAPTAÇÃO DE INIMIGOS

### 5. Modificadores por dificuldade

Aplicar ao spawn:

#### EASY

* -20% HP inimigos
* -20% dano

#### NORMAL

* padrão

#### HARD

* +30% HP
* +20% dano
* chance de habilidade especial

---

### 6. Comportamento adaptativo

Adicionar ao Enemy:

```ts
aggressionLevel: number // 0–1
```

---

#### EASY

* inimigos perseguem menos
* maior chance de idle

#### HARD

* sempre perseguem
* atacam agressivamente

---

## 🧭 4. IA COMPORTAMENTAL MELHORADA

Atualizar lógica de inimigos:

Antes:

* mover direto ao player

Agora:

```ts
if (aggressionLevel > 0.7):
  perseguir direto
else:
  comportamento mais aleatório
```

---

## 🎯 5. SPAWN ADAPTATIVO

Modificar DungeonGenerator:

```ts
enemyCount = base + difficultyModifier
```

---

#### EASY

* menos inimigos

#### HARD

* mais inimigos
* maior chance de elite

---

## 🧠 6. INTEGRAÇÃO OPCIONAL COM LLM

⚠️ NÃO usar para decisão

Usar apenas para enriquecer:

* descrição de inimigos mais agressivos
* feedback narrativo

---

Exemplo:

```text
"O ar parece mais pesado... criaturas mais perigosas surgem."
```

---

## 🔄 7. LOOP DE ADAPTAÇÃO

Fluxo:

```plaintext
Jogador joga →
Métricas atualizam →
DifficultyManager recalcula →
Novos spawns usam nova dificuldade
```

---

## ⚙️ 8. INTEGRAÇÃO COM SISTEMAS

Integrar:

* TurnManager → atualizar métricas por turno
* CombatSystem → registrar dano
* GameScene → aplicar dificuldade ao spawn

---

## 🖥️ 9. FEEDBACK AO JOGADOR

Opcional mas recomendado:

* Mensagens sutis:

Exemplos:

* "Você sente que está ficando mais forte..."
* "As criaturas parecem mais hostis..."

---

## 🧪 10. EDGE CASES

* Evitar mudança brusca a cada turno
* Usar "histerese":

```ts
mudar dificuldade apenas se score passar limite por X ciclos
```

---

## 📦 SAÍDA ESPERADA

Você deve gerar:

1. PlayerMetrics
2. DifficultyManager
3. Modificações em Enemy
4. Integração com DungeonGenerator
5. Integração com sistemas existentes
6. Explicação breve

---

## ⚠️ ERROS QUE NÃO DEVEM OCORRER

* IA chamando LLM constantemente
* Dificuldade mudando a cada turno sem controle
* Modificadores exagerados (quebrando o jogo)
* Ignorar métricas do jogador

---

## 📌 OBJETIVO FINAL

Criar um jogo que:

* Se adapta ao jogador
* Mantém desafio equilibrado
* Parece "inteligente", mas é eficiente

---

Quando terminar, aguarde próxima fase.