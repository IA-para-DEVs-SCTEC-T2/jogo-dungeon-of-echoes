# Design Técnico — Fase 7

## Arquitetura Existente

O projeto usa Phaser.js com TypeScript. A comunicação entre cenas é feita via `EventBus` (pub/sub global). A `UIScene` roda em paralelo com a `GameScene` e escuta eventos do `EventBus`.

## Mudanças por Requisito

### R1 + R6 — Floor Label no HUD

**Arquivo:** `src/scenes/UIScene.ts`

Adicionar um `_floorLabel: Phaser.GameObjects.Text` no painel de stats (abaixo do `_goldLabel`).

Escutar o evento `EVENTS.AREA_CHANGED` no `_registerEvents()`:
```ts
EventBus.on(EVENTS.AREA_CHANGED, (data: { area: string; floor?: number }) => {
  if (!this.sys.isActive() || !this._floorLabel?.active) return;
  if (data.area === 'dungeon') {
    this._floorLabel.setText(`Andar: ${data.floor ?? 1}`);
  } else {
    this._floorLabel.setText('Cidade');
  }
}, this);
```

Também registrar o off() no `shutdown()`.

### R2 — Fog of War

**Arquivo novo:** `src/systems/FogOfWarSystem.ts`

```ts
export class FogOfWarSystem {
  private _visited: Set<string> = new Set();
  private _visible: Set<string> = new Set();
  private _overlays: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  update(scene: Phaser.Scene, tiles: Phaser.GameObjects.Image[], playerGridX: number, playerGridY: number, radius = 5): void
  reset(): void
}
```

A lógica:
1. Calcular tiles visíveis (círculo de raio 5 ao redor do player)
2. Adicionar tiles visíveis ao set `_visited`
3. Para cada tile renderizado:
   - Se visível: alpha = 1
   - Se visitado mas não visível: alpha = 0.4
   - Se não visitado: alpha = 0

**Integração em `GameScene`:**
- Instanciar `FogOfWarSystem` no `create()`
- Chamar `fogOfWar.update()` após cada movimento do player na dungeon
- Chamar `fogOfWar.reset()` no `_cleanup()`

### R3 — Destaque de Inimigos Próximos

**Arquivo:** `src/scenes/GameScene.ts`

No método `_syncEnemySprite()`, adicionar lógica de tint:
```ts
const dist = Math.max(Math.abs(enemy.gridX - this.player.gridX), Math.abs(enemy.gridY - this.player.gridY));
if (dist <= 3 && enemy.alive) {
  enemy.sprite?.setTint(0xff8888);
} else {
  enemy.sprite?.clearTint();
}
```

Cuidado: não sobrescrever o tint do flash de dano. Usar flag `_isFlashing` no EnemySystem ou verificar se o tween está ativo.

### R4 — GameOverScene volta ao MainMenuScene

**Arquivo:** `src/scenes/GameOverScene.ts`

Mudar o método `_restart()`:
```ts
private _restart(): void {
  this.scene.start('MainMenuScene');  // era 'GameScene'
}
```

### R5 — Fluxo completo

Verificar que `GameScene._registerEvents()` para `PLAYER_DIED` faz:
1. `this.scene.stop('UIScene')`
2. `this.scene.start('GameOverScene', { ...dados })`

Isso já existe. Apenas garantir que `GameOverScene._restart()` vai para `MainMenuScene`.

## Estrutura de Arquivos Modificados

```
src/
  scenes/
    UIScene.ts          — adicionar _floorLabel + listener AREA_CHANGED
    GameOverScene.ts    — _restart() → MainMenuScene
    GameScene.ts        — integrar FogOfWarSystem + destaque inimigos próximos
  systems/
    FogOfWarSystem.ts   — NOVO: fog of war
```
