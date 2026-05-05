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
| PlayerSystem | Atributos, HP/Mana, posição, movimento |
| DungeonSystem | Geração procedural BSP, tiles, FOG of War |
| EnemySystem | Spawn, estados de IA (IDLE/CHASING/ATTACKING) |
| CombatSystem | Resolução de ataque, dano, morte |
| XPSystem | Ganho de XP, cálculo de nível, level up |

### Funcionalidades do Jogador
- 3 classes: Warrior, Mage, Rogue
- 6 atributos: STR, INT, DEX, CON, WIS, CHA
- HP e Mana derivados dos atributos
- Movimento por teclado (setas ou WASD) no grid

### Dungeon
- Geração por BSP (Binary Space Partitioning) com corredores L-shaped
- FOG of War: tiles não visitados escuros, visitados em cinza, visíveis em destaque
- Escadas de entrada e saída em cada andar
- Temas visuais por faixa de andares (caverna, ruínas, cripta)

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

- Inventário com slots de equipamento e itens no chão
- Sistema de magia com slots e custo de mana
- Identificação de itens (poções, pergaminhos, anéis)
- IA generativa para descrições de itens épicos e variantes de inimigos elite
- Múltiplos andares com progressão de dificuldade
- Árvore de habilidades por classe
- Sistema de save / placar local

## Diferenciais

- **100% client-side**: sem backend, sem instalação, roda em qualquer navegador moderno
- **Arquitetura modular**: cada sistema é independente e testável isoladamente
- **Spec-driven**: nenhuma feature existe sem especificação correspondente em `.kiro/specs/`
- **Preparado para IA**: hooks e estrutura de pastas prontos para integração com LLM (Claude Haiku)
- **Permadeath real**: sem save entre sessões, cada partida é única
- **Fidelidade ao clássico**: mecânicas fiéis ao Castle of the Winds com modernização visual via Phaser 4
