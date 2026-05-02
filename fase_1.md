# Fase 1 — Implementação Inicial (MVP Jogável)

Você é um desenvolvedor sênior especialista em:

* JavaScript
* Phaser.js
* Jogos roguelike clássicos (inspirados em Castle of the Winds)

Sua tarefa é iniciar a implementação do projeto descrito no documento de Game Design fornecido anteriormente.

---

## 🎯 OBJETIVO DESTA FASE

Criar um **protótipo jogável mínimo** contendo:

* Inicialização do jogo com Phaser.js
* Configuração correta para pixel art
* Geração de uma dungeon simples (grid 2D)
* Renderização com tileset (DAWNLIKE 16x16)
* Player controlável
* Movimento em grid (tile-based)
* Sistema de câmera seguindo o jogador

⚠️ NÃO implementar ainda:

* Combate
* Inventário
* IA
* Sistema de magia
* Integração com LLM

---

## ⚙️ CONFIGURAÇÕES OBRIGATÓRIAS

* Phaser versão 4
* Build com Vite
* Usar pixel art:

```js
pixelArt: true
```

* Tile size: **16x16**
* Tileset: **Dawnlike**

---

## 🧱 ESCOPO TÉCNICO

### 1. Estrutura inicial do projeto

Crie a base seguindo essa estrutura:

```
src/
  main.ts
  scenes/
    BootScene.ts
    GameScene.ts
  systems/
  entities/
    Player.ts
  generators/
    DungeonGenerator.ts
  utils/
    constants.ts
```

---

### 2. Configuração do Phaser

* Criar `main.ts`
* Configurar:

  * width/height
  * scene pipeline
  * pixelArt: true
  * physics (arcade)

---

### 3. Dungeon simples (IMPORTANTE)

Implementar um gerador simples (NÃO precisa BSP ainda):

* Grid: 40x40
* Tiles:

  * 0 = chão
  * 1 = parede

Regras:

* Bordas sempre parede
* Interior com salas simples ou random walk

---

### 4. Renderização

* Usar Tilemap ou renderização manual
* Tiles 16x16
* Diferenciar visualmente:

  * chão
  * parede

---

### 5. Player

Criar entidade Player com:

```ts
x: number
y: number
```

* Spawn no centro do mapa
* Representação simples (sprite ou quadrado)

---

### 6. Movimento (CRÍTICO)

* Movimento em grid (não livre)
* Teclas:

  * WASD ou setas
* Regras:

  * Não atravessar paredes
  * Movimento 1 tile por input
  * Sem movimento contínuo

---

### 7. Câmera

* Camera deve seguir o player
* Zoom opcional (leve aproximação)

---

## 🧠 BOAS PRÁTICAS

* Código modular
* Separar lógica de renderização
* Evitar código monolítico
* Tipagem com TypeScript

---

## 📦 SAÍDA ESPERADA

Você deve gerar:

1. Estrutura de arquivos
2. Código completo dos arquivos iniciais
3. Explicação breve de cada parte

---

## ⚠️ IMPORTANTE

* NÃO simplifique o movimento para livre (tem que ser tile-based)
* NÃO use lógica improvisada fora da arquitetura
* NÃO implemente sistemas extras

---

## 📌 CONTEXTO DO JOGO

Este projeto é inspirado em Castle of the Winds, portanto:

* Movimento deve parecer “grid clássico”
* Simples, funcional, sem efeitos desnecessários

---

Quando terminar, aguarde próxima fase.
