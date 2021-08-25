import * as d3 from 'd3';
import { D3ScaleLinear } from 'types/TP';

class Scale {
  private static scaleX: D3ScaleLinear;

  static setScale(width: number) {
    const scaleX = d3.scaleLinear().domain([-50, 9999]).range([0, width]);
    this.scaleX = scaleX;
  }

  static getScaleX() {
    return this.scaleX;
  }
}

export default Scale;
