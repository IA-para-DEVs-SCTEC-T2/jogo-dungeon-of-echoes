# Characters Sprites Rendering — Documentação Técnica

> Documento de referência para entender, manter e aprimorar o sistema de renderização de sprites de inimigos.
> Estado atual: v1.0.0 — Sistema data-driven com distribuição por andar e animações ping-pong DawnLike.

---

## 1. Visão Geral

O sistema transforma uma **definição de inimigo em memória** (`EnemySystem`) em um **sprite Phaser animado** com textura e animação corretas para o andar atual da dungeon.

Fluxo resumido:

```
enemies.config.ts       BootScene.preload()         BootScene.create()
(catálogo de defs)  →  (carrega spritesheets)   →  (registra animações)
        ↓
EnemySystem.createEnemies(floor)     →   EnemyDef selecionado por pickEnemyDef()
        ↓
GameScene._buildEnemySprite()        →   sprite.play(animKey)
```

---

## 2. Estrutura de Assets DawnLike

### 2.1 Localização

```
public/assets/dawnlike/Characters/
  Pest0.png       Pest1.png
  Misc0.png       Misc1.png
  Reptile0.png    Reptile1.png
  Undead0.png     Undead1.png
  Humanoid0.png   Humanoid1.png
  Demon0.png      Demon1.png
  (+ outros não usados por inimigos: Avian, Cat, Dog, Elemental, Plant, Quadraped, Rodent, Slime)
```

### 2.2 Convenção de Pares *0 / *1

O DawnLike organiza animações em pares de arquivos:

| Arquivo | Papel |
|---------|-------|
| `{Categoria}0.png` | Frame base (posição inicial do ciclo) |
| `{Categoria}1.png` | Frame alternativo (posição oposta do ciclo) |

**Regra crítica:** o mesmo índice `N` em `*0.png` e `*1.png` representa **o mesmo inimigo** em fases opostas do movimento. A animação alterna entre os dois.

### 2.3 Grid de Frames

Todos os spritesheets de personagens seguem o grid:

```
frameWidth:  16px
frameHeight: 16px
colunas:     8
```

Mapeamento de linha para índice base:

```
Linha 0 → frames  0– 7
Linha 1 → frames  8–15
Linha 2 → frames 16–23
Linha 3 → frames 24–31
...
Linha N → frames N*8 .. N*8+7
```

`frameIndex` em `EnemyDef` é sempre o **primeiro frame da linha** (múltiplo de 8), garantindo que *0 e *1 apontem para o mesmo inimigo.

---

## 3. Catálogo de Inimigos (`enemies.config.ts`)

### 3.1 Tipos

```typescript
type EnemyCategory = 'pest' | 'misc' | 'reptile' | 'undead' | 'humanoid' | 'demon';
type EnemyRarity   = 'common' | 'uncommon' | 'rare';
```

### 3.2 Interface EnemyDef

```typescript
interface EnemyDef {
  id:          string;         // identificador imutável
  category:    EnemyCategory;  // define o par de spritesheets
  frameIndex:  number;         // índice no grid (múltiplo de 8)
  name:        string;         // nome de exibição base
  hpBase:      number;         // HP antes dos multiplicadores
  damageBase:  number;         // ATK antes dos multiplicadores
  xpBase:      number;         // XP antes do multiplicador de andar
  rarity:      EnemyRarity;    // peso na seleção procedural
  dungeonMin:  number;         // andar mínimo (inclusivo)
  dungeonMax:  number;         // andar máximo (99 = sem limite)
  description?: string;        // lore opcional
}
```

### 3.3 Catálogo Atual

| id | category | frameIndex | name | Andares | Raridade |
|----|----------|-----------|------|---------|----------|
| `rat` | pest | 0 | Rato Feroz | 1–2 | common |
| `spider` | pest | 8 | Aranha Venenosa | 1–2 | common |
| `centipede` | pest | 16 | Centopeia Gigante | 1–2 | uncommon |
| `slime` | misc | 0 | Gosma | 1–2 | common |
| `mushroom_stalker` | misc | 8 | Cogumelo Ambulante | 1–2 | uncommon |
| `lizard` | reptile | 0 | Lagarto das Pedras | 1–2 | common |
| `serpent` | reptile | 8 | Serpente das Ruínas | 1–2 | uncommon |
| `skeleton` | undead | 0 | Esqueleto | 3–4 | common |
| `zombie` | undead | 8 | Zumbi | 3–4 | common |
| `ghost` | undead | 16 | Fantasma Sombrio | 3–4 | rare |
| `goblin` | humanoid | 0 | Goblin | 5+ | common |
| `orc` | humanoid | 8 | Orc Guerreiro | 5+ | uncommon |
| `dark_elf` | humanoid | 16 | Elfo das Sombras | 5+ | rare |
| `imp` | demon | 0 | Imp | 5+ | common |
| `demon_lord` | demon | 8 | Senhor Demônio | 6+ | rare |

---

## 4. Carregamento de Assets (`BootScene.ts`)

### 4.1 Chaves de Textura Registradas

```typescript
// Já existentes antes deste sistema (não recarregadas):
'undead'    → Undead0.png   (SPRITES.ENEMY — alias legado)
'humanoid0' → Humanoid0.png (NPC_ATLAS — NPCs da cidade)

// Carregadas pelo sistema de inimigos:
'pest0'     → Pest0.png
'pest1'     → Pest1.png
'misc0'     → Misc0.png
'misc1'     → Misc1.png
'reptile0'  → Reptile0.png
'reptile1'  → Reptile1.png
'undead1'   → Undead1.png
'humanoid1' → Humanoid1.png
'demon0'    → Demon0.png
'demon1'    → Demon1.png
```

### 4.2 Mapeamento Categoria → Chaves

Definido em `CATEGORY_TEXTURE_KEYS` (enemies.config.ts):

```typescript
const CATEGORY_TEXTURE_KEYS: Record<EnemyCategory, [string, string]> = {
  pest:     ['pest0',     'pest1'],
  misc:     ['misc0',     'misc1'],
  reptile:  ['reptile0',  'reptile1'],
  undead:   ['undead',    'undead1'],   // alias legado para Undead0
  humanoid: ['humanoid0', 'humanoid1'],
  demon:    ['demon0',    'demon1'],
};
```

### 4.3 Deduplicação de Loads

O preload usa o mesmo `Set<string> loaded` compartilhado com `FLOOR_ATLAS`, `OBJECT_ATLAS` e `NPC_ATLAS`, garantindo que nenhuma textura seja carregada duas vezes por sessão:

```typescript
for (const [key, file] of pairs) {
  if (loaded.has(key)) continue;
  this.load.spritesheet(key, `${chars}/${file}`, frameConfig);
  loaded.add(key);
}
```

---

## 5. Sistema de Animações

### 5.1 Estratégia Ping-Pong

Cada animação usa exatamente **2 frames**: o frame de índice `N` em `*0.png` e o frame de índice `N` em `*1.png`:

```typescript
frames: [
  { key: 'pest0', frame: 12 },
  { key: 'pest1', frame: 12 },
]
```

Phaser itera os frames em loop (`repeat: -1`), alternando continuamente entre os dois arquivos.

### 5.2 Chave de Animação

Gerada pela função `buildAnimKey()` (enemies.config.ts):

```typescript
function buildAnimKey(category, frameIndex, variant = 'idle'): string {
  return `enemy.${category}.${variant}.${frameIndex}`;
}
```

**Exemplos:**
```
enemy.pest.idle.0
enemy.pest.idle.8
enemy.undead.idle.16
enemy.demon.idle.0
```

O segmento `variant` está reservado para extensão futura:

| variant | Uso pretendido |
|---------|---------------|
| `idle` | Respiração / ciclo de espera (atual) |
| `walk` | Movimento em direção ao player |
| `attack` | Frame de ataque |
| `hit` | Frame de recebimento de dano |
| `death` | Animação de morte |

### 5.3 Registro Global

Animações são registradas **uma única vez** em `BootScene.create()` via `_registerEnemyAnims()`:

```typescript
for (const def of ENEMY_DEFS) {
  const [tex0, tex1] = CATEGORY_TEXTURE_KEYS[def.category];
  const animKey = buildAnimKey(def.category, def.frameIndex);

  // Idempotente: não recria se já existir
  if (!this.anims.exists(animKey)) {
    this.anims.create({
      key: animKey,
      frames: [
        { key: tex0, frame: def.frameIndex },
        { key: tex1, frame: def.frameIndex },
      ],
      frameRate: 2,   // lento — adequado para turn-based
      repeat: -1,
    });
  }
}
```

**Total de animações criadas:** 1 por entrada em `ENEMY_DEFS` (~15 atualmente).

O `AnimationManager` do Phaser é **global por cena** — múltiplos sprites reusam a mesma definição sem duplicação de memória.

### 5.4 Parâmetros de Animação

| Parâmetro | Valor | Justificativa |
|-----------|-------|---------------|
| `frameRate` | 2 | Ritmo visual turn-based; muito rápido seria confuso |
| `repeat` | -1 | Infinito — animação nunca para |
| Frames por ciclo | 2 | Suficiente para indicar vida; mínimo de memória |

---

## 6. Distribuição Procedural por Andar

### 6.1 Regras de Categoria

```
Andares 1–2 → pest, misc, reptile
Andares 3–4 → undead
Andares 5+  → humanoid, demon
```

Implementado em `FLOOR_CATEGORY_RULES` (enemies.config.ts) como array de objetos `{ minFloor, maxFloor, categories }`.

### 6.2 Seleção Ponderada (`pickEnemyDef`)

```
1. Filtra ENEMY_DEFS pelas categorias do andar
2. Filtra pelo intervalo dungeonMin ≤ floor ≤ dungeonMax
3. Aplica weighted random por RARITY_WEIGHTS
```

**Pesos de raridade:**
```
common:   100   (~67% do peso total em um pool típico)
uncommon:  40   (~27%)
rare:      10   (~6%)
```

**Fallbacks em cascata** (logados apenas em `import.meta.env.DEV`):
1. Pool ideal: categoria + faixa correta
2. Pool relaxado: apenas faixa de dungeon
3. Pool global: primeiro inimigo definido

### 6.3 Weighted Random

```typescript
function weightedRandom<T>(items, getWeight): T {
  const total = items.reduce((sum, item) => sum + getWeight(item), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= getWeight(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1]; // guarda contra floating point
}
```

---

## 7. Ciclo de Vida de um Sprite de Inimigo

### 7.1 Spawn

```typescript
// EnemySystem.createEnemies(dungeon, playerPos, difficulty)
const def = pickEnemyDef(floor);

enemy.category   = def.category;
enemy.frameIndex = def.frameIndex;
enemy.enemyDefId = def.id;
enemy.enemyName  = def.name;
enemy.animKey    = buildAnimKey(def.category, def.frameIndex);

// HP/ATK escalam pelos multiplicadores de difficulty.config.ts
enemy.hp     = round(def.hpBase     × hpScale);
enemy.attack = round(def.damageBase × atkScale);
enemy.xp     = round(def.xpBase     × xpScale);
```

### 7.2 Criação do Sprite (`_buildEnemySprite`)

```typescript
// GameScene._buildEnemySprite(enemy)

// 1. Resolve textura com fallback
const [tex0] = CATEGORY_TEXTURE_KEYS[enemy.category];
const texKey = this.textures.exists(tex0) ? tex0 : SPRITES.ENEMY;

// 2. Cria sprite no frameIndex correto
enemy.sprite = this.add.sprite(pos.x, pos.y, texKey, enemy.frameIndex).setDepth(5);

// 3. Toca animação se registrada
if (enemy.animKey && this.anims.exists(enemy.animKey)) {
  enemy.sprite.play(enemy.animKey);
}

// 4. Barras de HP (sem alteração em relação ao sistema anterior)
enemy.hpBarBg = this.add.rectangle(..., 0x330000).setDepth(6);
enemy.hpBar   = this.add.rectangle(..., 0xff2222).setDepth(6);
```

### 7.3 Sync por Turno

`_syncEnemySprite(enemy)` — **sem alteração**. Atualiza posição e proporção da barra de HP. A animação continua tocando automaticamente pelo Phaser.

### 7.4 Feedback de Dano

`_flashSprite(sprite)` — **sem alteração**. Flash vermelho de 160ms. O tint é limpo após o flash; a animação retoma normalmente.

### 7.5 Destruição

`_removeEnemySprite(enemy)` — **sem alteração**. Destroi sprite e barras, seta `null`.

---

## 8. Fórmulas de Scaling

```
HP final     = round(def.hpBase     × enemyHpMultiplier)
ATK final    = round(def.damageBase × enemyAtkMultiplier)
XP final     = round(def.xpBase     × (1 + (floor - 1) × 0.5))

Elite HP     = HP final  × 1.5   ← AIIntegration (não alterado)
Elite ATK    = ATK final × 1.5   ← AIIntegration (não alterado)
```

Multiplicadores por andar (`difficulty.config.ts`):

| Andar | HP mult | ATK mult |
|-------|---------|----------|
| 1 | 1.00× | 1.00× |
| 2 | 1.30× | 1.20× |
| 3 | 1.70× | 1.40× |
| 4 | 2.20× | 1.65× |
| 5 | 2.80× | 1.90× |
| 6+ | +0.40/andar | +0.20/andar |

---

## 9. Campos Adicionados ao EnemySystem

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `category` | `EnemyCategory` | Categoria DawnLike |
| `frameIndex` | `number` | Índice do frame no spritesheet |
| `enemyDefId` | `string` | ID da entrada em ENEMY_DEFS |
| `enemyName` | `string` | Nome base (fallback do aiName elite) |
| `animKey` | `string` | Chave pré-calculada da animação Phaser |

**Compatibilidade:** todos os campos têm valores default e são sobrescritos por `createEnemies()`. O sistema de elites (`AIIntegration`) sobrescreve `aiName` e multiplica `hp`/`attack` — sem conflito.

---

## 10. Observabilidade (DEV)

Logs emitidos apenas quando `import.meta.env.DEV === true` (Vite dev server):

| Local | Mensagem |
|-------|----------|
| `BootScene._loadEnemySpritesheets` | Lista de chaves de textura registradas |
| `BootScene._registerEnemyAnims` | Quantidade de animações criadas |
| `enemies.config.pickEnemyDef` | Aviso se pool ideal vazio (fallback ativado) |
| `enemies.config.getAllowedCategories` | Aviso se andar sem regra de categoria |

---

## 11. Easter Egg Platino

O easter egg `DragonDePlatino (CC-BY 4.0)` presente em `GameScene._spawnPlatino()` usa:

```typescript
SPRITES.PLATINO    → 'reptiles'   (Reptile0.png carregado separadamente)
DAWNLIKE_FRAMES.PLATINO → 0
```

Não está vinculado ao sistema de inimigos. Preservado integralmente. Aparece na última sala de cada dungeon com opacidade 0.55 e crédito visível.

---

## 12. Pontos de Atenção para Aprimoramento Futuro

### 12.1 Validação Visual de frameIndex

Os índices atuais (0, 8, 16...) foram escolhidos por convenção de linha, mas **cada spritesheet pode ter variações de layout**. Antes de adicionar novos inimigos, inspecionar o PNG correspondente para confirmar que o índice aponta para o sprite correto.

Sugestão futura: criar um modo de debug que renderiza todos os frames de uma categoria lado a lado.

### 12.2 Colisão Visual com NPCs da Cidade

`humanoid0` é compartilhado entre NPCs da cidade (mercador, guarda, etc.) e inimigos `humanoid` da dungeon. O frame 0 do `humanoid0` pode ser visualmente idêntico ao mercador. Ao adicionar mais variantes, reservar frames altos (linha 3+) exclusivamente para inimigos.

### 12.3 Extensões Previstas

| Funcionalidade | O que adicionar |
|---------------|-----------------|
| Animação `walk` | Novo par de frames + `buildAnimKey(cat, frame, 'walk')` |
| Animação `attack` | Idem para `'attack'` |
| Bosses | Campo `isBoss?: boolean` em `EnemyDef` + pool separado em `pickEnemyDef` |
| Elite visual | Tint dourado no sprite ao setar `isElite = true` em `_buildEnemySprite` |
| Resistências | Campo `resistances?: ElementalType[]` em `EnemyDef` |
| Loot tables | Campo `lootTableId?: string` em `EnemyDef` |
| Bioma visual | Mapear `category` → paleta de tint por bioma de dungeon |
| Object pooling | `_buildEnemySprite` já está isolado; adicionar pool em `_createEnemySprites` |

---

## 13. Arquivos de Referência

| Arquivo | Responsabilidade |
|---------|-----------------|
| [src/config/enemies.config.ts](../src/config/enemies.config.ts) | Catálogo, distribuição, weighted random, buildAnimKey |
| [src/scenes/BootScene.ts](../src/scenes/BootScene.ts) | Preload de texturas, registro de animações |
| [src/systems/EnemySystem.ts](../src/systems/EnemySystem.ts) | Campos de identidade visual, factory `createEnemies` |
| [src/scenes/GameScene.ts](../src/scenes/GameScene.ts) | Criação e ciclo de vida dos sprites |
| [src/vite-env.d.ts](../src/vite-env.d.ts) | Tipagem de `import.meta.env` para logs DEV |
| [docs/dungeon-sprite-rendering.md](dungeon-sprite-rendering.md) | Sistema de renderização de tiles (referência complementar) |
