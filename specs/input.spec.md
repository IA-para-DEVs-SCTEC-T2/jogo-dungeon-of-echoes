# Game Steering — Dungeon of Echoes

## Objetivo do Jogo

Dungeon of Echoes é um RPG 2D tile-based jogado no navegador. O jogador explora masmorras geradas proceduralmente, enfrenta inimigos, ganha XP e avança de nível. O MVP foca em mecânicas jogáveis e sólidas antes de qualquer complexidade adicional.

## Princípios de Desenvolvimento

### 1. Simplicidade Primeiro
- Cada sistema deve fazer uma coisa bem feita
- Evitar over-engineering: se não está na spec, não implementar
- Código legível vale mais que código "inteligente"

### 2. Modularidade
- Cada sistema (Player, Dungeon, Enemy, Combat, XP) vive em seu próprio módulo
- Comunicação entre sistemas via eventos Phaser ou referências diretas simples
- Nenhum módulo deve conhecer os detalhes internos de outro

### 3. Código Guiado por Specs
- Nenhuma feature é implementada sem spec correspondente
- A spec define o comportamento esperado; o código o realiza
- Testes (quando existirem) validam a spec, não o código

### 4. Iteração Incremental
- MVP primeiro, expansão depois
- Cada iteração deve resultar em algo jogável
- Não bloquear progresso por features futuras

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Engine | Phaser 3 |
| Linguagem | JavaScript (ES Modules) |
| Build | Vite |
| Testes | Vitest (futuro) |
| Qualidade | Husky + Commitlint |

## Restrições do MVP

- **Sem IA generativa** neste estágio (preparar hooks para expansão futura)
- **Sem banco de dados** — estado apenas em memória durante a sessão
- **Sem servidor backend** — jogo 100% client-side
- **Sem animações complexas** — sprites simples ou formas geométricas são suficientes
- **Sem sistema de save** — cada sessão começa do zero

## Estrutura de Pastas

```
/src
  /scenes       → Cenas Phaser (Boot, Game, GameOver)
  /systems      → Lógica de jogo (Player, Dungeon, Enemy, Combat, XP)
  /config       → Constantes e configurações globais
/specs          → Especificações de cada sistema
/steering       → Arquivos de direcionamento do projeto
/tests          → Testes unitários (futuro)
/public         → Assets estáticos
```

## Fluxo de Desenvolvimento

1. Escrever/revisar spec do sistema
2. Implementar o sistema seguindo a spec
3. Integrar na cena principal
4. Validar manualmente o comportamento
5. (Futuro) Escrever testes automatizados

## Expansões Futuras Planejadas

Estes sistemas NÃO fazem parte do MVP mas o código deve ser estruturado para suportá-los:

- **Inventário**: slots de equipamento, itens no chão
- **Habilidades**: árvore de habilidades por classe
- **IA de Inimigos**: pathfinding A*, comportamentos variados
- **Múltiplos andares**: progressão de dungeon
- **Narrativa por IA**: lores geradas por LLM (conforme README original)
