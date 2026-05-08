/**
 * InventorySystem.ts — Sistema de inventário e uso de itens
 * Fase 3: Sistema de Inventário, Itens e Identificação
 *
 * Responsabilidades:
 * - Adicionar / remover itens
 * - Usar item (aplica efeito + identifica)
 * - Verificar capacidade
 */

import { Item } from '../entities/Item';
import { INVENTORY } from '../utils/constants';

export interface UseItemResult {
  success: boolean;
  messages: string[];
  hpDelta: number;       // positivo = cura, negativo = dano
  identified: boolean;   // se este uso identificou o item pela primeira vez
}

export class InventorySystem {
  private _items: (Item | null)[];

  constructor() {
    this._items = new Array(INVENTORY.MAX_SLOTS).fill(null);
  }

  // ─── Consulta ────────────────────────────────────────────────────────────

  get items(): (Item | null)[] {
    return this._items;
  }

  isFull(): boolean {
    return this._items.every((slot) => slot !== null);
  }

  count(): number {
    return this._items.filter((s) => s !== null).length;
  }

  getItem(index: number): Item | null {
    return this._items[index] ?? null;
  }

  // ─── Adicionar ───────────────────────────────────────────────────────────

  /**
   * Adiciona item ao primeiro slot livre.
   * Retorna true se adicionado, false se inventário cheio.
   */
  addItem(item: Item): boolean {
    if (this.isFull()) return false;

    const slot = this._items.findIndex((s) => s === null);
    this._items[slot] = item;

    // Remove do mapa
    item.gridX = null;
    item.gridY = null;

    return true;
  }

  // ─── Remover ─────────────────────────────────────────────────────────────

  removeItem(index: number): Item | null {
    const item = this._items[index];
    if (!item) return null;
    this._items[index] = null;
    return item;
  }

  // ─── Usar ────────────────────────────────────────────────────────────────

  /**
   * Usa o item no slot `index`.
   * Aplica efeito, identifica o item e remove do inventário.
   *
   * @param index - Índice do slot (0–19)
   * @param identifiedItems - Mapa de identificação do player (mutado in-place)
   * @param currentHp - HP atual do player (para calcular cura sem ultrapassar máximo)
   * @param maxHp - HP máximo do player
   */
  useItem(
    index: number,
    identifiedItems: Record<string, boolean>,
    currentHp: number,
    maxHp: number,
  ): UseItemResult {
    const item = this._items[index];

    if (!item) {
      return { success: false, messages: ['Slot vazio.'], hpDelta: 0, identified: false };
    }

    const displayName = item.getDisplayName(identifiedItems);
    const messages: string[] = [];
    let hpDelta = 0;

    messages.push(`Você usou ${displayName}`);

    // ─── Efeito do item ──────────────────────────────────────────────────
    if (item.type === 'potion_heal') {
      const heal = Math.min(INVENTORY.POTION_HEAL_AMOUNT, maxHp - currentHp);
      hpDelta = heal;
      messages.push('Você se sente melhor');
    } else if (item.type === 'potion_poison') {
      hpDelta = -INVENTORY.POTION_POISON_AMOUNT;
      messages.push('Você foi envenenado');
    }

    // ─── Identificação ───────────────────────────────────────────────────
    const wasIdentified = identifiedItems[item.type] === true;
    identifiedItems[item.type] = true;
    item.identified = true;

    const justIdentified = !wasIdentified;
    if (justIdentified) {
      messages.push(`Identificado: ${item.getDisplayName(identifiedItems)}`);
    }

    // ─── Remover do inventário ───────────────────────────────────────────
    this._items[index] = null;

    return { success: true, messages, hpDelta, identified: justIdentified };
  }

  // ─── Log do inventário ───────────────────────────────────────────────────

  /**
   * Retorna linhas de texto para exibir o inventário no console.
   */
  getInventoryLog(identifiedItems: Record<string, boolean>): string[] {
    const lines: string[] = ['=== Inventário ==='];
    let hasItems = false;

    this._items.forEach((item, i) => {
      if (item) {
        lines.push(`[${i}] ${item.getDisplayName(identifiedItems)}`);
        hasItems = true;
      }
    });

    if (!hasItems) lines.push('(vazio)');
    return lines;
  }

  // ─── Reset ───────────────────────────────────────────────────────────────

  reset(): void {
    this._items = new Array(INVENTORY.MAX_SLOTS).fill(null);
  }
}
