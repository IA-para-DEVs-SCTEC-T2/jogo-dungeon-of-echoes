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