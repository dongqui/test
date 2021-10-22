import * as BABYLON from '@babylonjs/core';
import _ from 'lodash';

export default class OneEuroFilterForQuaternion {
  private minCutoff: number = 1.0;
  private beta: number = 0.0;
  private dCutoff: number = 1.0;

  private prevX: BABYLON.Quaternion | null = null;
  private prevDxTe: BABYLON.Quaternion | null = null;
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

  private _exponentialSmooth(a: number, x: BABYLON.Quaternion, prevX: BABYLON.Quaternion) {
    return BABYLON.Quaternion.Slerp(x, prevX, a);
  }

  public calculate(t: number, x: BABYLON.Quaternion) {
    if (
      _.isNull(this.prevX) ||
      _.isNull(this.prevDxTe) ||
      _.isNull(this.prevT) ||
      _.isNull(this.prevTe)
    ) {
      this.prevX = x;
      this.prevDxTe = BABYLON.Quaternion.Identity();
      this.prevT = t;
      this.prevTe = t;
      console.log('q false');
      return x;
    }

    const te = t - this.prevT;
    const ad = this._smoothFactor(te, this.dCutoff);
    const inversedPrevX = BABYLON.Quaternion.Inverse(this.prevX.clone());
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
