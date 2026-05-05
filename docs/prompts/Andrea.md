## Prompt 1 — docs(specs): add fog-of-war spec
Autor: Andrea
Data: 2026-05-04

Prompt utilizado:
> "Pense como um desenvolvedor senior e especialista em jogos deste tipo e sugira algo simples que possa ser usado como contribuição para melhorar o jogo, mas precisa ser algo para usar na pasta specs"

O que foi feito:

1. Identificada a lacuna mais relevante para um roguelike: o Fog of War, já mencionado como planejado na `dungeon.spec.md` mas sem especificação formal.

2. Criada branch `feature/fog-of-war-spec` seguindo o padrão `feature/*` do projeto.

3. Criado `.kiro/specs/fog-of-war.spec.md` seguindo o formato das specs existentes, cobrindo:
   - 3 estados de visibilidade: `HIDDEN`, `VISIBLE`, `REVEALED`
   - Raio de visão por distância de Chebyshev (`visionRadius = 5`)
   - Revelação de sala inteira ao entrar (independente do raio)
   - Ocultação de sprites de inimigos fora do campo de visão atual
   - Constante `FOG` proposta para `constants.ts`
   - 10 cenários testáveis, incluindo 2 property-based tests de monotonicidade de estado
   - Seção de integração com sistemas existentes (GameScene, EventBus, EnemySystem)

4. Atualizado `CHANGELOG.md` com entrada na seção `[Unreleased]`.

Resultado:
Spec completa e pronta para guiar a implementação do Fog of War, sem nenhuma alteração no código de produção ou nos testes existentes (48 testes passando).

Branch criada: `feature/fog-of-war-spec`

## Prompt 3 — feat(inventory): Fase 3 — Sistema de Inventário, Itens e Identificação
Autor: Andrea
Data: 2026-05-05

Prompt utilizado:
> Arquivo fase_3.md fornecido pelo professor com especificação completa da Fase 3.

O que foi feito:

1. Criada branch `feature/inventory-system` a partir de `staging`.

2. Criado `src/entities/Item.ts`:
   - Entidade pura com `id`, `type`, `identified`, `gridX`, `gridY`, `sprite`
   - `getDisplayName()` retorna nome genérico ou real conforme estado de identificação
   - Tipos: `potion_heal` e `potion_poison`

3. Criado `src/systems/InventorySystem.ts`:
   - 20 slots, sem stacking
   - `addItem()`, `removeItem()`, `useItem()`, `isFull()`, `getInventoryLog()`
   - `useItem()` aplica efeito, identifica o tipo e remove do inventário

4. Atualizado `src/entities/Player.ts`:
   - Adicionados `inventory: InventorySystem` e `identifiedItems: Record<string, boolean>`
   - `reset()` limpa inventário e identificação para nova partida

5. Atualizado `src/systems/TurnManager.ts`:
   - Nova ação `USE_ITEM` que consome turno, aplica efeito de HP e emite eventos

6. Atualizado `src/scenes/GameScene.ts`:
   - `_spawnItems()`: spawna 3–6 itens aleatórios no mapa
   - `_checkItemPickup()`: coleta automática ao mover para tile com item
   - Input `I`: loga inventário; teclas `1–9`: usam item do slot

7. Atualizado `src/utils/constants.ts`:
   - Constante `INVENTORY` e eventos `ITEM_PICKED_UP`, `ITEM_USED`

8. Criado `tests/inventory.test.js` com 26 testes cobrindo todos os cenários da spec.

Resultado:
108 testes passando. Sistema de inventário completo e funcional seguindo o padrão roguelike clássico.

Branch criada: `feature/inventory-system`
