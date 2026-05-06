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
- R4: Sprites de tiles e entidades são destruídos/recriados a cada troca de área (`_cleanup()`)
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
