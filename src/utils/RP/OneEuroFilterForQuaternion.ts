import { Quaternion } from '@babylonjs/core';
import { isNull } from 'lodash';

/**
 * OneEuroFilter for quaternion transformKeys
 */
export default class OneEuroFilterForQuaternion {
  private minCutoff: number = 1.0;
  private beta: number = 0.0;
  private dCutoff: number = 1.0;

  private prevX: Quaternion | null = null;
  private prevDxTe: Quaternion | null = null;
  private prevT: number | null = null;
  private prevTe: number | null = null;

  constructor(minCutoff: number, beta: number) {
    this.minCutoff = minCutoff;
    this.beta = beta;
  }

  private _smoothFactor(te: number, cutoff: number) {
    const r = 2 * Math.PI * cutoff * te;
    return r / (r + 1);
  }

  private _exponentialSmooth(a: number, x: Quaternion, prevX: Quaternion) {
    return Quaternion.Slerp(x, prevX, a);
  }

  public calculate(t: number, x: Quaternion) {
    if (isNull(this.prevX) || isNull(this.prevDxTe) || isNull(this.prevT) || isNull(this.prevTe)) {
      this.prevX = x;
      this.prevDxTe = Quaternion.Identity();
      this.prevT = t;
      this.prevTe = t;
      return x;
    }

    const te = t - this.prevT;
    const ad = this._smoothFactor(te, this.dCutoff);
    const inversedPrevX = Quaternion.Inverse(this.prevX.clone());
    const dxTe = x.multiply(inversedPrevX);
    if (this.prevTe <= 0) {
      this.prevTe = te;
    }
    const hatDxTe = this._exponentialSmooth(Math.pow(ad, te / this.prevTe), dxTe, this.prevDxTe);
    const cutoff = this.minCutoff + (this.beta * hatDxTe.length()) / te;
    const a = this._smoothFactor(te, cutoff);
    const hatX = this._exponentialSmooth(a, x, this.prevX);

    this.prevX = hatX;
    this.prevDxTe = hatDxTe;
    this.prevT = t;
    this.prevTe = te;

    return hatX;
  }
}
