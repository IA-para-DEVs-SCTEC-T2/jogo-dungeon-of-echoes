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

| Uso             | Frame | Descrição                    |
|-----------------|-------|------------------------------|
| Floor dungeon   | variante aleatória por sala | Frame sorteado em `_floorFrame` |
| Floor cidade    | `TOWN.FLOOR_FRAME` = 16     | Frame fixo para TownMap       |

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

Profundidade dos sprites de item: `depth = 3`.

---

## UIScene — Action Bar

Ícones dos slots na action bar também usam sprites reais (`Phaser.GameObjects.Sprite`),
não retângulos coloridos. Lógica de mapeamento em `UIScene._getItemVisual(type)`.

---

## Regras

- R1: Sprites são **estáticos** — sem animação de frame swap entre turnos
- R2: `pixelArt: true` e `roundPixels: true` configurados em `main.ts` para nitidez
- R3: Nenhuma cena calcula frames diretamente — sempre via `DAWNLIKE_FRAMES.*`
- R4: `BootScene` carrega todos os assets antes de iniciar `GameScene` (loading screen)
- R5: Easter egg Platino usa `SPRITES.PLAYER` com frame diferente (verificar `_spawnPlatino()`)
