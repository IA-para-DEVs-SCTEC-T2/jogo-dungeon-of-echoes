# Fase 7 — Polimento, UI e Preparação para Demo

## Requisitos Funcionais

### R1 — HUD com indicador de Andar
O HUD deve exibir o andar atual (floor) da dungeon. Quando o jogador estiver na cidade ou área bônus, deve exibir "Cidade". Quando estiver na dungeon, deve exibir "Andar: N".

### R2 — Fog of War na Dungeon
A dungeon deve implementar fog of war:
- Tiles não visitados: completamente escuros (alpha 0 ou tint preto)
- Tiles visitados mas fora do campo de visão: escurecidos (alpha ~0.4)
- Tiles no campo de visão do player (raio 5): visíveis normalmente

### R3 — Destaque de Inimigos Próximos
Inimigos dentro de raio 3 tiles do player devem ter um tint levemente avermelhado para indicar perigo iminente.

### R4 — GameOverScene volta ao MainMenuScene
O botão "Jogar Novamente" e as teclas ENTER/SPACE na GameOverScene devem iniciar a `MainMenuScene` (não a `GameScene` diretamente), para que o jogador passe pela seleção de classe novamente.

### R5 — Fluxo completo validado
O fluxo Menu → CharacterSelect → Game → GameOver → Menu deve funcionar sem erros ou estados corrompidos.

### R6 — Floor label no HUD
A UIScene deve escutar o evento `AREA_CHANGED` e atualizar um label de floor visível no painel de stats.

### R7 — Evento FLOOR_CHANGED no constants
Adicionar `FLOOR_LABEL_CHANGED` ao objeto EVENTS em constants.ts para comunicar o andar atual à UIScene.
