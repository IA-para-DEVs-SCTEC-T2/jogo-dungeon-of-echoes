# Spec — Game Loop

## Descrição
O Game Loop coordena o estado geral do jogo: inicialização, atualização por frame/turno, renderização e transição entre estados (jogando, game over).

---

## Estados do Jogo

| Estado    | Descrição                                      |
|-----------|------------------------------------------------|
| PLAYING   | Jogo em andamento, input do player ativo       |
| GAME_OVER | Player morreu, input bloqueado, tela exibida   |
| PAUSED    | (Futuro) Jogo pausado                          |

---

## Cenas Phaser

| Cena       | Responsabilidade                                      |
|------------|-------------------------------------------------------|
| BootScene  | Carrega assets, exibe tela de loading, inicia GameScene |
| GameScene  | Cena principal — dungeon, player, inimigos, HUD       |
| GameOverScene | Exibe pontuação final, botão de reiniciar         |

---

## Ciclo de Atualização (GameScene.update)

```
1. Verificar input do player
2. Se input detectado:
   a. Calcular tile destino
   b. Se FLOOR e sem inimigo → mover player
   c. Se FLOOR e com inimigo → iniciar combate
   d. Se WALL → ignorar
3. Verificar condição de game over (player.hp <= 0)
4. Atualizar HUD (HP, XP, Level)
5. Renderizar estado atual
```

---

## Inputs

- Eventos de teclado (gerenciados pelo Phaser InputPlugin)
- Estado interno do jogo (player, dungeon, enemies)

---

## Outputs

- Tela renderizada a cada frame
- Transição para `GameOverScene` quando player morre
- HUD atualizado com HP, XP e Level do player

---

## HUD (Heads-Up Display)

| Elemento | Posição    | Conteúdo                    |
|----------|------------|-----------------------------|
| HP Bar   | Topo-esquerdo | Barra visual + "HP: X/Y" |
| XP Text  | Topo-esquerdo | "XP: X / Y"               |
| Level    | Topo-esquerdo | "Nível: X"                |

---

## Regras

- R1: Input só é processado no estado PLAYING
- R2: Apenas um input é processado por frame (sem fila de inputs)
- R3: HUD é atualizado após cada ação do player
- R4: Transição para GameOver ocorre imediatamente quando `player-died` é emitido
- R5: GameOverScene exibe XP total e nível atingido
- R6: Botão "Jogar Novamente" reinicia a GameScene do zero (nova dungeon)
- R7: A câmera segue o player, centralizando-o na tela

---

## Casos de Erro

| Situação                              | Comportamento Esperado                        |
|---------------------------------------|-----------------------------------------------|
| GameScene iniciada sem dungeon gerada | Gerar dungeon antes de posicionar entidades   |
| Player posicionado em WALL            | Reposicionar no startPos da dungeon           |
| Todos inimigos mortos                 | Jogo continua (MVP sem condição de vitória)   |

---

## Cenários Testáveis

### Cenário 1 — Inicialização correta
- **Dado**: GameScene criada
- **Quando**: `create()` executado
- **Então**: Dungeon gerada, player posicionado em startPos, inimigos em salas, HUD visível

### Cenário 2 — Game Over acionado
- **Dado**: Player com HP = 0
- **Quando**: Evento `player-died` emitido
- **Então**: GameOverScene iniciada com dados do player (XP, level)

### Cenário 3 — Reinício do jogo
- **Dado**: GameOverScene exibida
- **Quando**: Botão "Jogar Novamente" clicado
- **Então**: GameScene reiniciada, nova dungeon gerada, player resetado

### Cenário 4 — Câmera segue o player
- **Dado**: Player se move para posição fora do viewport inicial
- **Quando**: Movimento executado
- **Então**: Câmera reposicionada para centralizar o player
