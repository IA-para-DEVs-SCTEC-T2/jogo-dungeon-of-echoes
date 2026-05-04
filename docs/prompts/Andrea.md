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
