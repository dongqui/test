import * as d3 from 'd3';

type D3ScaleLinear = d3.ScaleLinear<number, number, never>;

class ScaleLinear {
  private static scaleX: D3ScaleLinear;
  private static keyframeX: D3ScaleLinear;

  static setScaleX(width: number) {
    const scaleX = d3.scaleLinear().domain([-100, 10000]).range([0, width]);
    ScaleLinear.scaleX = scaleX;
  }

  static getScaleX() {
    return ScaleLinear.scaleX;
  }

  static rescaleXByZoom(transform: d3.ZoomTransform) {
    ScaleLinear.scaleX = transform.rescaleX(ScaleLinear.scaleX);
  }

  static setKeyframeX(transform: d3.ZoomTransform) {
    ScaleLinear.keyframeX = transform.rescaleX(ScaleLinear.scaleX);
  }

  static getKeyframeX() {
    return ScaleLinear.keyframeX;
  }
}

export default ScaleLinear;
