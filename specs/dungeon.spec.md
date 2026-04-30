# Spec — Dungeon

## Descrição
A Dungeon é o mapa onde o jogo acontece. É gerada proceduralmente usando um algoritmo simples de salas e corredores sobre um grid 2D. Cada célula do grid é um tile com um tipo definido.

---

## Tipos de Tile

| Tipo  | Valor | Descrição                        |
|-------|-------|----------------------------------|
| WALL  | 0     | Parede — bloqueia movimento      |
| FLOOR | 1     | Chão — permite movimento         |

---

## Atributos da Dungeon

| Atributo  | Tipo     | Descrição                              |
|-----------|----------|----------------------------------------|
| width     | number   | Largura do grid em tiles               |
| height    | number   | Altura do grid em tiles                |
| grid      | number[] | Array 2D representando os tiles        |
| rooms     | Room[]   | Lista de salas geradas                 |
| startPos  | {x, y}   | Posição inicial do player              |

---

## Estrutura de uma Sala (Room)

```js
{
  x: number,      // coluna do tile superior-esquerdo
  y: number,      // linha do tile superior-esquerdo
  width: number,  // largura em tiles
  height: number  // altura em tiles
}
```

---

## Inputs

- `width`: largura desejada do grid (padrão: 40)
- `height`: altura desejada do grid (padrão: 30)
- `roomCount`: número de salas a tentar gerar (padrão: 8)
- `seed`: (opcional) semente para reprodutibilidade futura

---

## Outputs

- Grid 2D preenchido com WALL e FLOOR
- Lista de salas geradas com sucesso
- Posição inicial do player (centro da primeira sala)

---

## Algoritmo de Geração

1. Inicializar todo o grid como WALL
2. Tentar gerar `roomCount` salas aleatórias:
   - Tamanho: entre 4×4 e 10×8 tiles
   - Posição: aleatória dentro dos limites do grid (com margem de 1 tile)
   - Rejeitar sala se sobrepõe outra sala existente
3. Para cada par de salas consecutivas, criar um corredor em L:
   - Corredor horizontal até o X da sala destino
   - Corredor vertical até o Y da sala destino
4. Definir `startPos` como o centro da primeira sala gerada

---

## Regras

- R1: O grid sempre tem uma borda de WALL (linha 0, linha height-1, coluna 0, coluna width-1)
- R2: Toda sala gerada tem pelo menos 4×4 tiles internos de FLOOR
- R3: Todas as salas são conectadas por corredores
- R4: `startPos` sempre aponta para um tile FLOOR
- R5: O grid nunca é modificado após a geração (imutável durante a sessão)

---

## Casos de Erro

| Situação                              | Comportamento Esperado                        |
|---------------------------------------|-----------------------------------------------|
| Nenhuma sala cabe no grid             | Gerar ao menos 1 sala mínima no centro        |
| Todas as tentativas de sala falham    | Usar fallback: 1 sala central 6×6             |
| Coordenada fora dos limites acessada  | Retornar WALL (0) sem lançar exceção          |

---

## Cenários Testáveis

### Cenário 1 — Grid inicializado como WALL
- **Dado**: Dungeon criada com width=40, height=30
- **Quando**: Geração executada
- **Então**: Todas as bordas são WALL

### Cenário 2 — Salas são FLOOR
- **Dado**: Dungeon gerada com 5 salas
- **Quando**: Verificar tiles internos de cada sala
- **Então**: Todos os tiles internos são FLOOR (1)

### Cenário 3 — startPos é FLOOR
- **Dado**: Dungeon gerada
- **Quando**: Verificar `grid[startPos.y][startPos.x]`
- **Então**: Valor é 1 (FLOOR)

### Cenário 4 — Acesso fora dos limites
- **Dado**: Grid 40×30
- **Quando**: `getTile(50, 50)` chamado
- **Então**: Retorna 0 (WALL) sem erro
