# Fase 3 — Sistema de Inventário, Itens e Identificação (Roguelike Clássico)

Você é um desenvolvedor sênior especialista em:

* Phaser.js
* Arquitetura de jogos
* Roguelikes clássicos (estilo Castle of the Winds)

Continue a implementação baseada nas Fases anteriores.

---

## 🎯 OBJETIVO DESTA FASE

Implementar:

* Sistema de inventário baseado em slots
* Sistema de itens (consumíveis e equipamentos simples)
* Sistema de identificação de itens (CRÍTICO)
* Coleta de itens no mapa

⚠️ NÃO implementar ainda:

* Equipamentos complexos (slots de armadura detalhados)
* Magia
* Interface gráfica avançada (UI simples é suficiente)
* IA com LLM

---

## 🧠 CONCEITO CENTRAL (CRÍTICO)

O sistema deve funcionar como roguelikes clássicos:

* Itens podem ser **desconhecidos**
* Jogador NÃO sabe o efeito real inicialmente
* Identificação ocorre por:

  * uso do item
  * ou ação específica futura (não implementar agora)

---

## 🎒 INVENTÁRIO

### 1. Player Inventory

Adicionar ao Player:

```ts
inventory: Item[] // máximo 20
```

Regras:

* Máximo: 20 slots
* Se cheio → não pode coletar item
* Itens NÃO stackam (cada item ocupa 1 slot)

---

## 📦 SISTEMA DE ITENS

### 2. Estrutura base

Criar:

```plaintext
src/entities/Item.ts
```

Estrutura mínima:

```ts
id: string
type: string // ex: "potion_heal"
name: string // nome exibido
identified: boolean

x: number
y: number
```

---

### 3. Tipos de itens (inicial)

Implementar apenas:

* Poção de cura
* Poção de veneno

Internamente:

```ts
type = "potion_heal"
type = "potion_poison"
```

---

## ❓ SISTEMA DE IDENTIFICAÇÃO (CRÍTICO)

### 4. Nome desconhecido

Antes de identificar:

* Poções devem aparecer como:

```ts
"Poção Vermelha"
"Poção Azul"
```

⚠️ O jogador NÃO sabe qual é qual

---

### 5. Nome real (após identificar)

Após usar:

* "Poção Vermelha" → vira "Poção de Cura" (por exemplo)

---

### 6. Persistência por partida

Adicionar ao Player:

```ts
identifiedItems: Record<string, boolean>
```

Regras:

* Se tipo já foi identificado → sempre mostrar nome real
* Senão → mostrar nome genérico

---

## 🗺️ ITENS NO MAPA

### 7. Spawn

* Spawnar 3–6 itens no dungeon
* Posicionar em tiles livres

---

### 8. Coleta

Regra:

* Se player andar sobre item:

  * item vai para inventário
  * remove do mapa

---

## ⚙️ USO DE ITENS

### 9. Ação de uso

Adicionar nova Action:

```ts
{ type: "USE_ITEM", itemIndex: number }
```

---

### 10. Comportamento

#### Poção de cura:

```ts
player.hp += 10
```

#### Poção de veneno:

```ts
player.hp -= 5
```

---

### 11. Identificação ao usar

Ao usar:

```ts
player.identifiedItems[item.type] = true
item.identified = true
```

---

## 🎮 INPUT SIMPLES

Implementar:

* Tecla:

  * I → logar inventário no console
  * 1–9 → usar item do slot

---

## 🧾 EXEMPLO DE INVENTÁRIO

Console:

```plaintext
[0] Poção Vermelha
[1] Poção Azul
```

Após identificar:

```plaintext
[0] Poção de Cura
[1] Poção de Veneno
```

---

## 🔁 INTEGRAÇÃO COM TURN SYSTEM

* Usar item consome turno
* Deve passar pelo TurnManager

---

## 💀 EDGE CASES

* Inventário cheio → impedir coleta
* Usar item inválido → ignorar
* HP não pode ultrapassar máximo
* HP não pode ser menor que 0

---

## 🖥️ FEEDBACK

Logs simples:

* "Você pegou uma Poção Vermelha"
* "Você usou Poção Vermelha"
* "Você se sente melhor"
* "Você foi envenenado"

---

## 🧱 ARQUITETURA

Criar:

```plaintext
src/systems/InventorySystem.ts
```

Responsabilidades:

* Adicionar item
* Remover item
* Usar item
* Verificar capacidade

---

## 📦 SAÍDA ESPERADA

Você deve gerar:

1. Código do Item
2. Código do InventorySystem
3. Atualização do Player
4. Integração com GameScene
5. Integração com TurnManager
6. Explicação breve

---

## ⚠️ ERROS QUE NÃO DEVEM OCORRER

* Mostrar efeito real antes da identificação
* Itens stackando
* Uso de item sem consumir turno
* Identificação global (deve ser por partida)

---

## 📌 REFERÊNCIA

O comportamento deve seguir o padrão clássico de roguelikes como Castle of the Winds:

* Itens misteriosos
* Descoberta por risco
* Aprendizado dentro da run

---

Quando terminar, aguarde a Fase 4.
