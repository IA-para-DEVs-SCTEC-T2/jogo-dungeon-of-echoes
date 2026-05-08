# Rafael — Prompt Log

## feature/visual-damage-feedback

**Objetivo:** Adicionar feedback visual de dano ao combate.

**Prompt utilizado:**
> "Pense como um desenvolvedor de jogos senior e analise este projeto e me sugira alguma melhoria de nível básico."
> Escolha: item 2 — Feedback visual de dano (números flutuantes + flash no sprite).

**O que foi implementado:**
- Números flutuantes animados ao receber dano: `-N` vermelho sobre o player, amarelo sobre inimigos
- Flash vermelho no sprite atingido (tween alpha + tint, ~160ms)
- Novos eventos `DAMAGE_PLAYER` e `DAMAGE_ENEMY` no `EventBus`
- `CombatSystem.resolve()` emite os eventos com posição em pixels via `getPixelPos()` opcional
- `GameScene._flashSprite()`: método reutilizável para qualquer sprite
- Fix: script `test` no `package.json` ajustado para Windows (Node.js v21)
