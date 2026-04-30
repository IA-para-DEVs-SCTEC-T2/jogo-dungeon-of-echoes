# jogo-dungeon-of-echoes
Dungeon of Echoes – Jogo estilo Roguelike desenvolvido pela Equipe 7

## Como começar
1. Clone o repositório.
2. Certifique-se de estar usando o **Node.js 20**.
3. Instale as dependências para ativar o Husky:
```
npm install
```

## Padrões de Commit

Este projeto utiliza **Commitlint** e **Husky** para garantir que o histórico de mensagens seja limpo e padronizado. Seguimos a convenção [Conventional Commits](https://www.conventionalcommits.org/).

### Como commitar:
As mensagens devem seguir o formato: `tipo: descrição curta` (em inglês ou português, conforme a regra da equipe).

**Principais tipos:**
* `feat: add shadow effect to echoes` (Nova funcionalidade)
* `fix: resolve crash on floor 3 generation` (Correção de bug)
* `chore: update commitlint configuration` (Mudanças em arquivos de configuração/build)
* `docs: update readme with commit standards` (Documentação)
* `refactor: optimize isometric grid calculation` (Melhoria de código sem mudar função)

**Exemplos:**
* feat: add shadow effect to echoes
* fix: resolve crash on floor 3 generation
* chore: update commitlint configuration

> **Nota:** Se a mensagem estiver fora do padrão, o Husky impedirá o commit localmente.
