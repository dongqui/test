import * as d3 from 'd3';
import { D3ScaleLinear } from 'types/TP';

class Scale {
  private static scaleX: D3ScaleLinear;

  static setScale(width: number) {
    const scaleX = d3.scaleLinear().domain([-100, 10000]).range([0, width]);
    this.scaleX = scaleX;
  }

  static rescaleXByZoom(rescaleX: D3ScaleLinear) {
    this.scaleX = rescaleX;
  }

  static getScaleX() {
    return this.scaleX;
  }
}

export default Scale;
