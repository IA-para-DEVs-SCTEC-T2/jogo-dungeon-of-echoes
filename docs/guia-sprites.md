# Guia: Como Ajustar Sprites de Chão, Parede e Tiles

## Como os Frames Funcionam

Todos os spritesheets são carregados com `frameWidth: 16, frameHeight: 16`.
O frame `0` é o canto superior esquerdo, incrementa da esquerda pra direita, depois próxima linha.

**Ground0.png — 8 colunas × 7 linhas = 56 frames:**

```
 0  1  2  3  4  5  6  7   ← pedra/cinza
 8  9 10 11 12 13 14 15   ← terra/marrom
16 17 18 19 20 21 22 23   ← grama/verde
24 25 26 27 28 29 30 31   ← areia
32 33 34 35 36 37 38 39   ← lama
40 41 42 43 44 45 46 47   ← neve
48 49 50 51 52 53 54 55   ← vulcânico
```

`Wall.png` segue o mesmo padrão mas só para paredes.

---

## Onde Ajustar Cada Sprite

### Dungeon — chão e parede (autotiling por tema)
**`src/config/dungeon-themes.ts`** — `AutoTileSet` por tema e categoria

A dungeon usa renderização semântica: cada tile é resolvido pelo `AutoTileResolver` com base nos vizinhos cardinais. Os frames são definidos por tema em `dungeon-themes.ts`.

```typescript
// Estrutura de um AutoTileSet (exemplo: tema dungeon, categoria wall)
wall: {
  face:           181,        // borda superior visível (vizinho sul = floor)
  cornerOuter_TL: 180,        // canto externo superior-esquerdo
  cornerOuter_TR: 182,        // canto externo superior-direito
  bodyFrames:     [200, 201], // corpo sólido — pool de variação por posição
  cornerInner_TL: 362,        // canto côncavo (compartilhado entre temas)
  cornerInner_TR: 360,
},
floor: {
  bodyFrames: [210, 211, 212, 213, 214, 215], // Floor.png linha 10
},
```

**Temas por andar:**

| Andares | Tema | Wall frames (body) | Floor frames |
|---------|------|-------------------|--------------|
| 1–2 | `dungeon` | 200, 201 | 210–215 |
| 3–4 | `mine` | 155, 175 | 378–381, 399–402 |
| 5–6 | `underworld` | 260, 261 | 441–444, 462–465 |
| 7+ | `underworld_boss` | 260, 280 | 441–444, 210–212 |

- **Chão:** edite `bodyFrames` na categoria `floor` do tema desejado
- **Parede:** edite `face`, `cornerOuter_TL/TR`, `bodyFrames` na categoria `wall`
- **Inner corners** (`362`, `360`) são compartilhados — mudar `SHARED_INNER` altera todos os temas

**Spritesheets de referência:**
- `Wall.png` — 20 colunas × 51 linhas; frame = linha × 20 + coluna
- `Floor.png` — 21 colunas × 39 linhas; frame = linha × 21 + coluna

### Cidade — chão por bioma
**`src/config/sprites-config.ts`** — objeto `FLOOR_ATLAS`

Cada bioma agora usa a interface `VisualDef` com `imageFile`, `textureKey`, `frames`, `weights` e `description`:

```typescript
natural: {
  imageFile:   'Ground0.png',   // arquivo real em assets/dawnlike/
  textureKey:  'ground',        // chave registrada no Phaser
  frames:      [16, 17, 18],
  weights:     [0.60, 0.30, 0.10],
  description: 'Grama verde — linha 2 do Ground0.png (áreas abertas)',
},
```

| Bioma | Onde aparece | `imageFile` | Frames |
|---|---|---|---|
| `urban` | Calçada e rua | `Ground0.png` | 0–3 (linha 0, cinza) |
| `natural` | Grama aberta | `Ground0.png` | 16–18 (linha 2, verde) |
| `interior` | Dentro dos edifícios | `Ground0.png` | 0–1 (linha 0, pedra) |
| `transition` | Beira do caminho | `Ground0.png` | 8–10 (linha 1, terra) |

`weights` controla a frequência de cada frame — a soma deve ser `1.0`.

Para trocar o arquivo fonte de um bioma inteiro, altere `imageFile` **e** `textureKey` juntos.

### Caminho central da cidade
**`src/utils/constants.ts`** → `TOWN.STONE_PATH_FRAME`

```typescript
STONE_PATH_FRAME: 2,   // frame 2 do Ground0.png
```

### Paredes da cidade
Usam `DAWNLIKE_FRAMES.WALL` do `constants.ts` (sprite `Wall.png`).

### Decorações
**`src/config/sprites-config.ts`** — objeto `OBJECT_ATLAS`

```typescript
barrel: {
  imageFile:   'Decor0.png',
  textureKey:  'decor0',
  frames:      [1, 2],
  weights:     [0.70, 0.30],
  description: 'Barril de madeira — frames 1 e 2 do Decor0.png',
},
tree: {
  imageFile:   'Tree0.png',
  textureKey:  'tree0',
  frames:      [0, 8, 16],
  weights:     [0.60, 0.30, 0.10],
  description: 'Árvore — 3 variantes de copa (linhas 0, 1 e 2 do Tree0.png)',
},
```

### NPCs
**`src/config/sprites-config.ts`** — objeto `NPC_ATLAS`

NPCs têm `frame` único (não lista), mas seguem a mesma estrutura `VisualDef`:

```typescript
merchant:  { imageFile: 'Humanoid0.png', textureKey: 'humanoid0', frame: 0,  description: '...' },
innkeeper: { imageFile: 'Humanoid0.png', textureKey: 'humanoid0', frame: 8,  description: '...' },
guard:     { imageFile: 'Humanoid0.png', textureKey: 'humanoid0', frame: 16, description: '...' },
cat:       { imageFile: 'Cat0.png',      textureKey: 'cat0',      frame: 0,  description: '...' },
```

---

## Tabela Resumo

| O que mudar | Arquivo | Campo |
|---|---|---|
| Chão da dungeon (por tema) | `src/config/dungeon-themes.ts` | `THEMES[tema].autoTileSets.floor.bodyFrames` |
| Parede da dungeon (por tema) | `src/config/dungeon-themes.ts` | `THEMES[tema].autoTileSets.wall.*` |
| Inner corners (todos os temas) | `src/config/dungeon-themes.ts` | `SHARED_INNER` |
| Chão cidade por bioma | `src/config/sprites-config.ts` | `FLOOR_ATLAS[bioma].frames` |
| Arquivo fonte de um bioma | `src/config/sprites-config.ts` | `FLOOR_ATLAS[bioma].imageFile` + `.textureKey` |
| Caminho de pedra central | `src/utils/constants.ts` | `TOWN.STONE_PATH_FRAME` |
| Parede da cidade | `src/utils/constants.ts` | `DAWNLIKE_FRAMES.WALL` |
| Barris, caixas, etc. | `src/config/sprites-config.ts` | `OBJECT_ATLAS[objeto].frames` |
| NPCs | `src/config/sprites-config.ts` | `NPC_ATLAS[npc].frame` |

---

## Dica: Ver Todos os Frames na Tela

Com `npm run dev` rodando, adicione temporariamente no início de `_loadTown()` ou `_loadDungeonFloor()` em `src/scenes/GameScene.ts`:

```typescript
// DEBUG — remover depois
for (let f = 0; f < 64; f++) {
  this.add.image(f % 8 * 18 + 8, Math.floor(f / 8) * 18 + 8, 'ground', f)
    .setDepth(999).setScrollFactor(0);
}
```

Use o `textureKey` do `FLOOR_ATLAS` ou `OBJECT_ATLAS` para inspecionar qualquer spritesheet:

| `textureKey` | `imageFile` |
|---|---|
| `'ground'` | `Ground0.png` — tiles de chão |
| `'wall'` | `Wall.png` — tiles de parede |
| `'tree0'` | `Tree0.png` — árvores |
| `'decor0'` | `Decor0.png` — barris, tochas, móveis |
| `'humanoid0'` | `Humanoid0.png` — NPCs humanoides |
| `'cat0'` | `Cat0.png` — gato |

Salvar o arquivo já atualiza a tela (Vite HMR) — tweake o frame e veja o resultado na hora.

---

## Override Manual por Coordenada

Use isso para corrigir tiles problemáticos (animais estáticos, fundo escuro, colisão errada)
sem precisar mexer na lógica do renderer.

### Fluxo rápido

| Passo | Ação |
|---|---|
| 1 | Em `src/systems/TownTMXRenderer.ts`, mude `DEBUG_SHOW_COORDINATES` para `true` |
| 2 | Rode o jogo (`npm run dev`) e localize o tile problemático na tela |
| 3 | Anote a coordenada exibida em branco/amarelo (ex: `14,3`) |
| 4 | Abra `src/config/TileProperties.ts` |
| 5 | Adicione a entrada em `MANUAL_MAP_OVERRIDES` (veja exemplos abaixo) |
| 6 | Desligue o debug (`false`) e recarregue |

> As coordenadas são relativas ao TMX (sem o padding de grama): canto superior esquerdo = `0,0`.
> Tiles do layer "Tiles" aparecem em **branco**, tiles do layer "Sprites" em **amarelo**.

### Tabela De/Para — exemplos comuns

| Problema | Coordenada | Override |
|---|---|---|
| Animal estático visível | `14,3` | `'14,3': { forceGid: TILE_GID.GRASS }` |
| Fundo escuro/void | `10,7` | `'10,7': { forceGid: TILE_GID.GRASS, walkable: true }` |
| Cerca que bloqueia passagem | `5,12` | `'5,12': { walkable: true }` |
| Trocar por chão de pedra | `8,2` | `'8,2': { forceGid: TILE_GID.STONE }` |
| Trocar por chão de terra | `3,9` | `'3,9': { forceGid: TILE_GID.DIRT }` |

### Aliases disponíveis (`TILE_GID` em `TileProperties.ts`)

| Nome | TMX GID | Frame | Tile |
|---|---|---|---|
| `TILE_GID.STONE` | 2312 | 0 | Pedra cinza (Ground0, linha 0) |
| `TILE_GID.DIRT` | 2320 | 8 | Terra marrom (Ground0, linha 1) |
| `TILE_GID.GRASS` | 2328 | 16 | Grama verde (Ground0, linha 2) |
| `TILE_GID.VOID` | 2329 | 17 | Grama variante (Ground0, linha 2) |

> Os TMX GIDs são `firstgid(2312) + frame`. Para outros frames do Ground0.png, calcule: `2312 + frame`.
> Para outros GIDs do mapa, use o número direto: `forceGid: 1176`.
A lista completa de GIDs do mapa está em `src/config/TownTMXData.ts`.

---

## Como customizar o comportamento de Tiles e Objetos

O arquivo **`src/config/TileProperties.ts`** é o ponto central para controlar
colisão e interação de cada sprite no mapa da cidade, sem tocar no renderer.

### Estrutura

```typescript
// Dentro de TABERNA, LOJA_ARMAS, CAMINHO_CIDADE, etc.
2216: { label: 'Balcão esq', walkable: false, interaction: null },
// ↑ GID do sprite        ↑ pode andar?    ↑ null = sem interação especial
```

### Como encontrar o GID de um sprite
O GID é o número que aparece nas arrays `TMX_TILES_LAYER` ou `TMX_SPRITES_LAYER`
em `src/config/TownTMXData.ts`. Para identificá-lo visualmente abra
`public/assets/dawnlike/Examples/Town.tmx` no **Tiled Map Editor** e clique no tile.

### Como tornar um objeto caminhável
```typescript
// Antes:
2217: { label: 'Balcão centro', walkable: false, interaction: null },
// Depois (libera a passagem):
2217: { label: 'Balcão centro', walkable: true,  interaction: null },
```
Salve o arquivo — o HMR do Vite recarrega o mapa com a nova colisão.

### Como adicionar interação a um tile (futuro)
```typescript
2217: { label: 'Balcão', walkable: false, interaction: { type: 'shop' } },
```
Tipos disponíveis: `'shop'` (abre loja), `'dialogue'` (mensagem no log),
`'menu'` (menu de opções, ex.: descanso na estalagem).

### Como adicionar um novo GID ao sistema
1. Descubra o GID (Tiled ou inspecionando `TownTMXData.ts`)
2. Adicione a entrada na seção temática correta (`TABERNA`, `LOJA_ARMAS`, etc.):
   ```typescript
   9999: { label: 'Minha decoração', walkable: false, interaction: null },
   ```
3. O `TILE_PROP_MAP` é montado automaticamente com `...TABERNA, ...LOJA_ARMAS, ...`

### Regras de colisão padrão (quando o GID não está no mapa)
| Layer    | Tileset           | Comportamento padrão |
|----------|-------------------|----------------------|
| Tiles    | Wall (GID 1–1020) | **Sólido**           |
| Tiles    | Floor (GID 1021+) | Passável             |
| Sprites  | Door0             | Passável (porta)     |
| Sprites  | Qualquer outro    | **Sólido**           |

### Tabela de textureKeys do mapa TMX
| `textureKey` | Arquivo              | Uso no mapa           |
|---|---|---|
| `'floor'`    | `Floor.png`          | Piso principal (21 cols) |
| `'wall'`     | `Wall.png`           | Paredes dos edifícios |
| `'ground'`   | `Ground0.png`        | Grama e chão externo  |
| `'decor0'`   | `Decor0.png`         | Móveis e decorações   |
| `'door0'`    | `Door0.png`          | Portas (passáveis)    |
| `'tree0'`    | `Tree0.png`          | Árvores               |
| `'pit0'`     | `Pit0.png`           | Marcador de dungeon   |
| `'chest0'`   | `Items/Chest0.png`   | Baús (sólidos)        |
| `'humanoid0'`| `Humanoid0.png`      | NPCs humanoides       |
| `'cat0'`     | `Cat0.png`           | Gato                  |
| `'quad0'`    | `Quadraped0.png`     | Animais (cavalos etc) |
