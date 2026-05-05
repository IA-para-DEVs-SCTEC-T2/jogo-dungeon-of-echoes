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

## Prompt 2 — docs(specs): add minimap spec
Autor: Andrea
Data: 2026-05-05

Prompt utilizado:
> "Pense como um desenvolvedor senior, analise o projeto e sugira alguma melhoria que eu possa fazer para colaborar com o projeto, mas leve em consideração que sou aprendiz."

O que foi feito:

1. Analisado o estado atual do projeto (v0.2.0, 82 testes passando, TurnManager implementado).

2. Identificado o Minimap como contribuição ideal para aprendiz: documentação pura, sem alteração de código, complemento natural ao Fog of War já especificado.

3. Criada branch `feature/minimap-spec` seguindo o padrão `feature/*` do projeto.

4. Criado `.kiro/specs/minimap.spec.md` seguindo o formato das specs existentes, cobrindo:
   - Componente `MinimapRenderer` gerenciado pela UIScene
   - Posição fixa no canto superior direito via `setScrollFactor(0)`
   - Tamanho 80×80px (grid 40×40 com tileSize=2px)
   - 3 cores integradas ao Fog of War: HIDDEN (preto), REVEALED (cinza escuro), VISIBLE (cinza claro)
   - Marcador do player (azul, sempre visível)
   - Marcadores de inimigos (vermelho, apenas em tiles VISIBLE e alive=true)
   - Atualização por turno via EventBus (PLAYER_MOVED, PLAYER_ATTACKED, ENEMY_DIED)
   - Constante `MINIMAP` proposta para `constants.ts`
   - 10 cenários testáveis com Given/When/Then
   - Seção de integração com UIScene, FogSystem, EventBus e GameScene

5. Atualizado `CHANGELOG.md` com entrada na seção `[Unreleased]`.

Resultado:
Spec completa e pronta para guiar a implementação do Minimap, sem nenhuma alteração no código de produção ou nos testes existentes (82 testes passando).

Branch criada: `feature/minimap-spec`
