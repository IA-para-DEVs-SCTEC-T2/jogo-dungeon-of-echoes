import type { VisualDef } from '../config/sprites-config';

export class TileVariantResolver {
  private _seed: number;

  constructor(seed = Date.now()) { this._seed = seed; }

  resolve(set: VisualDef, x: number, y: number): number {
    const r = this._hash(x, y);
    return this._weightedPick(set.frames, set.weights, r);
  }

  private _hash(x: number, y: number): number {
    let n = this._seed ^ (x * 374761393) ^ (y * 1103515245);
    n = ((n >> 16) ^ n) * 0x45d9f3b;
    return (n >>> 0) / 0xffffffff;
  }

  private _weightedPick(frames: number[], weights: number[], r: number): number {
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (r < acc) return frames[i];
    }
    return frames[frames.length - 1];
  }
}
