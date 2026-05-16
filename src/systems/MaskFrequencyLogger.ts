import { SemanticGrid, SemanticValue } from './SemanticClassifier';
import { WALL_VARIANT_LUT, WallVariant, computeRawMask, sanitizeMask } from './WallVariantLUT';

// Logger de frequência de bitmasks — dev-only, tree-shakeable em produção.
//
// Uso:
//   const logger = new MaskFrequencyLogger();
//   // após buildCommands, chamar record() para cada tile WALL_EDGE
//   logger.report(); // imprime no console
//
// Ajuda a:
//   - identificar masks dominantes (candidatos a frames dedicados)
//   - detectar masks impossíveis (nunca aparecem em mapas BSP)
//   - verificar que BODY aparece raramente (bom sinal visual)
export class MaskFrequencyLogger {
  private _counts = new Map<number, number>(); // sanitizedMask → count
  private _variantCounts = new Map<WallVariant, number>();

  reset(): void {
    this._counts.clear();
    this._variantCounts.clear();
  }

  record(grid: number[][], sem: SemanticGrid, x: number, y: number): void {
    if (sem[y]?.[x] !== SemanticValue.WALL_EDGE) return;
    const mask = sanitizeMask(computeRawMask(grid, x, y));
    this._counts.set(mask, (this._counts.get(mask) ?? 0) + 1);
    const variant = WALL_VARIANT_LUT[mask];
    this._variantCounts.set(variant, (this._variantCounts.get(variant) ?? 0) + 1);
  }

  report(): void {
    const sorted = [...this._counts.entries()].sort((a, b) => b[1] - a[1]);
    const total  = sorted.reduce((s, [, c]) => s + c, 0);

    console.group('[MaskFrequencyLogger] Bitmask distribution');
    console.log(`Total WALL_EDGE tiles: ${total}`);
    console.log('');
    console.log('Top masks:');
    for (const [mask, count] of sorted.slice(0, 20)) {
      const variant = WALL_VARIANT_LUT[mask];
      const pct = ((count / total) * 100).toFixed(1);
      console.log(
        `  0b${mask.toString(2).padStart(8, '0')} (${String(mask).padStart(3)}) → ${WallVariant[variant].padEnd(12)} : ${count}x (${pct}%)`
      );
    }

    console.log('');
    console.log('Variant totals:');
    const variantSorted = [...this._variantCounts.entries()].sort((a, b) => b[1] - a[1]);
    for (const [variant, count] of variantSorted) {
      const pct = ((count / total) * 100).toFixed(1);
      console.log(`  ${WallVariant[variant].padEnd(12)} : ${count}x (${pct}%)`);
    }

    const allSanitized = new Set(sorted.map(([m]) => m));
    const unusedCount = Array.from({ length: 256 }, (_, i) => sanitizeMask(i))
      .filter(m => !allSanitized.has(m)).length;
    console.log(`\nUnused sanitized masks: ${unusedCount} (of 256)`);
    console.groupEnd();
  }
}
