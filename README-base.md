# Dungeon of Echoes — Documento Técnico de Design e Arquitetura

> Jogo RPG Roguelike inspirado em Castle of the Winds  
> Tecnologia: JavaScript + Phaser.js  
> Plataforma: Navegador Web  
> Contexto: Projeto Acadêmico com integração de IA Generativa

---

## 1. Visão Geral do Projeto

**Dungeon of Echoes** é um RPG roguelike tile-based desenvolvido para navegador usando Phaser.js. O jogo presta homenagem à mecânica clássica de _Castle of the Winds_ (1989–1993) enquanto incorpora geração procedural moderna e IA generativa para criar uma experiência emergente e replicável.

O jogador controla um herói que explora dungeons procedurais em múltiplos andares, coleta itens de identidade desconhecida, enfrenta inimigos e busca avançar o máximo possível antes de morrer — sem salvamento entre sessões (permadeath).

### Objetivos do Projeto

| Objetivo | Descrição |
|---|---|
| Acadêmico | Demonstrar uso de IA generativa em jogos |
| Técnico | Arquitetura modular e extensível em JS/Phaser |
| Gameplay | Experiência roguelike fiel ao estilo clássico |
| Inovação | Narrativa dinâmica e inimigos gerados por IA |

---

## 2. Comparação com Castle of the Winds

### O que foi mantido (fidelidade ao clássico)

| Característica | Castle of the Winds | Dungeon of Echoes |
|---|---|---|
| Movimento | Grid tile-based | Grid tile-based |
| Combate | Turn-based por proximidade | Turn-based por proximidade |
| Itens desconhecidos | Poções e pergaminhos sem nome | Poções, pergaminhos, anéis sem identificação |
| Inventário limitado | Peso/slots limitados | Slots limitados (sem peso) |
| Dungeon procedural | Geração por andares | Geração por andares com sementes |
| Morte permanente | Permadeath total | Permadeath com resumo de partida |
| Magia com custo | Mana points | Mana points |
| Loot RNG | Alta variância | Alta variância |
| FOG of War | Revelação por andares | Revelação por tile visitado |

### O que foi modernizado

| Característica | Mudança |
|---|---|
| Interface | Phaser.js com tileset visual, sem dependência de ícones Windows |
| Inimigos | Comportamento via IA com variações geradas dinamicamente |
| Narrativa | Descrições de itens e eventos geradas por LLM |
| Dificuldade | Adaptação dinâmica baseada em desempenho do jogador |
| Missões | Sistema simples de missões emergentes geradas por IA |
| Acessibilidade | Executável em qualquer navegador moderno |

---

## 3. Loop de Gameplay

```
┌─────────────────────────────────────────────────┐
│                  INÍCIO DA PARTIDA               │
│           Criação de personagem + Lore intro     │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│                 ANDAR ATUAL                      │
│  Explorar tiles → Revelar mapa → Encontrar itens │
│  Combater inimigos → Usar magia → Gerenciar inv  │
└────────────────────┬────────────────────────────┘
                     │
           ┌─────────┴──────────┐
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌────────────────────────┐
│  SUBIR DE NÍVEL  │  │   DESCER ESCADA        │
│  XP → atributos  │  │   Novo andar gerado    │
└──────────────────┘  └────────────────────────┘
           │                    │
           └─────────┬──────────┘
                     │
           ┌─────────┴──────────┐
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌────────────────────────┐
│    MORTE         │  │  BOSS / OBJETIVO FINAL │
│  Resumo partida  │  │  Tela de vitória       │
│  Score + Lore    │  │  (escopo futuro)       │
└──────────────────┘  └────────────────────────┘
```

**Ciclo de turno:**
1. Jogador executa uma ação (mover, atacar, usar item, lançar magia, esperar)
2. Sistema processa efeitos da ação (dano, consumo de mana, etc.)
3. Todos os inimigos visíveis executam sua IA de turno
4. Estado do mapa é atualizado (FOG, HP, status)
5. Retorna ao passo 1

---

## 4. Mecânicas Detalhadas

### 4.1 Atributos do Personagem

| Atributo | Abreviação | Efeito |
|---|---|---|
| Força | STR | Dano corpo-a-corpo, carga máxima |
| Inteligência | INT | Potência de magia, identificação de itens |
| Destreza | DEX | Chance de esquiva, precisão |
| Constituição | CON | HP máximo, regeneração |
| Sabedoria | WIS | Mana máxima, resistência a efeitos |
| Carisma | CHA | Preços em lojas (se houver), efeitos de missão |

Atributos base: 8–16 pontos cada (rolados ou distribuição de pontos).  
Limite máximo: 20 (sem equipamentos), 25 (com bônus de equipamentos).

### 4.2 Derivados

```
HP Máximo      = CON × 5 + Nível × 3
Mana Máxima    = WIS × 4 + INT × 2
Defesa Base    = DEX / 2 + bônus de armadura
Ataque Base    = STR + bônus de arma
Precisão       = DEX × 2 + nível (vs. Esquiva do inimigo)
```

### 4.3 Status Effects

| Efeito | Origem | Duração | Impacto |
|---|---|---|---|
| Envenenado | Inimigos/Poções | 3–8 turnos | -1 HP/turno |
| Confuso | Pergaminhos/Feitiços | 2–5 turnos | Movimento aleatório |
| Lento | Poções malditas | 5 turnos | Age a cada 2 turnos |
| Cego | Armadilhas | 3 turnos | FOG total ao redor |
| Regenerando | Poções | 5 turnos | +2 HP/turno |
| Fortalecido | Pergaminhos | 10 turnos | +3 STR temporário |

---

## 5. Sistema de Combate

### 5.1 Modelo Turn-Based

- **Iniciativa:** Jogador sempre age primeiro em seu turno.
- **Ação única:** Cada turno = 1 ação (mover OU atacar OU usar item OU lançar magia).
- **Combate por adjacência:** Atacar = mover em direção a um inimigo adjacente.
- **Sem animações bloqueantes:** Combate resolve instantaneamente, com feedback visual.

### 5.2 Resolução de Ataque

```
RollAtaque = Random(1, 20) + BônusAtaque
DefesaAlvo = DefesaBase + Modificadores

if (RollAtaque >= DefesaAlvo):
    Dano = Arma.DanoBase + Random(0, Arma.DanoVariância) + BônusSTR
    Dano = max(1, Dano - Armadura.Absorção)
    Alvo.HP -= Dano
else:
    "Errou!" → 0 dano
```

**Crítico:** Roll natural 20 → dano × 2.  
**Falha crítica:** Roll natural 1 → ação perdida sem dano.

### 5.3 IA de Combate dos Inimigos

Cada inimigo possui um estado de IA:

```
IDLE     → Patrulha aleatória em raio de 3 tiles
ALERTED  → Detectou jogador (linha de visão ou barulho)
CHASING  → Persegue jogador usando pathfinding A*
ATTACKING → Jogador adjacente → executa ataque
FLEEING  → HP < 20% (inimigos covardes)
```

Comportamentos especiais (gerados/expandidos por IA):
- **Arqueiros:** Atacam à distância, recuam se jogador se aproxima.
- **Magos inimigos:** Lançam feitiços com cooldown.
- **Elite:** Comportamento híbrido gerado dinamicamente via LLM.

### 5.4 Morte e Consequências

- **Permadeath:** Morte = fim da partida sem possibilidade de continuar.
- **Resumo pós-morte:** Andar atingido, inimigos mortos, itens encontrados, causa da morte.
- **Score:** Calculado por andares + inimigos + itens raros coletados.

---

## 6. Sistema de Inventário e Identificação de Itens

### 6.1 Slots de Inventário

```
Capacidade: 20 slots fixos (sem sistema de peso)
Equipados (não ocupam slots de inventário):
  - Arma Principal
  - Arma Secundária (escudo ou segunda arma)
  - Armadura de Corpo
  - Capacete
  - Botas
  - Anel (até 2)
  - Amuleto
```

### 6.2 Categorias de Itens

| Categoria | Exemplos | Identificável |
|---|---|---|
| Armas | Espada, Machado, Cajado, Arco | Não (stats visíveis) |
| Armaduras | Couro, Malha, Placa | Não (stats visíveis) |
| Poções | Cura, Mana, Força, Veneno | **Sim** |
| Pergaminhos | Identificar, Teleporte, Fireball | **Sim** |
| Anéis | Proteção, Velocidade, Maldição | **Sim** |
| Amuletos | Regeneração, Visão, Maldição | **Sim** |
| Comida | Pão, Carne | Não |

### 6.3 Sistema de Identificação

**Itens não identificados** aparecem com nome genérico:
- Poção: _"Poção Azul Borbulhante"_
- Pergaminho: _"Pergaminho com Runas Estranhas"_
- Anel: _"Anel de Prata Simples"_

**Métodos de identificação:**
1. Usar o item (identificação pelo efeito — pode ser arriscado)
2. Pergaminho de Identificação
3. Alta Inteligência passiva (INT ≥ 15 → 30% chance ao pegar)
4. Habilidade de Identificar (magia de nível baixo)

**Persistência de identificação:** Um tipo de poção identificado permanece conhecido **durante aquela partida**. Em nova partida, os nomes são re-sortidos.

### 6.4 Raridade

| Tier | Cor | Chance de drop | Efeitos |
|---|---|---|---|
| Comum | Branco | 60% | Stats base |
| Incomum | Verde | 25% | +1 afixo |
| Raro | Azul | 12% | +2 afixos |
| Épico | Roxo | 3% | +3 afixos + nome único gerado por IA |

---

## 7. Sistema de Progressão

### 7.1 Experiência e Níveis

```
XP necessário para Nível N = 100 × N × (N + 1) / 2

Ganho de XP:
  - Matar inimigo: XP base do inimigo × modificador de nível relativo
  - Descer andar: +50 XP flat
  - Completar missão: +100–300 XP
```

### 7.2 Level Up

Ao subir de nível:
- +3 pontos para distribuir em atributos (máx 2 por atributo por nível)
- HP e Mana recalculados automaticamente
- +1 slot de magia desbloqueado a cada 3 níveis

### 7.3 Inimigos por Andar

| Andar | Tier de Inimigos | Dificuldade |
|---|---|---|
| 1–3 | Goblin, Rato Gigante, Esqueleto | Fácil |
| 4–6 | Orc, Zumbi, Kobold Arqueiro | Médio |
| 7–9 | Troll, Vampiro, Mago Sombrio | Difícil |
| 10+ | Elite gerados por IA | Variável |

---

## 8. Sistema de Magia

### 8.1 Aquisição de Magias

- Ao criar o personagem (2 magias iniciais para classes mágicas)
- Encontradas em pergaminhos de aprendizagem no dungeon
- Compradas em eventuais NPCs (escopo futuro)

### 8.2 Lista de Magias Base

| Magia | Escola | Custo Mana | Efeito |
|---|---|---|---|
| Dardo Mágico | Evocação | 3 | 1d6+INT dano a 1 alvo em linha |
| Bola de Fogo | Evocação | 10 | 2d8 dano em área 3×3 |
| Cura Menor | Restauração | 5 | +1d8+WIS HP |
| Identificar | Divinação | 6 | Identifica 1 item |
| Teleporte | Translação | 15 | Move para tile aleatório visível |
| Paralisar | Encantamento | 8 | Inimigo pula 2 turnos |
| Clarividência | Divinação | 12 | Revela o mapa do andar atual |
| Escudo Mágico | Abjuração | 7 | +5 Defesa por 10 turnos |
| Drenar Vida | Necromância | 9 | Drena HP do alvo para o lançador |
| Invocar Criatura | Conjuração | 20 | Cria aliado temporário (3 andares máx) |

### 8.3 Slots de Magia

- Cada magia aprendida ocupa 1 slot.
- Slots iniciais: 4 (mago), 2 (outros).
- +1 slot a cada 3 níveis de personagem.
- Magias aprendidas não são perdidas ao subir de nível.

---

## 9. Geração Procedural de Dungeons

### 9.1 Algoritmo de Geração

**Método:** BSP (Binary Space Partitioning) com corredores conectados.

```
Processo:
1. Dividir espaço 50×50 em regiões via BSP recursivo
2. Criar sala em cada região folha (tamanho 5×12 tiles)
3. Conectar salas irmãs com corredores (L-shaped)
4. Garantir conectividade total do grafo
5. Spawnar escada de entrada e saída
6. Popular com inimigos, itens e armadilhas
7. Aplicar tema visual do andar (caverna, castelo, cripta)
```

### 9.2 Populamento por Andar

```javascript
// Distribuição por andar N:
Inimigos    = 3 + N × 2  (máx 30)
Itens       = 5 + N      (máx 20)
Armadilhas  = 1 + floor(N / 2)
Lojas/NPCs  = N % 5 === 0 ? 1 : 0  // A cada 5 andares
```

### 9.3 Temas Visuais

| Andares | Tema | Inimigos predominantes |
|---|---|---|
| 1–3 | Caverna Rasa | Ratos, Goblins |
| 4–6 | Ruínas Antigas | Esqueletos, Trolls |
| 7–9 | Cripta Sombria | Mortos-vivos, Magos |
| 10+ | Abismo Profundo | Elite, Demônios |

### 9.4 Fog of War

- Tiles **não visitados:** escuros, sem informação.
- Tiles **visitados mas fora de visão:** visíveis em tons acinzentados (sem inimigos).
- Tiles **dentro do campo de visão (raio 5):** totalmente visíveis com inimigos.
- Algoritmo de visão: _Shadowcasting_ ou _Raycasting_ simples.

---

## 10. Estrutura de Entidades

### 10.1 Player

```
Player {
  // Identidade
  name: string
  class: enum(Warrior, Mage, Rogue)

  // Atributos
  stats: {
    str, int, dex, con, wis, cha: number (8–25)
  }

  // Estado
  hp: number
  hpMax: number
  mana: number
  manaMax: number
  level: number
  xp: number
  xpToNext: number

  // Equipamentos
  equipment: {
    weapon, offhand, body, head, boots,
    ring1, ring2, amulet: Item | null
  }

  // Inventário
  inventory: Item[20]

  // Magias
  knownSpells: Spell[]
  spellSlots: number

  // Identificação (persiste na sessão)
  identifiedTypes: Map<string, string>

  // Posição
  x: number
  y: number
  dungeonFloor: number
}
```

### 10.2 Enemy

```
Enemy {
  id: string
  name: string
  tier: enum(Common, Elite, Boss)

  // Stats
  hp: number
  hpMax: number
  attack: number
  defense: number
  xpReward: number

  // IA
  aiState: enum(IDLE, ALERTED, CHASING, ATTACKING, FLEEING)
  behavior: EnemyBehavior   // estratégia plugável
  detectionRadius: number

  // Geração IA (opcional)
  aiGeneratedDescription: string | null
  specialAbility: Ability | null

  // Posição
  x: number
  y: number
  floor: number

  // Loot
  lootTable: LootEntry[]
}
```

### 10.3 Item

```
Item {
  id: string
  internalType: string      // tipo real: "potion_heal"
  displayName: string       // nome gerado: "Poção Azul Borbulhante"
  identified: boolean

  category: enum(Weapon, Armor, Potion, Scroll, Ring, Amulet, Food)
  rarity: enum(Common, Uncommon, Rare, Epic)

  // Efeitos base
  baseEffect: ItemEffect

  // Afixos (Uncommon+)
  affixes: Affix[]

  // Descrição gerada por IA (Épico)
  aiDescription: string | null

  // Para equipamentos
  equipSlot: string | null
  statBonuses: Partial<Stats>

  // Para consumíveis
  charges: number | null
}
```

### 10.4 Dungeon

```
Dungeon {
  floor: number
  seed: number
  width: number   // 50
  height: number  // 50
  theme: DungeonTheme

  // Grid
  tiles: Tile[50][50]

  // Entidades no andar
  enemies: Enemy[]
  items: Item[]
  traps: Trap[]

  // Pontos especiais
  stairsUp: {x, y}
  stairsDown: {x, y}

  // Visão
  revealed: boolean[50][50]
  visible: boolean[50][50]
}

Tile {
  type: enum(Floor, Wall, Door, Stairs, Trap, Water)
  passable: boolean
  opaque: boolean
  sprite: string
}
```

---

## 11. Arquitetura do Sistema

### 11.1 Diagrama de Camadas

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                  │
│  Phaser.js Scenes + Tilemaps + UI Components         │
└─────────────────────┬───────────────────────────────┘
                      │ events / state updates
┌─────────────────────▼───────────────────────────────┐
│                  GAME LOGIC LAYER                    │
│  TurnManager │ CombatSystem │ MagicSystem            │
│  InventorySystem │ ProgressionSystem │ MapSystem     │
└─────────────────────┬───────────────────────────────┘
                      │ queries / mutations
┌─────────────────────▼───────────────────────────────┐
│                   DATA LAYER                         │
│  EntityManager │ DungeonGenerator │ ItemFactory      │
│  SaveManager (sessionStorage) │ RNG                  │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP calls
┌─────────────────────▼───────────────────────────────┐
│                    AI SERVICE LAYER                  │
│  AIService (wrapper para LLM API)                   │
│  Prompts: ItemDescription │ EnemyVariant │ Event     │
└─────────────────────────────────────────────────────┘
```

### 11.2 Gerenciador de Turnos (TurnManager)

Componente central que orquestra o ciclo do jogo:

```
TurnManager:
  - processPlayerAction(action) → resolve efeitos → triggerEnemyTurns()
  - triggerEnemyTurns() → forEach enemy: enemy.aiTick()
  - checkWinLosConditions()
  - emitStateUpdate() → Phaser Scene re-renderiza
```

### 11.3 Comunicação entre Sistemas

Sistemas comunicam-se via **EventEmitter centralizado**:

```
Eventos principais:
  PLAYER_MOVED      → MapSystem atualiza FOG/visão
  PLAYER_ATTACKED   → CombatSystem resolve dano
  ITEM_USED         → InventorySystem aplica efeito
  SPELL_CAST        → MagicSystem resolve feitiço
  ENEMY_DIED        → ProgressionSystem concede XP
  FLOOR_CHANGED     → DungeonGenerator gera novo andar
  PLAYER_DIED       → GameScene → DeathScene
```

---

## 12. Estrutura de Pastas (Phaser.js)

```
dungeon-of-echoes/
├── index.html
├── package.json
├── vite.config.js             ← build tool recomendado com Phaser
│
├── src/
│   ├── main.js                ← bootstrap Phaser + config global
│   │
│   ├── scenes/
│   │   ├── BootScene.js       ← carrega assets, inicializa RNG
│   │   ├── MenuScene.js       ← tela inicial, opções
│   │   ├── CharCreateScene.js ← criação de personagem
│   │   ├── GameScene.js       ← cena principal do jogo
│   │   ├── UIScene.js         ← HUD sobreposta (HP, Mana, Log)
│   │   ├── InventoryScene.js  ← tela de inventário (modal)
│   │   ├── SpellScene.js      ← seleção de magia (modal)
│   │   └── DeathScene.js      ← resumo de partida
│   │
│   ├── systems/
│   │   ├── TurnManager.js
│   │   ├── CombatSystem.js
│   │   ├── MagicSystem.js
│   │   ├── InventorySystem.js
│   │   ├── ProgressionSystem.js
│   │   ├── VisionSystem.js    ← FOG + shadowcasting
│   │   └── EventBus.js        ← EventEmitter central
│   │
│   ├── generators/
│   │   ├── DungeonGenerator.js   ← BSP + corredores
│   │   ├── EnemySpawner.js       ← popula andar com inimigos
│   │   ├── ItemFactory.js        ← cria itens com raridade/afixos
│   │   └── RNG.js                ← gerador determinístico (seedable)
│   │
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   ├── Item.js
│   │   └── Spell.js
│   │
│   ├── ai/
│   │   ├── AIService.js          ← wrapper para API do LLM
│   │   ├── prompts/
│   │   │   ├── itemDescription.js
│   │   │   ├── enemyVariant.js
│   │   │   ├── eventNarrative.js
│   │   │   └── questGenerator.js
│   │   └── BehaviorTree.js       ← IA local de inimigos
│   │
│   ├── ui/
│   │   ├── HUD.js                ← barras HP/Mana, log de mensagens
│   │   ├── Tooltip.js
│   │   ├── MessageLog.js         ← histórico de combate/eventos
│   │   └── MiniMap.js
│   │
│   ├── data/
│   │   ├── enemies.json          ← templates base de inimigos
│   │   ├── items.json            ← templates base de itens
│   │   ├── spells.json           ← lista de magias
│   │   └── lootTables.json       ← tabelas de drop por andar
│   │
│   └── utils/
│       ├── pathfinding.js        ← A* para IA de inimigos
│       ├── geometry.js           ← distância, linha de visão
│       └── constants.js          ← TILE_SIZE, GRID_W, etc.
│
├── assets/
│   ├── tilemaps/
│   │   ├── dungeon.json
│   │   └── dungeon_tileset.png
│   ├── sprites/
│   │   ├── player/
│   │   ├── enemies/
│   │   └── items/
│   ├── audio/
│   │   ├── sfx/
│   │   └── music/
│   └── fonts/
│
└── public/
    └── favicon.ico
```

---

## 13. Integração com IA

### 13.1 Onde a IA é Usada

| Ponto de uso | Trigger | Prompt enviado | Output esperado |
|---|---|---|---|
| Descrição de item épico | Ao criar item Épico | Template + stats do item | Lore de 2–3 linhas |
| Variante de inimigo Elite | Ao spawnar elite (andar 10+) | Tema do andar + nível | Nome, habilidade especial, descrição |
| Evento narrativo | Ao entrar em sala especial | Contexto do andar + stats do jogador | Texto de evento (20–40 palavras) |
| Missão dinâmica | A cada 5 andares | Histórico do jogador | Objetivo simples + recompensa |
| Adaptação de dificuldade | A cada 3 mortes | Métricas do jogador | Sugestão de dificuldade (interna) |
| Causa de morte criativa | Ao morrer | Inimigo + contexto | Texto épico da morte |

### 13.2 Arquitetura do AIService

```javascript
// src/ai/AIService.js
class AIService {
  constructor(apiKey, model = 'claude-haiku-4-5') {}

  async generateItemDescription(item, floor) {}
  async generateEnemyVariant(floor, theme) {}
  async generateNarrativeEvent(context) {}
  async generateQuest(playerHistory) {}
  async generateDeathMessage(cause, playerStats) {}

  // Gerenciamento de cache (evita chamadas repetidas)
  _cache: Map<string, string>

  // Fallback para quando a API não está disponível
  _fallback(type): string {}
}
```

### 13.3 Estratégia de Prompts

**Exemplo — Descrição de Item Épico:**
```
Sistema: Você é o narrador de um RPG dark fantasy medieval.
         Responda apenas com o texto solicitado, sem comentários.

Usuário: Crie uma descrição de lore para este item:
         Nome: Espada de Prata (Épica)
         Stats: +8 Ataque, +3 DEX, Afixo: "Vampírica"
         Andar encontrado: 7 (Cripta Sombria)

         Formato: 2 frases curtas de lore. Tom: sombrio e misterioso.
```

### 13.4 Políticas de Uso

- **Rate limiting:** Máximo 1 chamada de IA por evento de spawning.
- **Cache:** Respostas cacheadas na sessão para itens do mesmo tipo.
- **Fallback obrigatório:** Jogo funciona 100% sem conectividade com IA.
- **Async não-bloqueante:** Chamadas de IA não bloqueiam o loop do jogo.
- **Modelo recomendado:** Claude Haiku (baixa latência, baixo custo para protótipo).

---

## 14. Fluxo Completo de uma Partida

```
1. BOOT
   └── Carrega assets (Phaser BootScene)
   └── Inicializa RNG com timestamp
   └── Verifica disponibilidade da API de IA

2. MENU
   └── Nova Partida / Recordes
   └── Opções (volume, dificuldade)

3. CRIAÇÃO DE PERSONAGEM
   └── Nome + Classe (Warrior / Mage / Rogue)
   └── Distribuição de pontos de atributo
   └── 2 magias iniciais (Mage) ou 0 (outros)
   └── Inventário inicial por classe

4. ANDAR 1 — INICIO
   └── DungeonGenerator.create(floor=1, seed, theme="cave")
   └── Jogador posicionado na escada de entrada
   └── FOG: tudo escuro exceto tile inicial

5. LOOP PRINCIPAL (por turno)
   a. Input do jogador (teclado/mouse)
   b. TurnManager.processPlayerAction(action)
   c. VisionSystem.update() → atualiza FOG
   d. EnemyAI: cada inimigo visível executa tick
   e. Verificações: HP ≤ 0 → DeathScene
   f. UIScene.refresh() → atualiza HUD

6. EVENTOS ESPECIAIS (durante exploração)
   └── Sala com item épico → AIService.generateItemDescription()
   └── Sala de elite → AIService.generateEnemyVariant()
   └── Andar múltiplo de 5 → AIService.generateQuest()

7. DESCIDA DE ANDAR
   └── Player na escada + ação de uso
   └── floor++
   └── DungeonGenerator.create(floor, seed+floor, theme)
   └── Resetar visão → novo FOG
   └── ProgressionSystem: +50 XP

8. MORTE
   └── HP = 0
   └── AIService.generateDeathMessage()
   └── DeathScene: resumo completo
   └── Registro no placar local (localStorage)

9. FIM DE PARTIDA
   └── Retorno ao menu principal
   └── Score persistido localmente
```

---

## 15. Limitações do Projeto (Escopo Acadêmico)

| Limitação | Justificativa |
|---|---|
| Sem persistência entre sessões | Simplifica implementação; foco no loop de jogo |
| Sem multiplayer | Fora do escopo técnico e de tempo |
| IA generativa limitada a texto | Geração de imagens não é viável em tempo acadêmico |
| Sem sistema de lojas complexo | Simplificado ou removido na v1 |
| Sem boss formal na v1 | Inimigos elite servem como desafio final |
| Sem áudio dinâmico | Trilha sonora estática; SFX básico |
| API de IA via chave exposta no frontend | Aceitável para protótipo; inaceitável em produção |
| Pathfinding A* simples | Sem hierarquias de navegação para grandes grupos |
| Sem animações de combate complexas | Resolução instantânea com feedback visual simples |
| Testes automatizados mínimos | Foco na entrega do protótipo funcional |

---

## 16. Possíveis Melhorias Futuras

### Curto Prazo (pós-entrega acadêmica)

- [ ] Sistema de lojas com NPCs em andares especiais
- [ ] Classes adicionais (Paladino, Ladino, Druida)
- [ ] Missões com múltiplos objetivos
- [ ] Tela de opções de acessibilidade (tamanho de fonte, contraste)
- [ ] Suporte a gamepad

### Médio Prazo

- [ ] Backend próprio como proxy para a API de IA (segurança)
- [ ] Placar online com ranking global
- [ ] Sistema de conquistas
- [ ] Modos de jogo alternativos (corrida cronometrada, modo hardcore)
- [ ] Editor de dungeon para criadores de conteúdo

### Longo Prazo

- [ ] IA para geração de mapas inteiros (substituir BSP)
- [ ] Diálogos com NPCs via LLM
- [ ] Sistema de crafting baseado em ingredientes de itens
- [ ] Modo cooperativo assíncrono (via replays/ghosts)
- [ ] Versão mobile responsiva

---

## Apêndice A — Tabela de Inimigos Base

| Nome | Andar | HP | Ataque | Defesa | XP | Comportamento |
|---|---|---|---|---|---|---|
| Rato Gigante | 1–2 | 8 | 2 | 0 | 5 | IDLE/CHASING |
| Goblin | 1–3 | 12 | 4 | 1 | 10 | CHASING |
| Esqueleto | 2–4 | 15 | 5 | 2 | 15 | CHASING |
| Goblin Arqueiro | 3–5 | 10 | 6 | 1 | 20 | RANGED/FLEEING |
| Orc | 4–6 | 25 | 8 | 4 | 30 | CHASING |
| Kobold Mago | 4–7 | 12 | 10 | 2 | 35 | RANGED/COOLDOWN |
| Zumbi | 5–7 | 30 | 7 | 3 | 25 | SLOW/CHASING |
| Troll | 6–8 | 45 | 12 | 5 | 60 | CHASING/REGEN |
| Vampiro | 7–9 | 35 | 14 | 6 | 80 | DRAIN/FLEEING |
| Mago Sombrio | 7–10 | 20 | 16 | 4 | 90 | SPELLS/FLEE |

---

## Apêndice B — Tabela de Magias Expandida

| Magia | Nível Mínimo | Escola | Mana | Range | Área | Dano/Efeito |
|---|---|---|---|---|---|---|
| Dardo Mágico | 1 | Evocação | 3 | 5 | 1 | 1d6+INT |
| Cura Menor | 1 | Restauração | 5 | Self | 1 | +1d8+WIS HP |
| Identificar | 1 | Divinação | 6 | Touch | 1 | Identifica item |
| Escudo Mágico | 2 | Abjuração | 7 | Self | 1 | +5 DEF/10t |
| Paralisar | 3 | Encantamento | 8 | 4 | 1 | Stun 2 turnos |
| Drenar Vida | 3 | Necromância | 9 | 3 | 1 | Roubo de HP |
| Bola de Fogo | 4 | Evocação | 10 | 6 | 3×3 | 2d8 dano |
| Clarividência | 5 | Divinação | 12 | Self | Mapa | Revela andar |
| Teleporte | 5 | Translação | 15 | Mapa | 1 | Move aleatório |
| Invocar Criatura | 7 | Conjuração | 20 | Adjacent | 1 | Aliado temporário |

---

*Documento versão 1.0 — Dungeon of Echoes — Projeto Acadêmico 2026*
