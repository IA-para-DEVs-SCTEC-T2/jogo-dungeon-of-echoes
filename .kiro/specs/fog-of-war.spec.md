# Spec: Fog of War

**Versão:** 0.1  
**Status:** Rascunho  
**Relacionado a:** dungeon.spec.md, player.spec.md, gameloop.spec.md

---

## Descrição

O sistema de Fog of War controla a visibilidade dos tiles da dungeon a partir da perspectiva do player. Cada tile do grid possui um estado de visibilidade que determina como ele é renderizado. O objetivo é criar tensão de exploração: o player só vê o que está ao seu redor imediato e lembra (de forma atenuada) o que já visitou, mas nunca sabe o que está além do alcance da visão atual.

O sistema é puramente visual e de estado — não altera a lógica de movimento, combate ou IA. Inimigos fora do campo de visão atual não são renderizados, mesmo que já tenham sido vistos antes.

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **FogSystem** | Sistema responsável por calcular e manter o estado de visibilidade de todos os tiles |
| **VisibilityState** | Enum com três valores: `HIDDEN`, `VISIBLE`, `REVEALED` |
| **HIDDEN** | Tile nunca visto pelo player; renderizado como preto sólido |
| **REVEALED** | Tile já visitado mas fora do campo de visão atual; renderizado com overlay escuro semitransparente |
| **VISIBLE** | Tile dentro do campo de visão atual do player; renderizado normalmente |
| **visionRadius** | Raio em tiles ao redor do player que define o campo de visão atual (padrão: 5) |
| **FogOverlay** | Camada de renderização (Phaser Graphics ou array de retângulos) que aplica os efeitos visuais de fog |
| **visibilityGrid** | Matriz 2D de `VisibilityState` com as mesmas dimensões do grid da dungeon |
| **Campo de visão** | Conjunto de tiles dentro do `visionRadius` do player, calculado por distância de Chebyshev |

---

## Atributos

### FogSystem

| Atributo | Tipo | Descrição |
|----------|------|-----------|
| `visibilityGrid` | `VisibilityState[][]` | Matriz com o estado de cada tile; inicializada como `HIDDEN` |
| `visionRadius` | `number` | Raio de visão do player em tiles (padrão: `5`) |
| `width` | `number` | Largura do grid (espelha `DungeonGenerator.width`) |
| `height` | `number` | Altura do grid (espelha `DungeonGenerator.height`) |

### Constante adicionada em `constants.ts`

```typescript
export const FOG = {
  VISION_RADIUS: 5,
  HIDDEN_ALPHA: 1.0,    // overlay totalmente opaco (preto)
  REVEALED_ALPHA: 0.6,  // overlay semitransparente (escurecido)
  VISIBLE_ALPHA: 0.0,   // sem overlay (tile visível normalmente)
  OVERLAY_COLOR: 0x000000,
} as const;
```

---

## Inputs

| Input | Origem | Descrição |
|-------|--------|-----------|
| `playerGridX`, `playerGridY` | `Player.gridX`, `Player.gridY` | Posição atual do player no grid |
| `EVENTS.PLAYER_MOVED` | EventBus | Dispara recálculo de visibilidade após cada movimento |
| `dungeon.grid` | `DungeonGenerator` | Grid de tiles para determinar quais posições são válidas |
| `dungeon.rooms` | `DungeonGenerator` | Lista de salas para o comportamento de revelação de sala inteira |
| `visionRadius` | `FOG.VISION_RADIUS` | Constante configurável que define o alcance da visão |

---

## Outputs

| Output | Destino | Descrição |
|--------|---------|-----------|
| `visibilityGrid` | `FogOverlay` (renderização) | Estado atualizado de cada tile após movimento |
| Atualização visual do `FogOverlay` | Phaser (GameScene) | Overlay redesenhado a cada turno com alphas corretos por estado |
| Visibilidade de sprites de inimigos | `EnemySystem.sprite` | Sprites de inimigos ficam visíveis apenas em tiles `VISIBLE` |

---

## Regras

### R1 — Inicialização

- THE **FogSystem** SHALL inicializar o `visibilityGrid` com todos os tiles no estado `HIDDEN` ao criar uma nova dungeon.
- THE **FogSystem** SHALL calcular a visibilidade inicial a partir da posição de spawn do player imediatamente após a inicialização, antes do primeiro frame renderizado.

### R2 — Cálculo de Visibilidade

- WHEN o player se move para um novo tile, THE **FogSystem** SHALL recalcular o campo de visão a partir da nova posição.
- THE **FogSystem** SHALL usar distância de **Chebyshev** (máximo entre `|dx|` e `|dy|`) para determinar quais tiles estão dentro do `visionRadius`, produzindo um campo de visão quadrado.
- THE **FogSystem** SHALL marcar como `VISIBLE` todos os tiles dentro do `visionRadius` que estejam dentro dos limites do grid.
- THE **FogSystem** SHALL marcar como `REVEALED` todos os tiles que estavam `VISIBLE` no turno anterior e agora estão fora do `visionRadius`.
- THE **FogSystem** SHALL nunca reverter um tile de `REVEALED` para `HIDDEN`.
- THE **FogSystem** SHALL nunca reverter um tile de `VISIBLE` para `HIDDEN` diretamente — a transição obrigatória é `VISIBLE → REVEALED`.

### R3 — Renderização por Estado

| Estado | Tile (chão/parede) | Sprites (inimigos, itens) |
|--------|--------------------|--------------------------|
| `HIDDEN` | Overlay preto sólido (`alpha = 1.0`) | Não renderizados |
| `REVEALED` | Overlay preto semitransparente (`alpha = 0.6`) | Não renderizados |
| `VISIBLE` | Sem overlay (`alpha = 0.0`) | Renderizados normalmente |

- THE **FogOverlay** SHALL atualizar os alphas do overlay a cada vez que o `visibilityGrid` for recalculado.
- THE **FogOverlay** SHALL renderizar em depth superior aos tiles e sprites de inimigos, mas inferior ao sprite do player e ao HUD.
- THE **FogSystem** SHALL ocultar sprites de inimigos (`setVisible(false)`) quando o tile que o inimigo ocupa não estiver no estado `VISIBLE`.
- THE **FogSystem** SHALL exibir sprites de inimigos (`setVisible(true)`) quando o tile que o inimigo ocupa estiver no estado `VISIBLE`.

### R4 — Comportamento em Salas

- WHEN o player entra em uma sala (qualquer tile pertencente a um `Room`), THE **FogSystem** SHALL revelar todos os tiles daquela sala imediatamente, independentemente do `visionRadius`.
- Os tiles da sala revelada desta forma recebem estado `VISIBLE` enquanto o player estiver dentro da sala, e transitam para `REVEALED` quando o player sair.
- Corredores seguem apenas a regra do `visionRadius` — não são revelados em bloco.

### R5 — Persistência por Sessão

- THE **FogSystem** SHALL manter o `visibilityGrid` durante toda a sessão de jogo (não reseta entre turnos).
- WHEN uma nova partida é iniciada (restart), THE **FogSystem** SHALL reinicializar o `visibilityGrid` completamente para `HIDDEN`.

### R6 — Separação de Responsabilidades

- THE **FogSystem** SHALL ser implementado como sistema independente, sem importar cenas Phaser.
- THE **FogSystem** SHALL expor métodos puros para cálculo de visibilidade, testáveis sem instanciar `GameScene`.
- THE **GameScene** SHALL ser responsável por aplicar os resultados do `FogSystem` ao `FogOverlay` e aos sprites.

---

## Casos de Erro

| Situação | Comportamento esperado |
|----------|----------------------|
| Player em posição fora dos limites do grid | `FogSystem` ignora o cálculo e mantém o estado anterior; não lança exceção |
| `visionRadius` igual a 0 | Apenas o tile do próprio player fica `VISIBLE`; todos os outros permanecem `HIDDEN` ou `REVEALED` |
| `visionRadius` negativo | `FogSystem` trata como `0`; nenhum tile adicional é marcado `VISIBLE` |
| Grid não inicializado (dungeon não gerada) | `FogSystem` não executa cálculo; aguarda inicialização explícita |
| Inimigo em tile `REVEALED` que o player já viu | Sprite do inimigo fica oculto — o player não sabe a posição atual do inimigo |

---

## Cenários Testáveis

### CT-01 — Inicialização: todos os tiles começam como HIDDEN

**Dado** que uma nova dungeon foi gerada  
**Quando** o `FogSystem` é inicializado  
**Então** todos os tiles do `visibilityGrid` devem ter estado `HIDDEN`

```typescript
const fog = new FogSystem(dungeon.width, dungeon.height);
fog.init();
for (let y = 0; y < dungeon.height; y++) {
  for (let x = 0; x < dungeon.width; x++) {
    expect(fog.getState(x, y)).toBe(VisibilityState.HIDDEN);
  }
}
```

---

### CT-02 — Visibilidade inicial calculada na posição de spawn

**Dado** que o player spawna em `(startPos.x, startPos.y)`  
**Quando** `fog.updateVisibility(startPos.x, startPos.y)` é chamado  
**Então** o tile do player deve ser `VISIBLE`  
**E** todos os tiles dentro do `visionRadius` (distância de Chebyshev ≤ 5) devem ser `VISIBLE`

```typescript
fog.updateVisibility(player.gridX, player.gridY);
expect(fog.getState(player.gridX, player.gridY)).toBe(VisibilityState.VISIBLE);
// tile a 5 tiles de distância (Chebyshev)
expect(fog.getState(player.gridX + 5, player.gridY)).toBe(VisibilityState.VISIBLE);
// tile a 6 tiles de distância
expect(fog.getState(player.gridX + 6, player.gridY)).toBe(VisibilityState.HIDDEN);
```

---

### CT-03 — Transição VISIBLE → REVEALED ao sair do campo de visão

**Dado** que o player está em `(10, 10)` e o tile `(10, 16)` está `VISIBLE`  
**Quando** o player se move para `(10, 11)` (tile `(10, 16)` agora está a 5 tiles de distância — fora do raio)  
**Então** o tile `(10, 16)` deve transitar para `REVEALED`  
**E** nunca deve voltar para `HIDDEN`

```typescript
fog.updateVisibility(10, 10);
expect(fog.getState(10, 16)).toBe(VisibilityState.VISIBLE); // distância Chebyshev = 6? ajustar conforme radius
fog.updateVisibility(10, 11);
expect(fog.getState(10, 16)).toBe(VisibilityState.REVEALED);
fog.updateVisibility(10, 0); // player vai para longe
expect(fog.getState(10, 16)).toBe(VisibilityState.REVEALED); // nunca volta a HIDDEN
```

---

### CT-04 — Tile REVEALED nunca regride para HIDDEN

**Dado** que o tile `(5, 5)` foi visitado e está `REVEALED`  
**Quando** o player se move para qualquer posição que não inclua `(5, 5)` no campo de visão  
**Então** o tile `(5, 5)` deve permanecer `REVEALED`

**Propriedade (property-based):** Para qualquer sequência de movimentos do player, um tile que já atingiu `REVEALED` nunca deve retornar a `HIDDEN`.

---

### CT-05 — Revelação de sala inteira ao entrar

**Dado** que existe uma sala com bounds `{ x: 5, y: 5, width: 6, height: 4 }`  
**E** o player está fora da sala com `visionRadius = 5`  
**Quando** o player entra em qualquer tile da sala  
**Então** todos os tiles da sala devem estar `VISIBLE`  
**Incluindo** tiles da sala que estão além do `visionRadius`

```typescript
// Player entra no canto da sala (5, 5); tile (10, 8) está a mais de 5 tiles
fog.updateVisibility(5, 5, dungeon.rooms);
expect(fog.getState(10, 8)).toBe(VisibilityState.VISIBLE);
```

---

### CT-06 — Corredor não é revelado em bloco

**Dado** que existe um corredor de tiles entre duas salas  
**Quando** o player está em um tile do corredor  
**Então** apenas os tiles dentro do `visionRadius` do corredor devem ser `VISIBLE`  
**E** tiles do corredor além do `visionRadius` devem permanecer `HIDDEN` ou `REVEALED`

---

### CT-07 — Inimigo em tile VISIBLE é renderizado; em REVEALED é oculto

**Dado** que um inimigo está no tile `(8, 8)`  
**Quando** o tile `(8, 8)` está `VISIBLE`  
**Então** `enemy.sprite.visible` deve ser `true`

**Quando** o player se move e o tile `(8, 8)` transita para `REVEALED`  
**Então** `enemy.sprite.visible` deve ser `false`

---

### CT-08 — Reinício reseta o visibilityGrid

**Dado** que o player explorou parte da dungeon (vários tiles em `REVEALED`)  
**Quando** uma nova partida é iniciada  
**Então** todos os tiles do `visibilityGrid` devem retornar a `HIDDEN`

---

### CT-09 — visionRadius = 0 revela apenas o tile do player

**Dado** que `visionRadius = 0`  
**Quando** `fog.updateVisibility(10, 10)` é chamado  
**Então** apenas o tile `(10, 10)` deve ser `VISIBLE`  
**E** todos os outros tiles devem ser `HIDDEN` ou `REVEALED`

---

### CT-10 — Propriedade de monotonicidade do estado

**Propriedade (property-based):** Para qualquer tile `(x, y)`, a sequência de estados ao longo do tempo deve ser monotônica no sentido `HIDDEN → VISIBLE → REVEALED`. Nenhuma transição inversa é permitida.

Formalmente: se `state(x, y)` em `t₁` é `REVEALED`, então `state(x, y)` em qualquer `t₂ > t₁` deve ser `REVEALED` ou `VISIBLE` (nunca `HIDDEN`).

---

## Integração com Sistemas Existentes

### GameScene

- Instanciar `FogSystem` em `_initSystems()` junto com `DungeonGenerator` e `Player`
- Chamar `fog.updateVisibility(player.gridX, player.gridY, dungeon.rooms)` após cada movimento bem-sucedido do player (dentro de `_handleInput`)
- Aplicar o resultado ao `FogOverlay` e atualizar `setVisible()` dos sprites de inimigos

### EventBus

- Escutar `EVENTS.PLAYER_MOVED` para disparar o recálculo de visibilidade de forma desacoplada

### constants.ts

- Adicionar a constante `FOG` com `VISION_RADIUS`, `HIDDEN_ALPHA`, `REVEALED_ALPHA`, `VISIBLE_ALPHA` e `OVERLAY_COLOR`

### EnemySystem

- Nenhuma alteração na lógica de IA — inimigos continuam se movendo normalmente mesmo em tiles `HIDDEN`
- A ocultação é puramente visual (controlada pelo `FogSystem` via `sprite.setVisible()`)

---

## Notas de Implementação

- **Distância de Chebyshev** (`max(|dx|, |dy|)`) produz campo de visão quadrado, consistente com o movimento 4-direcional do jogo. Alternativa: distância euclidiana para campo circular (mais custosa, menos idiomática para roguelikes tile-based).
- O `FogOverlay` pode ser implementado como um array de `Phaser.GameObjects.Rectangle` (um por tile) ou como um único `Phaser.GameObjects.Graphics` redesenhado a cada turno. A abordagem de retângulos individuais é mais simples de atualizar incrementalmente.
- O `FogSystem` deve ser testável sem Phaser: a lógica de cálculo de `visibilityGrid` não deve depender de objetos de cena.
- Depth sugerido para o overlay: `1` (acima dos tiles de chão/parede em depth `0`, abaixo dos sprites de inimigos em depth `5` e do player em depth `10`).
