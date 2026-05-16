# Tasks — Fase 7 Polimento

- [x] 1. Adicionar Floor Label no HUD da UIScene
  - Adicionar campo `_floorLabel: Phaser.GameObjects.Text` em `src/scenes/UIScene.ts`
  - Criar o texto no método `_createStatsPanel()` após `_arrowLabel`, com texto inicial 'Cidade' e cor '#88ddff'
  - Registrar listener para `EVENTS.AREA_CHANGED` em `_registerEvents()` que atualiza o label com 'Andar: N' ou 'Cidade'
  - Adicionar `EventBus.off(EVENTS.AREA_CHANGED, undefined, this)` no `shutdown()`
  - Aumentar altura do retângulo de fundo do painel de stats de 88 para 104
  - _Requirements: R1, R6_

- [x] 2. Corrigir GameOverScene para voltar ao MainMenuScene
  - Em `src/scenes/GameOverScene.ts`, mudar `_restart()` de `this.scene.start('GameScene')` para `this.scene.start('MainMenuScene')`
  - _Requirements: R4, R5_

- [x] 3. Implementar FogOfWarSystem
  - Criar `src/systems/FogOfWarSystem.ts` com classe `FogOfWarSystem`
  - Implementar método `update(tiles, playerGridX, playerGridY, radius)` que calcula tiles visíveis (círculo de raio 5) e aplica alpha: 1 para visível, 0.35 para visitado, 0 para não visitado
  - Implementar método `reset()` que limpa os sets de visitados e visíveis
  - Usar `TILE_SIZE` de constants para calcular posição grid a partir de pixel
  - _Requirements: R2_

- [x] 4. Integrar FogOfWarSystem na GameScene
  - Importar e instanciar `FogOfWarSystem` em `src/scenes/GameScene.ts`
  - Chamar `_fogOfWar.reset()` no método `_cleanup()`
  - Chamar `_fogOfWar.update()` após movimento do player na dungeon (dentro do bloco `result.playerMoved`)
  - Chamar `_fogOfWar.update()` ao final de `_loadDungeonFloor()` após posicionar o player
  - _Requirements: R2_

- [ ] 5. Adicionar destaque visual em inimigos próximos
  - Em `src/scenes/GameScene.ts`, modificar `_syncEnemySprite()` para aplicar tint 0xff9999 em inimigos a raio <= 3 tiles do player
  - Modificar `_flashSprite()` para usar flag `flashing` via `sprite.setData('flashing', true/false)` para evitar conflito com tint de proximidade
  - Só aplicar tint de proximidade se `!enemy.sprite.getData('flashing')`
  - _Requirements: R3_
