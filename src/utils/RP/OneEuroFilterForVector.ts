import * as BABYLON from '@babylonjs/core';
import { isNull } from 'lodash';

/**
 * OneEuroFilter for vector transformKeys
 */
export default class OneEuroFilterForVector {
  private minCutoff: number = 1.0;
  private beta: number = 0.0;
  private dCutoff: number = 1.0;

  private prevX: BABYLON.Vector3 | null = null;
  private prevDx: BABYLON.Vector3 | null = null;
  private prevT: number | null = null;

  constructor(minCutoff: number, beta: number) {
    this.minCutoff = minCutoff;
    this.beta = beta;
  }

  private _smoothFactor(te: number, cutoff: number) {
    const r = 2 * Math.PI * cutoff * te;
    return r / (r + 1);
  }
  private _exponentialSmooth(a: number, x: BABYLON.Vector3, prevX: BABYLON.Vector3) {
    return x.scale(a).add(prevX.scale(1 - a));
  }

  public calculate(t: number, x: BABYLON.Vector3) {
    if (isNull(this.prevX) || isNull(this.prevDx) || isNull(this.prevT)) {
      this.prevX = x;
      this.prevDx = BABYLON.Vector3.Zero();
      this.prevT = t;
      return x;
    }

    const te = t - this.prevT;
    const ad = this._smoothFactor(te, this.dCutoff);
    const dx = x.subtract(this.prevX).scale(1 / te);
    const hatDx = this._exponentialSmooth(ad, dx, this.prevDx);
    const cutoff = this.minCutoff + this.beta + hatDx.length();
    const a = this._smoothFactor(te, cutoff);
    const hatX = this._exponentialSmooth(a, x, this.prevX);

    this.prevX = hatX;
    this.prevDx = hatDx;
    this.prevT = t;

    return hatX;
  }
}
