# Dungeon Sprite Rendering — Documentação Técnica Completa

> Documento de referência para entender, manter e otimizar o sistema de renderização visual das dungeons.  
> Estado atual: v5.3.0 — Shell-not-Volume com bitmask 8-bit, `SemanticClassifier` e `WallVariantLUT`.

---

## 1. Visão Geral

O sistema transforma um **grid bidimensional de inteiros** (`WALL = 0`, `FLOOR = 1`) em **sprites Phaser** com frames visuais corretos — paredes de borda nítidas, interior escuro (VOID), chão com variação de textura.

**Princípio visual central: parede é casca, não volume.**

```
VOID VOID VOID VOID VOID
VOID EDGE EDGE EDGE VOID   ← apenas tiles adjacentes ao piso recebem sprite
VOID EDGE FLOOR FLOOR VOID
VOID EDGE FLOOR FLOOR VOID
VOID VOID VOID VOID VOID
```

A arquitetura é dividida em quatro camadas com responsabilidades estritamente separadas:

```
grid[][]  (fonte de verdade — nunca alterada pelo renderer)
    ↓
SemanticClassifier  →  SemanticGrid { FLOOR | WALL_EDGE | VOID }
    ↓
AutoTileResolver    →  TileRenderData { texture, frame }
    ↓                  (usa WallVariantLUT + TileSemanticsProvider)
DungeonRenderer     →  RenderCommand[] { x, y, texture, frame, depth }
    ↓
GameScene           →  Phaser.GameObjects.Image (sprites na tela)
```

Nenhuma camada conhece os detalhes internos das outras. `SemanticClassifier`, `AutoTileResolver` e `DungeonRenderer` não importam nem instanciam nada do Phaser.

---

## 2. O Grid

Produzido pelo `DungeonGenerator` (BSP — Binary Space Partitioning). É um array `number[][]` onde:

```
TILE.WALL  = 0  → parede sólida
TILE.FLOOR = 1  → piso transitável
```

Dimensões padrão: **40 × 40 tiles**. A borda externa é sempre `WALL`.

O grid é a **única fonte de verdade**. O renderer apenas o lê — nunca o altera.

---

## 3. TileSemanticsProvider

**Arquivo:** `src/systems/TileSemanticsProvider.ts`

Desacopla semântica visual de semântica de colisão. O bitmask usa `isVisuallyOpen` — não hardcoda `=== TILE.FLOOR`.

```typescript
interface TileSemantics {
  isVisuallyOpen: boolean; // contribui para silhueta visual (bitmask)
  isWalkable:     boolean; // jogador pode caminhar
  isSolid:        boolean; // bloqueia projéteis/LOS
}
```

**Tabela atual:**

| Tile | isVisuallyOpen | isWalkable | isSolid |
|------|------|------|------|
| `TILE.FLOOR` | true | true | false |
| `TILE.WALL` | false | false | true |
| desconhecido | false | false | true |

**Extensão para futuras categorias:** registrar em `TILE_SEMANTICS` sem alterar resolver ou classifier.

---

## 4. SemanticClassifier

**Arquivo:** `src/systems/SemanticClassifier.ts`

```typescript
export const enum SemanticValue { FLOOR = 0, WALL_EDGE = 1, VOID = 2 }
export type SemanticGrid = SemanticValue[][];

export function classifyGrid(grid: number[][]): SemanticGrid
```

### Regra de classificação

- `FLOOR`: tile com `isVisuallyOpen = true`
- `WALL_EDGE`: tile WALL com ao menos 1 vizinho **cardinal** (N/S/L/O) com `isVisuallyOpen`
- `VOID`: tile WALL sem nenhum vizinho cardinal visualmente aberto

**Por que apenas 4 vizinhos cardinais para a shell:**

Usar diagonais para classificar a shell geraria silhuetas diagonais grossas em corredores de 1 tile. Os 8 vizinhos participam apenas no bitmask (passo de refinamento visual).

```
VOID VOID VOID     ← diagonal de floor NÃO cria WALL_EDGE
VOID WALL VOID     ← sem vizinho cardinal de floor → VOID
VOID FLOOR VOID
```

**Garantia de espessura 1:** por construção matemática, cada tile VOID só vira WALL_EDGE se um vizinho cardinal é FLOOR — nunca baseado em si mesmo. A shell tem exatamente 1 tile de espessura.

---

## 5. WallVariantLUT

**Arquivo:** `src/systems/WallVariantLUT.ts`

### 5.1 Bitmask de 8 vizinhos

```
NW=1   N=2   NE=4
W=8          E=16
SW=32  S=64  SE=128
```

**Convenção:** bit `1` (SET) = vizinho NÃO é visualmente aberto (sólido ou OOB). Bit `0` (CLEAR) = vizinho é FLOOR.

### 5.2 Sanitização de máscara

Diagonais sem suporte cardinal são forçadas a fechado antes do lookup:

```typescript
export function sanitizeMask(raw: number): number {
  let m = raw;
  if ((m & BIT.N) || (m & BIT.W)) m |= BIT.NW;
  if ((m & BIT.N) || (m & BIT.E)) m |= BIT.NE;
  if ((m & BIT.S) || (m & BIT.W)) m |= BIT.SW;
  if ((m & BIT.S) || (m & BIT.E)) m |= BIT.SE;
  return m;
}
```

Garante que `NE` só pode estar aberto se `N` e `E` também estiverem — evita artefatos em cantos apertados.

### 5.3 WallVariant

Apenas variantes com sprite DawnLike confirmado. PILLAR e CROSS são raros em BSP e colapsados em equivalentes visuais.

```typescript
enum WallVariant {
  FACE,       // sul aberto, borda reta frontal
  FACE_END_W, // sul+oeste abertos — extremidade esquerda (cap)
  FACE_END_E, // sul+leste abertos — extremidade direita (cap)
  FACE_T,     // sul+leste+oeste abertos — T-junction sul (colapsa em FACE visualmente)
  INNER_NW,   // sul fechado, leste+SE abertos — canto côncavo NW
  INNER_NE,   // sul fechado, oeste+SW abertos — canto côncavo NE
  BODY,       // nenhum cardinal aberto — corpo sólido, 1 frame fixo
}
```

### 5.4 classifyVariant — função pura, sem chain de overwrites

```typescript
function classifyVariant(mask: number): WallVariant {
  const s_open = !(mask & BIT.S), e_open = !(mask & BIT.E), w_open = !(mask & BIT.W);
  const se_open = !(mask & BIT.SE), sw_open = !(mask & BIT.SW);

  if (s_open) {
    if (w_open && e_open) return WallVariant.FACE_T;
    if (w_open)           return WallVariant.FACE_END_W;
    if (e_open)           return WallVariant.FACE_END_E;
    return WallVariant.FACE;
  }
  if (e_open && se_open) return WallVariant.INNER_NW;
  if (w_open && sw_open) return WallVariant.INNER_NE;
  return WallVariant.BODY;
}
```

Determinístico: dado qualquer mask, o resultado é rastreável passo a passo sem efeitos colaterais.

### 5.5 Diagramas visuais

```
FACE              FACE_END_W        FACE_END_E        FACE_T
  # X #             . X #             # X .             . X .
  . . .             . . #             # . .             . . .

INNER_NW          INNER_NE          BODY
  # # #             # # #             # # #
  # X .             . X #             # X #
  # # .             . # #             # # #
```

---

## 6. AutoTileResolver

**Arquivo:** `src/systems/AutoTileResolver.ts`

```typescript
resolve(
  grid:     number[][],   // grid raw (fonte de verdade para bitmask)
  sem:      SemanticGrid, // classificação semântica pré-calculada
  x:        number,
  y:        number,
  theme:    DungeonTheme,
  floorNum: number,
): TileRenderData | null
```

**Pipeline por categoria:**

```
VOID      → null (DungeonRenderer skipa)
FLOOR     → _pickDeterministic(tileSet.bodyFrames, x, y, floorNum, salt=0)
WALL_EDGE → se bitmaskFrames presente:
              computeRawMask() → sanitizeMask() → WALL_VARIANT_LUT[mask] → _frameForVariant()
            senão:
              fallback legado 4-vizinhos (temas não migrados)
```

**Atlas-agnostic:** `WallVariant` é semântico; frames são definidos no tema via `BitmaskFrameSet`. O resolver não conhece números de frame.

### 6.1 _pickDeterministic() — Variação sem Aleatoriedade

```typescript
private _pickDeterministic(frames, x, y, floor, salt): number {
  const hash = ((x * 2654435761) ^ (y * 2246822519) ^ (floor * 374761393) ^ (salt * 1234567891)) >>> 0;
  return frames[hash % frames.length];
}
```

- Sem `Math.random()` — mesma posição + mesmo andar = mesmo frame sempre
- Usado apenas para floor (salt=0) — walls usam frame fixo (body = 1 frame)
- `>>> 0` garante operação de módulo correta em JS

---

## 7. DungeonRenderer

**Arquivo:** `src/systems/DungeonRenderer.ts`

```typescript
buildCommands(grid, theme, floor, baseDepth = 0): RenderCommand[] {
  const sem = classifyGrid(grid);   // 1. classificar
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (sem[y][x] === SemanticValue.VOID) continue;   // 2. skip VOID
      const data = resolver.resolve(grid, sem, x, y, theme, floor); // 3. resolver
      if (!data) continue;
      commands.push({ x: x*TS+TS/2, y: y*TS+TS/2, ... });
    }
}
```

Grid 40×40 = 1600 tiles total. Em dungeons BSP típicas, ~50% são VOID → ~800 sprites emitidos.

---

## 8. GameScene — Consumo dos Comandos

**Arquivo:** `src/scenes/GameScene.ts`, método `_loadDungeonFloor()`

```typescript
this.cameras.main.setBackgroundColor(0x000000); // VOID = preto sólido
const theme    = themeForFloor(floor);
const renderer = new DungeonRenderer();
const commands = renderer.buildCommands(grid, theme, floor);

for (const cmd of commands) {
  this._tileObjects.push(
    this.add.image(cmd.x, cmd.y, cmd.texture, cmd.frame).setDepth(cmd.depth),
  );
}
```

`_tileObjects` é limpo em `_cleanup()` antes de cada transição de área/andar.

---

## 9. Temas Visuais por Andar

**Arquivo:** `src/config/dungeon-themes.ts`

### 9.1 BitmaskFrameSet — Interface

```typescript
interface BitmaskFrameSet {
  face:     number;  // WallVariant.FACE
  faceEndW: number;  // WallVariant.FACE_END_W
  faceEndE: number;  // WallVariant.FACE_END_E
  faceT:    number;  // WallVariant.FACE_T
  innerNW:  number;  // WallVariant.INNER_NW
  innerNE:  number;  // WallVariant.INNER_NE
  body:     number;  // WallVariant.BODY — 1 frame fixo, sem variação
}
```

### 9.2 TileCategory

```typescript
type TileCategory =
  | 'wall'      // legado — retrocompatibilidade
  | 'wall_edge' // nova — bitmask 8-bit
  | 'void'      // nova — sem render
  | 'floor'
  | 'door' | 'water' | 'lava' | 'chasm' | 'pillar'
  | string;     // biomas futuros
```

### 9.3 Temas Definidos

`themeForFloor(floor)` mapeia andar → tema:

```
floor <= 2  → THEMES.dungeon        (pedra cinza)
floor <= 4  → THEMES.mine           (terra/minério)
floor <= 6  → THEMES.underworld     (pedra escura)
floor >= 7  → THEMES.underworld_boss (mix abismo + boss)
```

### 9.4 Tabela de Frames por Tema (Wall.png — 20 cols, frame = row×20+col)

| Tema | face | faceEndW | faceEndE | innerNW | innerNE | body |
|------|------|---------|---------|---------|---------|------|
| dungeon | 181 | 180 | 182 | 362 | 360 | 200 |
| mine | 136 | 135 | 137 | 362 | 360 | 155 |
| underworld | 261 | 240 | 242 | 362 | 360 | 260 |
| underworld_boss | 261 | 240 | 242 | 362 | 360 | 280 |

Inner corners (362, 360) são compartilhados em todos os temas — aparecem identicamente nos TMXs de referência.

### 9.5 Floor.png — Frames por Tema

| Tema | bodyFrames |
|------|-----------|
| `dungeon` | 210–215 (linha 10, 6 variações) |
| `mine` | 378–381, 399–402 (linhas 18–19, 8 variações) |
| `underworld` | 441–444, 462–465 (linhas 21–22, 8 variações) |
| `underworld_boss` | 441–444, 210–212 (mix abismo + pedra cinza) |

---

## 10. Ferramental de Debug (Dev-only)

### DebugOverlayRenderer

**Arquivo:** `src/systems/DebugOverlayRenderer.ts`

Substitui output do `DungeonRenderer` para validação visual:

| Modo | O que exibe |
|------|------------|
| `semantic` | Cor por SemanticValue (FLOOR / WALL_EDGE / VOID) |
| `variant` | Frame por WallVariant (útil para verificar LUT) |
| `bitmask` | Valor numérico do bitmask como frame index |

### MaskFrequencyLogger

**Arquivo:** `src/systems/MaskFrequencyLogger.ts`

Loga distribuição de masks e variantes após `buildCommands()`. Útil para:
- Identificar masks dominantes (candidatos a frames dedicados)
- Verificar que `BODY` aparece raramente (sinal de saúde visual)
- Detectar estados impossíveis em mapas BSP

### VisualRegressionScene

**Arquivo:** `src/scenes/VisualRegressionScene.ts`

Cena determinística com grid hardcoded cobrindo todos os casos críticos. Teclas `1–4` alternam modos de debug, `L` dispara log de frequências. Screenshot comparison após mudanças no renderer.

---

## 11. Como Estender

### Adicionar um novo tema

1. Criar entrada em `THEMES` em `dungeon-themes.ts` com `wall_edge` e `floor` AutoTileSets (incluindo `bitmaskFrames`)
2. Atualizar `themeForFloor()` com o range de andares
3. Nenhuma alteração em `AutoTileResolver`, `DungeonRenderer` ou `SemanticClassifier`

### Adicionar nova categoria de tile (ex: `water`)

1. Registrar em `TileSemanticsProvider.TILE_SEMANTICS` com flags corretas
2. Adicionar `TILE.WATER = 2` em `constants.ts`
3. `DungeonGenerator` emite `TILE.WATER` onde quiser
4. Definir `autoTileSets.water: AutoTileSet` em cada tema com `bitmaskFrames`
5. Nenhuma alteração em `DungeonRenderer`, `SemanticClassifier` ou `GameScene`

### Política de variação visual

- **Wall body**: 1 frame fixo — silhueta tem prioridade absoluta sobre detalhe
- **Wall edge (face/corners)**: 1 frame por variante — consistência visual
- **Floor**: pool de frames mantido — variação é bem-vinda no piso
- **Regra de ouro**: quando em dúvida, remova variação ao invés de adicionar

---

## 12. O que Funciona e Rotas de Otimização

### O que funciona

- Shell-not-Volume: apenas tiles adjacentes ao piso recebem sprite; interior é VOID (preto)
- Bitmask de 8 vizinhos com sanitização de diagonais — sem artefatos em cantos apertados
- Shell de exatamente 1 tile de espessura (4 vizinhos cardinais para classificação)
- Temas visuais distintos por faixa de andares (4 temas)
- Arquitetura pura (sem Phaser) testável unitariamente
- Variação de floor determinística (sem Math.random)
- Body walls com 1 frame — sem ruído visual no interior
- `TileSemanticsProvider` desacopla visual de colisão (extensível para water/lava/chasm)

### Rotas de otimização futuras

| Otimização | Impacto | Complexidade |
|-----------|---------|-------------|
| `RenderTexture` por andar baked | ~800 sprites → 1 objeto | Médio |
| `Phaser.Tilemaps` nativo | Batch WebGL, muito mais eficiente | Alto |
| Bitmask completo para FACE_T e junções complexas | Mais detalhes visuais | Baixo — adicionar variante e frame |
| Water/lava animados | `animated: true` no AutoTileSet | Médio |

---

## 13. Fluxo Completo de uma Frame de Renderização

```
GameScene._loadDungeonFloor(floor)
│
├── cameras.main.setBackgroundColor(0x000000)
│
├── themeForFloor(floor) → DungeonTheme
│
├── new DungeonRenderer()
│
└── renderer.buildCommands(grid, theme, floor)
    │
    ├── SemanticClassifier.classifyGrid(grid) → SemanticGrid
    │     ↓  para cada (x,y):
    │     tile FLOOR → SemanticValue.FLOOR
    │     tile WALL com vizinho cardinal FLOOR → SemanticValue.WALL_EDGE
    │     tile WALL sem vizinho cardinal FLOOR → SemanticValue.VOID
    │
    └── para cada (x, y) no grid 40×40:
        │
        ├── sem[y][x] === VOID → skip (nenhum RenderCommand)
        │
        └── AutoTileResolver.resolve(grid, sem, x, y, theme, floor)
            │
            ├── [floor] → _pickDeterministic(bodyFrames, salt=0)
            │
            └── [wall_edge]
                ├── computeRawMask() → 8 vizinhos via isVisuallyOpen
                ├── sanitizeMask()   → fecha diagonais sem suporte cardinal
                ├── WALL_VARIANT_LUT[mask] → WallVariant
                └── _frameForVariant() → frame number
            │
            └── → TileRenderData { texture, frame }
        │
        └── → RenderCommand { x_px, y_px, texture, frame, depth }
    │
    └── → RenderCommand[] (~800 comandos para grid 40×40 BSP típico)
│
└── para cada RenderCommand:
    this.add.image(cmd.x, cmd.y, cmd.texture, cmd.frame).setDepth(cmd.depth)
```

---

## 14. Arquivos Envolvidos

| Arquivo | Papel |
|---------|-------|
| `src/systems/TileSemanticsProvider.ts` | Semântica visual vs. colisão; extensível para novas categorias |
| `src/systems/SemanticClassifier.ts` | Classifica grid em FLOOR/WALL_EDGE/VOID (4 vizinhos cardinais) |
| `src/systems/WallVariantLUT.ts` | sanitizeMask, classifyVariant, LUT 256 entradas, computeRawMask |
| `src/config/dungeon-themes.ts` | BitmaskFrameSet, AutoTileSet, TileCategory, themeForFloor() |
| `src/systems/AutoTileResolver.ts` | Resolve frame via bitmask ou fallback legado; puro, sem Phaser |
| `src/systems/DungeonRenderer.ts` | Classifica + itera grid, skipa VOID, emite RenderCommand[] |
| `src/scenes/GameScene.ts` | Consome RenderCommands, cria sprites, define background preto |
| `src/generators/DungeonGenerator.ts` | Produz o `grid[][]` — não alterado pelo renderer |
| `src/utils/constants.ts` | `TILE_SIZE`, `TILE.WALL`, `TILE.FLOOR` |
| `src/systems/DebugOverlayRenderer.ts` | Modos semantic/variant/bitmask (dev-only) |
| `src/systems/MaskFrequencyLogger.ts` | Distribuição de masks por sessão (dev-only) |
| `src/scenes/VisualRegressionScene.ts` | Cena determinística para screenshot comparison (dev-only) |
| `public/assets/dawnlike/Objects/Wall.png` | Spritesheet de paredes (20×51 frames) |
| `public/assets/dawnlike/Objects/Floor.png` | Spritesheet de chão (21×39 frames) |
