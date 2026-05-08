# Product — Dungeon of Echoes

## Visão do Produto

Dungeon of Echoes é um RPG roguelike tile-based jogado inteiramente no navegador. Inspirado no clássico Castle of the Winds (1989–1993), o jogo combina exploração de masmorras geradas proceduralmente com combate turn-based e progressão de personagem. O MVP entrega uma experiência jogável e coesa, priorizando mecânicas sólidas antes de qualquer complexidade adicional.

O projeto é de contexto acadêmico e serve como demonstração de arquitetura modular em JavaScript com Phaser 4, com estrutura preparada para integração futura de IA generativa.

## Público-Alvo

- Jogadores familiarizados com RPGs clássicos e roguelikes (nethack, Castle of the Winds, Angband)
- Desenvolvedores e avaliadores acadêmicos interessados em arquitetura de jogos com JS/Phaser
- Entusiastas de jogos browser-based sem necessidade de instalação

## Core Gameplay

O loop central é turn-based e tile-based:

1. O jogador explora um mapa de dungeon gerado proceduralmente (grid 50×50)
2. Cada ação (mover, atacar, usar item, esperar) consome um turno
3. Após a ação do jogador, todos os inimigos visíveis executam seu turno
4. O jogador ganha XP ao derrotar inimigos e avança de nível distribuindo atributos
5. Ao encontrar a escada, desce para um andar mais difícil
6. Morte é permanente (permadeath) — cada sessão começa do zero

**Ciclo de turno:**
```
Input do jogador → Resolve ação → Atualiza visão (FOG) → Turno dos inimigos → Verifica condições → Atualiza HUD
```

## Principais Funcionalidades (MVP)

### Sistemas Implementados
| Sistema | Responsabilidade |
|---------|-----------------|
| PlayerSystem | Atributos, HP/Mana, gold, bônus de equipamento acumulados em `_equipmentBonuses`; `recalcStats()` como fonte de verdade |
| DungeonSystem | Geração procedural BSP, tiles, FOG of War |
| EnemySystem | Spawn, estados de IA (IDLE/CHASING/ATTACKING) |
| CombatSystem | Resolução de ataque, dano, morte |
| XPSystem | Ganho de XP, cálculo de nível, level up |
| InventorySystem | 20 slots, roguelike identification, `useItem()`, `addItem()`, `removeItem()` |
| EquipmentSystem | 6 slots (helmet/shield/sword/pants/boots/amulet); equip/unequip com eventos; armazena IDs |
| ShopSystem | Compra/venda catalog-driven; `buildViewModel()` + `buildSellItems()` para UI; sem lógica de cena |
| InputModeManager | Stack-based: GAMEPLAY / INVENTORY / SHOP / DIALOG — `push()` / `pop()` / `is()` |
| CityLayoutProcessor | Pipeline TOWN_CONFIG → ProcessedTownLayout; atribui biomas e resolve tile visuals |
| TileVariantResolver | Seleção determinística de frame por posição + bioma (hash xorshift + peso) |
| NPCController | FSM Idle → Wander para NPCs da cidade; `customWanderBounds` por NPC |
| InteractiveObjectSystem | Detecta proximidade player↔NPC; respeita `houseBounds`; dispara SHOP_OPENED ou DIALOG_OPENED |
| CityDecorationSystem | Renderização de objetos do mundo com Y-sort automático |

### Funcionalidades do Jogador
- 3 classes: Warrior, Mage, Rogue
- 6 atributos: STR, INT, DEX, CON, WIS, CHA
- HP e Mana derivados dos atributos; stats recalculados ao equipar/desequipar
- Movimento por teclado (setas ou WASD) no grid
- Gold (começa com 500) exibido no HUD; atualizado em tempo real

### Comércio e Equipamentos
- **Loja do Mercador**: 2 abas (Comprar / Vender); navegação por teclado e mouse
- **Catálogo**: 18 itens (espadas, capacetes, escudos, calças, botas, amuletos + poções)
- **Bônus de stat**: itens equipáveis adicionam `attack`, `maxHp`, `con` etc. de forma reversível
- **Inventário visual** (`I`): 3 colunas (slots de equipamento / lista de itens / detalhes); `E` equipa ou desequipa, `U` usa, `D` dropa

### NPCs e Diálogos
- **Mercador**: abre loja ao interagir (dentro do edifício)
- **Guarda**: menu de ajuda com objetivos, controles e dicas
- **Taberneiro**: menu de descanso — 20 ouros restauram HP e Mana ao máximo
- **Gato**: vaga livremente pela cidade respeitando paredes

### Dungeon
- Geração por BSP (Binary Space Partitioning) com corredores L-shaped
- FOG of War: tiles não visitados escuros, visitados em cinza, visíveis em destaque
- Escadas de entrada e saída em cada andar
- Temas visuais por faixa de andares (caverna, ruínas, cripta)

### Cidade (Town)
- Layout fixo processado por `CityLayoutProcessor`: biomas por região (urban, natural, interior, transition)
- Tiles de chão com variantes visuais determinísticas por posição (sem magic frame numbers no código)
- NPCs com comportamento de wander configurável (`wanderBounds`); Guard é estático
- Objetos interativos (portas, signs) com prompt de interação por proximidade
- Objetos do mundo (árvores, barris) com Y-sort automático para profundidade correta

### Inimigos
- Inimigos com estados de IA: IDLE → ALERTED → CHASING → ATTACKING → FLEEING
- Raio de detecção configurável
- Tabela de inimigos por andar (Rato Gigante, Goblin, Esqueleto, Orc, Troll...)
- Recompensa de XP ao morrer

### Progressão
- XP necessário: `100 × N × (N + 1) / 2`
- Level up: +3 pontos de atributo para distribuir
- HP e Mana recalculados automaticamente

## Funcionalidades Fora do MVP (Planejadas)

Estas features **não estão no escopo atual** mas o código deve ser estruturado para suportá-las:

- Sistema de magia com slots e custo de mana
- Identificação de itens (pergaminhos, anéis)
- IA generativa para descrições de itens épicos e variantes de inimigos elite
- Árvore de habilidades por classe
- Sistema de save / placar local

## Diferenciais

- **100% client-side**: sem backend, sem instalação, roda em qualquer navegador moderno
- **Arquitetura modular**: cada sistema é independente e testável isoladamente
- **Spec-driven**: nenhuma feature existe sem especificação correspondente em `.kiro/specs/`
- **Preparado para IA**: hooks e estrutura de pastas prontos para integração com LLM (Claude Haiku)
- **Permadeath real**: sem save entre sessões, cada partida é única
- **Fidelidade ao clássico**: mecânicas fiéis ao Castle of the Winds com modernização visual via Phaser 4
