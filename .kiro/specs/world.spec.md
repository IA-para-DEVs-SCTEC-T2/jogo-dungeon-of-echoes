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

- Mapa fixo 30×25 tiles (TMX 20×15 + padding 5 de cada lado)
- Baseado em `Town.tmx` (Dawnlike) renderizado por `TownTMXRenderer`
- `startPos` da cidade: tile `(TOWN.START_X, TOWN.START_Y)` — onde o player reaparece ao voltar da dungeon
- Saídas para dungeon: definidas via `entrarDungeon: true` em `MANUAL_MAP_OVERRIDES` — atualmente tiles game(12,24)/(13,24)/(14,24)
- Tiles de chão com variantes visuais determinísticas; overrides de tile por coordenada TMX via `MANUAL_MAP_OVERRIDES`
- Implementado como subclasse de `DungeonGenerator` para compatibilidade com `TurnManager` e `EnemySystem` sem alterar suas assinaturas

### Pipeline de Renderização da Cidade

O layout da cidade segue um pipeline de dados antes de ser renderizado:

```
TownTMXData (TownTMXData.ts)
  + MANUAL_MAP_OVERRIDES (TileProperties.ts)
  → TownTMXRenderer.render()
      - Itera TMX_TILES_LAYER e TMX_SPRITES_LAYER
      - Aplica TMX_REMOVED_POSITIONS (sprites ignorados) antes de qualquer render
      - Aplica MANUAL_MAP_OVERRIDES por coordenada "tmxX,tmxY" (forceGid, walkable, entrarDungeon, interaction)
      - NPCs derivados de TMX_NPC_OVERRIDES e TileOverride.interaction (signs/placas)
      - Produz { collisionGrid, npcSpawns, dungeonEntries }
  → GameScene._loadTown()
      - Instancia NPCController com npcSpawns
      - Armazena dungeonEntries em _dungeonEntryTiles
      - Registra spawns de retorno da dungeon no norte dos dungeonEntries
```

`MANUAL_MAP_OVERRIDES` é o mecanismo central de customização: chave `"tmxX,tmxY"`, suporte a `forceGid`, `overlayGid`, `walkable`, `entrarDungeon`, `npcName` e `interaction`.

### Sistemas da Cidade

| Sistema | Arquivo | Responsabilidade |
|---------|---------|-----------------|
| `CityLayoutProcessor` | `src/generators/CityLayoutProcessor.ts` | Lê TOWN_CONFIG, atribui biomas, resolve tiles, produz `ProcessedTownLayout` |
| `TileVariantResolver` | `src/generators/TileVariantResolver.ts` | Hash xorshift por posição + seleção ponderada de frame (determinístico por sessão) |
| `NPCController` | `src/systems/NPCController.ts` | FSM Idle → Wander; move NPCs 1 tile/step dentro de `wanderBounds` |
| `InteractiveObjectSystem` | `src/systems/InteractiveObjectSystem.ts` | Detecta adjacência do player a portas/signs; exibe/oculta prompt "[E] Interagir" |
| `CityDecorationSystem` | `src/systems/CityDecorationSystem.ts` | Renderiza `WorldObjectDef[]` e `TownLabelDef[]`; depth = `LAYER_WORLD_BASE + gridY * 10` |

### NPCs e Objetos

- **Guarda** (TMX 10,10 e 9,11): `wanderBounds {minX:9,maxX:16,minY:10,maxY:17}`; `interaction.type = 'dialogue'` com mensagem de patrulha
- **Mercador** (TMX 2,6): estático (sem `wanderBounds`); `interactRange: 2`; `interaction.type = 'shop'` → abre loja com 2 abas (Comprar/Vender)
- **Estalajadeiro** (TMX 16,3): estático; `interactRange: 2` (permite interação de até 2 tiles de distância); `interaction.type = 'menu'` → menu de descanso; "Repousar (20 ouro)" restaura HP+Mana ao máximo
- **Gato**: `customWanderBounds` dedicado; FSM wander livre; não atravessa paredes
- **Placa** (TMX 12,12): NPC estático gerado via `TileOverride.interaction`; `interaction.type = 'dialogue'` com mensagem de boas-vindas
- `NPCController.update(delta, grid)` é chamado em `GameScene.update()` a cada frame; `getAllNPCs()` retorna posição atual (não a de spawn)
- `InteractiveObjectSystem._canInteract()`: usa `interactRange ?? 1` para manhattan distance; posição atual do NPC via `getAllNPCs()`

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
  player pisa em qualquer tile com entrarDungeon: true (_dungeonEntryTiles)
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
