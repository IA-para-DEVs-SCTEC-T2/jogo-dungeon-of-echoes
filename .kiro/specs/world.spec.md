# Spec — World System (WorldSystem + TownMap)

## Descrição

O WorldSystem gerencia o estado do mundo entre transições de área dentro de uma sessão de jogo. Permite que a dungeon gerada proceduralmente seja preservada quando o player retorna à cidade e restaurada ao re-entrar.

---

## Áreas

| Área     | Mapa           | Inimigos | Itens           |
|----------|----------------|----------|-----------------|
| `town`   | Fixo (TownMap) | Nenhum   | Nenhum          |
| `dungeon`| BSP procedural | Sim (respawn sempre) | Sim (persistem) |

---

## TownMap

- Mapa fixo 24×20 tiles
- Borda: `WALL`; interior: `FLOOR`
- `startPos` da cidade: tile `(12, 8)` — onde o player reaparece ao voltar da dungeon
- Saída para dungeon: tile `(12, 18)` — marcado com retângulo laranja `[ DUNGEON ]`
- Implementado como subclasse de `DungeonGenerator` para compatibilidade com `TurnManager` e `EnemySystem` sem alterar suas assinaturas

### Pipeline de Geração da Cidade

O layout da cidade segue um pipeline de dados antes de ser renderizado:

```
TOWN_CONFIG (town.config.ts)
  → CityLayoutProcessor.process()
      - Lê biomeOverrides do config (opcional)
      - Atribui biomas por região: urban / natural / interior / transition
      - Resolve visuais via TileVariantResolver (frame determinístico por posição)
      - Produz ProcessedTownLayout { groundTiles[][], worldObjects[], npcs[], interactive[] }
  → GameScene._loadTown()
      - Renderiza groundTiles[y][x] com frame resolvido (sem magic numbers)
      - Instancia NPCController para cada NPC do layout
      - Instancia InteractiveObjectSystem com objetos interativos
```

`TownConfig` aceita `biomeOverrides?: Record<string, BiomeType>` para sobrescrever o bioma de regiões específicas por tile key (`"x,y"`).

### Sistemas da Cidade

| Sistema | Arquivo | Responsabilidade |
|---------|---------|-----------------|
| `CityLayoutProcessor` | `src/generators/CityLayoutProcessor.ts` | Lê TOWN_CONFIG, atribui biomas, resolve tiles, produz `ProcessedTownLayout` |
| `TileVariantResolver` | `src/generators/TileVariantResolver.ts` | Hash xorshift por posição + seleção ponderada de frame (determinístico por sessão) |
| `NPCController` | `src/systems/NPCController.ts` | FSM Idle → Wander; move NPCs 1 tile/step dentro de `wanderBounds` |
| `InteractiveObjectSystem` | `src/systems/InteractiveObjectSystem.ts` | Detecta adjacência do player a portas/signs; exibe/oculta prompt "[E] Interagir" |
| `CityDecorationSystem` | `src/systems/CityDecorationSystem.ts` | Renderiza `WorldObjectDef[]` e `TownLabelDef[]`; depth = `LAYER_WORLD_BASE + gridY * 10` |

### NPCs e Objetos

- **Guarda**: sem `wanderBounds` → estático; `interaction.type = 'menu'` → abre `DialogPanel` com 4 opções de ajuda (objetivos, como jogar, controles, dicas)
- **Mercador**: `wanderBounds` ±2 tiles; `interaction.type = 'shop'` → abre loja com 2 abas (Comprar/Vender); requer player dentro de `houseBounds` da taverna
- **Taberneiro** (ex-Estalajadeiro): `wanderBounds`; `interaction.type = 'menu'` → menu de descanso; "Repousar (20 ouros)" restaura HP+Mana ao máximo se player tiver ouro suficiente
- **Gato**: `customWanderBounds` dedicado (tile (3,9), área sul da praça); FSM wander livre; não atravessa paredes
- `NPCController.update(delta, grid)` é chamado em `GameScene.update()` a cada frame
- `InteractiveObjectSystem._canInteract()`: NPCs com `houseBounds` exigem player dentro dos bounds; demais usam adjacência ortogonal (4 direções)

---

## WorldSystem (singleton)

```ts
type DungeonState = {
  dungeon: DungeonGenerator;  // instância em memória (grid, rooms, startPos)
  items: Item[];              // itens ainda no chão (gridX !== null)
  floorFrame: number;         // variante visual do floor para esta sessão
};
```

| Método          | Descrição                                          |
|-----------------|----------------------------------------------------|
| `hasDungeon()`  | `true` se existe dungeon salva na sessão           |
| `saveDungeon()` | Armazena `DungeonState` ao sair da dungeon         |
| `loadDungeon()` | Retorna `DungeonState` salva (ou `null`)           |
| `clearDungeon()`| Limpa estado — chamado em `GameScene.create()`     |

---

## Fluxo de Transição

```
Cidade → Dungeon:
  player pisa em (EXIT_X, EXIT_Y)
  → WorldSystem.hasDungeon()?
    false → DungeonGenerator.generate() (nova dungeon)
    true  → restaura DungeonState (mesma dungeon)
  → inimigos sempre recriados (respawn)
  → sprites de itens do chão recriados
  → player posicionado em dungeon.startPos
  → _canExitDungeon = false

Dungeon → Cidade:
  player se move para fora de startPos → _canExitDungeon = true
  player retorna a dungeon.startPos com _canExitDungeon = true
  → WorldSystem.saveDungeon({ dungeon, items, floorFrame })
  → _loadArea('town')
  → player posicionado em TOWN.START_X, TOWN.START_Y
```

---

## Regras

- R1: `WorldSystem.clearDungeon()` é chamado em `GameScene.create()` — garante fresh start
- R2: Inimigos NÃO são salvos no `DungeonState` — sempre respawnam ao entrar na dungeon
- R3: Itens coletados (no inventário) têm `gridX === null` — não são salvos no estado do chão
- R4: Sprites de tiles e entidades são destruídos/recriados a cada troca de área (`_cleanup()`); `NPCController` e `InteractiveObjectSystem` também são destruídos em `_cleanup()`
- R5: Player (stats, inventário, HP) persiste entre áreas pois `GameScene` não reinicia
- R6: `_canExitDungeon` começa `false` ao entrar na dungeon; torna-se `true` após o player mover-se para fora do `startPos`

---

## Eventos

| Evento        | Payload          | Quem emite    | Quem escuta |
|---------------|------------------|---------------|-------------|
| `AREA_CHANGED`| `{ area: 'town' \| 'dungeon' }` | GameScene | (futuro: UIScene) |

---

## Cenários Testáveis

### Cenário 1 — Primeira entrada na dungeon
- **Dado**: `worldSystem.hasDungeon() === false`
- **Quando**: player pisa em (EXIT_X, EXIT_Y)
- **Então**: nova dungeon gerada, `worldSystem.saveDungeon()` ainda não chamado

### Cenário 2 — Retorno à cidade preserva dungeon
- **Dado**: player explorou dungeon, voltou para startPos
- **Quando**: `_checkAreaTransition()` detecta posição = startPos + `_canExitDungeon === true`
- **Então**: `worldSystem.saveDungeon()` chamado com itens do chão atuais

### Cenário 3 — Re-entrada na dungeon restaura estado
- **Dado**: `worldSystem.hasDungeon() === true`
- **Quando**: player pisa em (EXIT_X, EXIT_Y) novamente
- **Então**: mesma dungeon (mesmo grid), sprites de itens recriados, inimigos novos (respawn)
