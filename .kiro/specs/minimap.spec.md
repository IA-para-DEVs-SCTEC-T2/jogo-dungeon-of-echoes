# Spec — Minimap

**Versão:** 0.1  
**Status:** Rascunho  
**Relacionado a:** fog-of-war.spec.md, player.spec.md, gameloop.spec.md, enemy.spec.md

---

## Descrição

O Minimap é um overlay fixo renderizado na UIScene que exibe uma representação reduzida do grid da dungeon no canto superior direito da tela. Ele integra o estado do Fog of War para mostrar apenas o que o player já descobriu, e marca a posição do player e dos inimigos visíveis em tempo real.

O Minimap é puramente visual — não interfere na lógica de movimento, combate, IA ou Fog of War. Ele consome o `visibilityGrid` do `FogSystem` e as posições das entidades para compor sua renderização a cada turno.

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **Minimap** | Componente visual que exibe o mapa em escala reduzida como overlay fixo na tela |
| **MinimapRenderer** | Classe responsável por renderizar o Minimap dentro da UIScene |
| **tileSize** | Tamanho em pixels de cada tile no Minimap (padrão: `2px`) |
| **minimapSize** | Dimensão total do Minimap em pixels (padrão: `80×80px`, cobrindo o grid 40×40 com `tileSize = 2`) |
| **minimapOrigin** | Posição do canto superior esquerdo do Minimap na tela (fixo, independente da câmera) |
| **playerMarker** | Ponto colorido (azul) que indica a posição atual do player no Minimap |
| **enemyMarker** | Ponto colorido (vermelho) que indica a posição de um inimigo em tile `VISIBLE` |
| **VisibilityState** | Enum definido em fog-of-war.spec.md: `HIDDEN`, `VISIBLE`, `REVEALED` |

---

## Atributos

### MinimapRenderer

| Atributo | Tipo | Valor Padrão | Descrição |
|----------|------|--------------|-----------|
| `x` | `number` | calculado (ver R1) | Posição X do canto superior esquerdo do Minimap na tela |
| `y` | `number` | `8` | Posição Y do canto superior esquerdo do Minimap na tela |
| `tileSize` | `number` | `2` | Pixels por tile no Minimap |
| `width` | `number` | `80` | Largura total do Minimap em pixels (`dungeon.width × tileSize`) |
| `height` | `number` | `80` | Altura total do Minimap em pixels (`dungeon.height × tileSize`) |
| `borderThickness` | `number` | `1` | Espessura da borda em pixels |
| `borderColor` | `number` | `0xaaaaaa` | Cor da borda (cinza claro) |

### Constante adicionada em `constants.ts`

```typescript
export const MINIMAP = {
  TILE_SIZE: 2,           // pixels por tile no minimap
  MARGIN: 8,              // distância das bordas da tela (px)
  BORDER_THICKNESS: 1,
  BORDER_COLOR: 0xaaaaaa,
  COLOR_HIDDEN: 0x000000,    // preto — tile nunca visto
  COLOR_REVEALED: 0x333333,  // cinza escuro — tile visitado mas fora de visão
  COLOR_VISIBLE: 0x888888,   // cinza claro — tile dentro do campo de visão atual
  COLOR_PLAYER: 0x0088ff,    // azul — marcador do player
  COLOR_ENEMY: 0xff2222,     // vermelho — marcador de inimigo visível
} as const;
```

---

## Inputs

| Input | Origem | Descrição |
|-------|--------|-----------|
| `visibilityGrid` | `FogSystem.visibilityGrid` | Estado de visibilidade de cada tile (`HIDDEN`, `VISIBLE`, `REVEALED`) |
| `playerGridX`, `playerGridY` | `Player.gridX`, `Player.gridY` | Posição atual do player no grid |
| `enemies` | `EnemySystem[]` | Lista de inimigos com `gridX`, `gridY`, `alive` |
| `dungeon.width`, `dungeon.height` | `DungeonGenerator` | Dimensões do grid para calcular escala |
| `EVENTS.PLAYER_MOVED` | EventBus | Dispara atualização do Minimap após movimento do player |
| `EVENTS.PLAYER_ATTACKED` | EventBus | Dispara atualização do Minimap após ação de combate |
| `EVENTS.ENEMY_DIED` | EventBus | Dispara atualização do Minimap para remover marcador de inimigo morto |

---

## Outputs

| Output | Destino | Descrição |
|--------|---------|-----------|
| Tiles coloridos por estado de visibilidade | Phaser Graphics (UIScene) | Grid reduzido com cores por `VisibilityState` |
| `playerMarker` | Phaser Graphics (UIScene) | Ponto azul na posição do player |
| `enemyMarker` (0..N) | Phaser Graphics (UIScene) | Pontos vermelhos nas posições de inimigos em tiles `VISIBLE` |
| Borda do Minimap | Phaser Graphics (UIScene) | Retângulo de borda ao redor do Minimap |

---

## Regras

### R1 — Posicionamento Fixo

- THE **MinimapRenderer** SHALL renderizar o Minimap no canto superior direito da tela, com margem de `MINIMAP.MARGIN` pixels em relação às bordas superior e direita.
- THE **MinimapRenderer** SHALL calcular `x = gameWidth - minimapWidth - MINIMAP.MARGIN` e `y = MINIMAP.MARGIN` para posicionar o Minimap.
- THE **MinimapRenderer** SHALL fixar o Minimap na tela (coordenadas de câmera fixas), sem scroll com a câmera principal da GameScene.

### R2 — Escala e Tamanho

- THE **MinimapRenderer** SHALL representar cada tile do grid como um retângulo de `MINIMAP.TILE_SIZE × MINIMAP.TILE_SIZE` pixels.
- THE **MinimapRenderer** SHALL calcular a largura e altura totais do Minimap como `dungeon.width × MINIMAP.TILE_SIZE` e `dungeon.height × MINIMAP.TILE_SIZE` respectivamente.
- WHEN o grid da dungeon for `40×40` tiles e `MINIMAP.TILE_SIZE` for `2`, THE **MinimapRenderer** SHALL produzir um Minimap de `80×80` pixels.

### R3 — Cores por Estado de Visibilidade

- THE **MinimapRenderer** SHALL colorir cada tile de acordo com seu `VisibilityState`:
  - `HIDDEN` → `MINIMAP.COLOR_HIDDEN` (preto `0x000000`)
  - `REVEALED` → `MINIMAP.COLOR_REVEALED` (cinza escuro `0x333333`)
  - `VISIBLE` → `MINIMAP.COLOR_VISIBLE` (cinza claro `0x888888`)
- THE **MinimapRenderer** SHALL renderizar todos os tiles, incluindo os `HIDDEN`, para preencher o fundo do Minimap.

### R4 — Marcador do Player

- THE **MinimapRenderer** SHALL renderizar um ponto de cor `MINIMAP.COLOR_PLAYER` (azul) na posição correspondente ao tile atual do player.
- THE **MinimapRenderer** SHALL posicionar o marcador do player sobre o tile correspondente, sobrepondo a cor de visibilidade do tile.
- THE **MinimapRenderer** SHALL sempre exibir o marcador do player, independentemente do estado de visibilidade do tile em que ele se encontra.

### R5 — Marcadores de Inimigos

- THE **MinimapRenderer** SHALL renderizar um ponto de cor `MINIMAP.COLOR_ENEMY` (vermelho) para cada inimigo cujo tile esteja no estado `VISIBLE`.
- IF o tile de um inimigo estiver no estado `HIDDEN` ou `REVEALED`, THEN THE **MinimapRenderer** SHALL omitir o marcador desse inimigo.
- THE **MinimapRenderer** SHALL omitir marcadores de inimigos com `alive = false`.

### R6 — Atualização por Turno

- WHEN o EventBus emitir `EVENTS.PLAYER_MOVED`, THE **MinimapRenderer** SHALL redesenhar o Minimap completo com o estado atualizado do `visibilityGrid` e das posições das entidades.
- WHEN o EventBus emitir `EVENTS.PLAYER_ATTACKED` ou `EVENTS.ENEMY_DIED`, THE **MinimapRenderer** SHALL redesenhar o Minimap para refletir o estado atual dos inimigos.
- THE **MinimapRenderer** SHALL realizar um redesenho completo a cada atualização (limpar e redesenhar), não atualização incremental por tile.

### R7 — Borda Visual

- THE **MinimapRenderer** SHALL renderizar uma borda de `MINIMAP.BORDER_THICKNESS` pixels ao redor do Minimap com cor `MINIMAP.BORDER_COLOR`.
- THE **MinimapRenderer** SHALL renderizar a borda em depth superior ao conteúdo do Minimap.

### R8 — Integração com UIScene

- THE **MinimapRenderer** SHALL ser instanciado e gerenciado pela UIScene, não pela GameScene.
- THE **MinimapRenderer** SHALL usar um único objeto `Phaser.GameObjects.Graphics` para renderizar todo o conteúdo do Minimap (tiles, marcadores e borda).
- THE **MinimapRenderer** SHALL ser renderizado em depth superior ao HUD de barras (HP/Mana/XP), garantindo que o Minimap não seja sobreposto por outros elementos da UIScene.
- WHILE a UIScene estiver ativa, THE **MinimapRenderer** SHALL permanecer visível e atualizado.

### R9 — Inicialização

- THE **MinimapRenderer** SHALL realizar o primeiro desenho imediatamente após receber os dados iniciais da dungeon e do `visibilityGrid`, antes do primeiro input do player.
- THE **MinimapRenderer** SHALL escutar o evento de inicialização da UIScene para receber a referência ao `FogSystem`, `Player` e `EnemySystem[]`.

---

## Casos de Erro

| Situação | Comportamento Esperado |
|----------|----------------------|
| `visibilityGrid` não inicializado no momento do primeiro desenho | Minimap renderiza todos os tiles como `HIDDEN` (preto) |
| Posição do player fora dos limites do grid | Marcador do player não é renderizado; Minimap continua exibindo os tiles normalmente |
| Lista de inimigos vazia | Minimap renderiza sem marcadores de inimigos; sem erro |
| `dungeon.width` ou `dungeon.height` igual a 0 | Minimap não é renderizado; `MinimapRenderer` aguarda dados válidos |
| Inimigo com posição fora dos limites do grid | Marcador do inimigo é ignorado silenciosamente |

---

## Cenários Testáveis

### CT-01 — Renderização inicial: todos os tiles HIDDEN aparecem como preto

**Dado** que o `FogSystem` foi inicializado (todos os tiles `HIDDEN`)  
**Quando** o `MinimapRenderer` realiza o primeiro desenho  
**Então** todos os pixels do Minimap correspondentes a tiles devem ter cor `MINIMAP.COLOR_HIDDEN` (`0x000000`)  
**E** o marcador do player deve estar visível na posição de spawn

---

### CT-02 — Tile VISIBLE aparece como cinza claro

**Dado** que o player está em `(5, 5)` e o `FogSystem` marcou os tiles ao redor como `VISIBLE`  
**Quando** o `MinimapRenderer` redesenha após `EVENTS.PLAYER_MOVED`  
**Então** o tile `(5, 5)` no Minimap deve ter cor `MINIMAP.COLOR_VISIBLE` (`0x888888`)  
**E** o marcador do player deve estar posicionado sobre o tile `(5, 5)` no Minimap

---

### CT-03 — Tile REVEALED aparece como cinza escuro

**Dado** que o player visitou o tile `(3, 3)` (estado `REVEALED`) e se moveu para longe  
**Quando** o `MinimapRenderer` redesenha  
**Então** o tile `(3, 3)` no Minimap deve ter cor `MINIMAP.COLOR_REVEALED` (`0x333333`)

---

### CT-04 — Inimigo em tile VISIBLE exibe marcador vermelho

**Dado** que um inimigo está no tile `(7, 7)` e esse tile está no estado `VISIBLE`  
**Quando** o `MinimapRenderer` redesenha  
**Então** o tile `(7, 7)` no Minimap deve exibir um marcador de cor `MINIMAP.COLOR_ENEMY` (`0xff2222`)

---

### CT-05 — Inimigo em tile REVEALED não exibe marcador

**Dado** que um inimigo está no tile `(7, 7)` e esse tile está no estado `REVEALED`  
**Quando** o `MinimapRenderer` redesenha  
**Então** nenhum marcador vermelho deve aparecer no tile `(7, 7)` do Minimap  
**E** o tile deve exibir a cor `MINIMAP.COLOR_REVEALED`

---

### CT-06 — Inimigo morto não exibe marcador

**Dado** que um inimigo com `alive = false` está no tile `(9, 9)` e esse tile está `VISIBLE`  
**Quando** o `MinimapRenderer` redesenha após `EVENTS.ENEMY_DIED`  
**Então** nenhum marcador vermelho deve aparecer no tile `(9, 9)` do Minimap

---

### CT-07 — Posicionamento fixo: Minimap não se move com a câmera

**Dado** que o player se moveu para uma posição distante do spawn, deslocando a câmera principal  
**Quando** o `MinimapRenderer` redesenha  
**Então** o Minimap deve permanecer no canto superior direito da tela, na mesma posição de tela (não de mundo)

---

### CT-08 — Atualização após combate remove inimigo morto

**Dado** que um inimigo está no tile `(6, 6)` (estado `VISIBLE`) e exibe marcador vermelho  
**Quando** o player ataca e mata o inimigo (`EVENTS.ENEMY_DIED` emitido)  
**Então** o marcador vermelho no tile `(6, 6)` deve desaparecer no próximo redesenho  
**E** o tile deve exibir apenas a cor de visibilidade correspondente

---

### CT-09 — Tamanho correto para grid 40×40

**Dado** que a dungeon tem `width = 40` e `height = 40` e `MINIMAP.TILE_SIZE = 2`  
**Quando** o `MinimapRenderer` é inicializado  
**Então** `minimapRenderer.width` deve ser `80`  
**E** `minimapRenderer.height` deve ser `80`

---

### CT-10 — Borda renderizada ao redor do Minimap

**Dado** que o `MinimapRenderer` foi inicializado  
**Quando** o Minimap é desenhado  
**Então** deve existir uma borda de `MINIMAP.BORDER_THICKNESS` pixels ao redor da área do Minimap com cor `MINIMAP.BORDER_COLOR`

---

## Integração com Sistemas Existentes

### UIScene

- Instanciar `MinimapRenderer` em `UIScene.create()`, após receber os dados iniciais via EventBus
- Escutar `EVENTS.PLAYER_MOVED`, `EVENTS.PLAYER_ATTACKED` e `EVENTS.ENEMY_DIED` para chamar `minimapRenderer.redraw(visibilityGrid, player, enemies)`
- O `MinimapRenderer` usa `setScrollFactor(0)` no objeto `Graphics` para garantir posição fixa na tela

### FogSystem

- O `MinimapRenderer` consome `FogSystem.visibilityGrid` diretamente (leitura apenas)
- Nenhuma alteração na lógica do `FogSystem` é necessária

### EventBus

- Escutar `EVENTS.PLAYER_MOVED` para redesenho após movimento
- Escutar `EVENTS.PLAYER_ATTACKED` para redesenho após combate
- Escutar `EVENTS.ENEMY_DIED` para redesenho após morte de inimigo
- Considerar adicionar `EVENTS.MINIMAP_READY` para sinalizar que o `MinimapRenderer` está pronto para receber dados

### GameScene

- Nenhuma alteração direta na `GameScene` é necessária
- A `GameScene` já emite os eventos necessários via EventBus; o `MinimapRenderer` os consome na UIScene

### constants.ts

- Adicionar a constante `MINIMAP` com `TILE_SIZE`, `MARGIN`, `BORDER_THICKNESS`, `BORDER_COLOR`, `COLOR_HIDDEN`, `COLOR_REVEALED`, `COLOR_VISIBLE`, `COLOR_PLAYER` e `COLOR_ENEMY`

---

## Notas de Implementação

- **`setScrollFactor(0)`**: O objeto `Phaser.GameObjects.Graphics` do Minimap deve ter `setScrollFactor(0)` para que permaneça fixo na tela independentemente do scroll da câmera principal.
- **Redesenho completo**: A cada atualização, chamar `graphics.clear()` e redesenhar todos os tiles e marcadores. Para um grid 40×40 com `tileSize = 2`, isso representa 1.600 retângulos de 2×2px — operação leve o suficiente para não impactar performance.
- **Depth**: O `Graphics` do Minimap deve ter depth alto (ex: `100`) para garantir que fique acima de todos os outros elementos da UIScene.
- **Coordenadas de tela**: As coordenadas do Minimap são relativas à tela (não ao mundo). Usar `gameWidth` e `gameHeight` da cena para calcular `minimapOrigin`.
- **Marcadores de entidades**: Renderizar os marcadores de player e inimigos como retângulos de `tileSize × tileSize` pixels (mesma escala dos tiles), posicionados sobre o tile correspondente.
