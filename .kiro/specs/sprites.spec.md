# Spec — Sprites Dawnlike (Mapeamento de Assets)

## Descrição

Documenta o mapeamento entre entidades do jogo e frames do tileset Dawnlike 16×16 (CC-BY).
Todos os spritesheets são carregados em `BootScene.preload()` via `this.load.spritesheet()`.

---

## Spritesheets Carregados

| Chave (`SPRITES.*`) | Arquivo                          | Uso                          |
|---------------------|----------------------------------|------------------------------|
| `GROUND`            | `Objects/Ground0.png`            | Tiles de floor               |
| `WALL`              | `Objects/Wall.png`               | Tiles de wall                |
| `PLAYER`            | `Characters/Player0.png`         | Sprite do player             |
| `ENEMY`             | `Characters/Undead0.png`         | Sprite dos inimigos          |
| `POTION`            | `Items/Potion.png`               | Poções (heal e poison)       |
| `MONEY`             | `Items/Money.png`                | Ouro dropado                 |

Todos carregados com `frameWidth: 16, frameHeight: 16`.

---

## Mapeamento de Frames (`DAWNLIKE_FRAMES`)

### Player (`Player0.png`)

| Constante       | Frame | Descrição               |
|-----------------|-------|-------------------------|
| `PLAYER_IDLE`   | 24    | Sprite estático do herói|

> Sprites são estáticos — sem animação de frame swap.

### Inimigos (`Undead0.png`)

| Constante      | Frame | Descrição               |
|----------------|-------|-------------------------|
| `ENEMY_IDLE`   | 0     | Esqueleto (frame único) |

### Tiles de Floor (`Ground0.png`)

| Uso             | Resolução de Frame | Descrição |
|-----------------|-------------------|-----------|
| Floor dungeon   | variante aleatória por sala | Frame sorteado em `_floorFrame` |
| Floor cidade    | `TileVariantResolver` | Frame determinístico por posição + bioma (não mais frame fixo) |

#### Biome Atlas — `FLOOR_ATLAS` (`src/config/sprites-config.ts`)

Cada bioma mapeia para uma lista de variantes com peso relativo. `TileVariantResolver` usa hash xorshift por `(x, y, sessionSeed)` para selecionar o frame de forma determinística:

| BiomeType     | Variantes (frame + weight) |
|---------------|---------------------------|
| `urban`       | calçada, paralelepípedo (pesos definidos em `FLOOR_ATLAS`) |
| `natural`     | grama, terra, flores (pesos definidos em `FLOOR_ATLAS`) |
| `interior`    | madeira, pedra polida (pesos definidos em `FLOOR_ATLAS`) |
| `transition`  | mistura urban/natural (pesos definidos em `FLOOR_ATLAS`) |

> Para os frame numbers exatos, consultar `src/config/sprites-config.ts` — a spec não repete magic numbers que vivem no config.

### Tiles de Wall (`Wall.png`)

| Uso    | Frame | Descrição            |
|--------|-------|----------------------|
| Wall   | 0     | Tijolo padrão        |

### Poções (`Potion.png`)

Arquivo inspecionado: 32 colunas × múltiplas linhas, 16×16 px por frame.

| Constante        | Frame | Cor/Tipo        |
|------------------|-------|-----------------|
| `POTION_HEAL`    | 0     | Vermelho (cura) |
| `POTION_POISON`  | 7     | Azul (veneno)   |

### Ouro (`Money.png`)

| Constante | Frame | Descrição      |
|-----------|-------|----------------|
| `GOLD`    | 0     | Moeda de ouro  |

---

## Renderização de Itens no Mapa

Itens no chão usam `this.add.sprite()` (não retângulos):

| `ItemType`      | Texture         | Frame                    |
|-----------------|-----------------|--------------------------|
| `potion_heal`   | `SPRITES.POTION`| `DAWNLIKE_FRAMES.POTION_HEAL`  (0) |
| `potion_poison` | `SPRITES.POTION`| `DAWNLIKE_FRAMES.POTION_POISON` (7) |
| `gold`          | `SPRITES.MONEY` | `DAWNLIKE_FRAMES.GOLD`         (0) |

Itens equipáveis (espadas, capacetes, etc.) do catálogo da loja são representados no inventário pelo `item.type` e não necessitam de sprite no mapa (não têm loot drop no chão).

Profundidade dos sprites de item no mapa: `depth = 3`.

---

## UIScene — Action Bar

Ícones dos slots na action bar também usam sprites reais (`Phaser.GameObjects.Sprite`),
não retângulos coloridos. Lógica de mapeamento em `UIScene._getItemVisual(type)`.

---

## Constantes de Layer (`src/config/sprites-config.ts`)

| Constante | Valor (depth) | Uso |
|-----------|---------------|-----|
| `LAYER_GROUND` | — | Tiles de chão (groundTiles[y][x]) |
| `LAYER_WORLD_BASE` | 100 | Base para objetos do mundo (árvores, barris, etc.) |
| `LAYER_OVERHEAD` | — | Elementos que cobrem o player |
| `LAYER_UI_LABELS` | — | Labels de nome de NPC e prompts de interação |

Objetos do mundo usam depth = `LAYER_WORLD_BASE + gridY * 10` para Y-sort correto (entidades mais ao sul aparecem à frente).

## Regras

- R1: Sprites são **estáticos** — sem animação de frame swap entre turnos
- R2: `pixelArt: true` e `roundPixels: true` configurados em `main.ts` para nitidez
- R3: Nenhuma cena calcula frames diretamente — cenas usam `DAWNLIKE_FRAMES.*` ou `TileVariantResolver`
- R4: `BootScene` carrega todos os assets antes de iniciar `GameScene` (loading screen)
- R5: Easter egg Platino usa `SPRITES.PLAYER` com frame diferente (verificar `_spawnPlatino()`)
- R6: Tiles de chão da cidade não têm frame fixo — `CityLayoutProcessor` resolve via `TileVariantResolver` usando o bioma do tile e a seed da sessão
- R7: Magic numbers de frame pertencem a `sprites-config.ts` — não espalhar frame literals no código de cenas ou sistemas
