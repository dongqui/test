import * as d3 from 'd3';
import { D3SVGGElement, D3ScaleLinear } from 'types/TP/d3';

// top grid line 생성
export const createTopGridLine = (topGrid: D3SVGGElement, scaleX: D3ScaleLinear) => {
  topGrid.call(d3.axisTop(scaleX));
  topGrid.selectAll('line').attr('y1', -6).attr('y2', 2000);
};
