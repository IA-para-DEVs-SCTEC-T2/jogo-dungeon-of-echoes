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

### Dungeon — chão e parede
**`src/utils/constants.ts`** — seção `DAWNLIKE_FRAMES`

```typescript
FLOOR_VARIANTS: [0, 1, 2, 3, 8, 9, 10, 16, 17, 24, 25, 32, 40, 48],
FLOOR: 3,    // fallback fixo — frame 3 do Ground0.png
WALL: 3,     // frame 3 do Wall.png
```

- **Chão:** edite `FLOOR_VARIANTS` (lista sorteada por andar) ou `FLOOR` (fallback)
- **Parede:** edite `WALL`

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
| Chão da dungeon | `src/utils/constants.ts` | `DAWNLIKE_FRAMES.FLOOR_VARIANTS` |
| Parede da dungeon | `src/utils/constants.ts` | `DAWNLIKE_FRAMES.WALL` |
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
