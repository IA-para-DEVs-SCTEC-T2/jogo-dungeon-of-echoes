# Dungeon of Echoes

**Dungeon of Echoes** é um RPG Roguelike *tile-based* desenvolvido para navegadores. O projeto une a nostalgia dos clássicos como *Castle of the Winds* com a inovação da **IA Generativa**, criando uma experiência de exploração procedural única a cada partida.

---

## Visão Geral do Jogo
O jogador assume o papel de um herói explorando andares perigosos de uma dungeon. O objetivo é avançar o máximo possível, coletando itens e derrotando inimigos, enfrentando o desafio da **morte permanente (permadeath)**.

### Principais Mecânicas
* **Movimentação e Combate em Grade:** Sistema baseado em turnos onde o posicionamento estratégico é fundamental.
* **Geração Procedural:** Os mapas são criados dinamicamente usando o algoritmo **BSP (Binary Space Partitioning)**.
* **Sistema de Identificação:** Itens como poções e pergaminhos possuem identidades desconhecidas até serem utilizados ou identificados pelo jogador.
* **Atributos de RPG:** Sistema completo com Força, Inteligência, Destreza, Constituição, Sabedoria e Carisma.

---

## Inovação com IA Generativa
Diferente de roguelikes tradicionais, o **Dungeon of Echoes** utiliza Large Language Models (LLMs) para enriquecer a narrativa e a jogabilidade:

* **Lores Dinâmicas:** Itens de raridade Épica recebem descrições de história exclusivas geradas por IA.
* **Variantes de Elite:** Inimigos poderosos em andares avançados recebem nomes e habilidades geradas dinamicamente.
* **Narrativa Emergente:** Eventos na dungeon e até a mensagem de causa da morte são personalizados de acordo com o contexto da partida.

---

## Tecnologias e Arquitetura
O projeto foi construído com foco em modularidade e boas práticas de engenharia de software:

* **Engine:** Phaser.js (JavaScript).
* **Build Tool:** Vite.
* **Qualidade de Código:** Integração de **Husky** e **Commitlint** para garantir o padrão *Conventional Commits*.
* **Arquitetura:** Organização em camadas (Apresentação, Lógica, Dados e Serviço de IA).

---

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