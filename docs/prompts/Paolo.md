## Prompt 1 — feat: variantes de chão aleatórias por sessão
Autor: Paolo
Data: 2026-05-03

Prompt exato utilizado:
> "faça com que cada sessão gerada as imagens do chão sejam permutadas entre sim para gerar ambientes com chão completamente diferente a cada nova rodada."

O que foi feito:

1. Verificadas as dimensões do spritesheet `Ground0.png` (128×112px = 56 frames de 16×16px).

2. Em `src/utils/constants.ts`:
   - Adicionado array `FLOOR_VARIANTS` com 14 frames distintos do `Ground0.png`, representando terrenos variados: pedra cinza, pedra escura, pedra azulada, terra marrom, grama, areia, lama, neve e rocha vulcânica.

3. Em `src/scenes/GameScene.ts`:
   - Adicionada propriedade `floorFrame` na classe `GameScene`.
   - No método `create()`, um frame é sorteado aleatoriamente do array `FLOOR_VARIANTS` a cada nova sessão.
   - O método `_renderDungeon()` passou a usar `this.floorFrame` em vez do frame fixo `DAWNLIKE_FRAMES.FLOOR`.

Resultado:
Cada nova partida (incluindo ao clicar "Jogar Novamente") gera um ambiente com chão visualmente diferente, sem impacto na lógica de jogo ou nos testes existentes (48 testes passando).

Branch criada: `feature/floor-variants`

---

## Prompt 3 — refactor: reorganização da arquitetura de specs e steering
Autor: Paolo
Data: 2026-05-04

Prompt exato utilizado:
> "Agora a estrutura de pastas para steering e specs segundo o kiro está correta?"
> "faça por gentileza"

O que foi feito:

1. Identificado que os arquivos `*.spec.md` estavam em `.kiro/steering/` misturados com as diretrizes do projeto.
2. Movidos todos os arquivos de spec para `.kiro/specs/`:
   - `player.spec.md`, `dungeon.spec.md`, `enemy.spec.md`, `combat.spec.md`, `xp.spec.md`, `gameloop.spec.md`, `input.spec.md`
3. Identificado que o `game-steering.md` havia sido deletado em commit anterior (`509b805`).
4. Recriado o `.kiro/steering/game-steering.md` com conteúdo recuperado do histórico git, atualizado para refletir a stack atual (TypeScript, estrutura de pastas correta).

Resultado:
Estrutura `.kiro/` agora segue o padrão correto do Kiro:
- `.kiro/steering/` → apenas diretrizes gerais (`game-steering.md`)
- `.kiro/specs/` → todas as especificações de sistemas do jogo
