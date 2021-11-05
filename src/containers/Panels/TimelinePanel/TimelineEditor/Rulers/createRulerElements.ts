import * as d3 from 'd3';
import { D3SVGGElement, D3ScaleLinear } from 'types/TP/d3';

// top ruler의 눈금 숫자 생성
export const createTopRulerNumbers = (topRuler: D3SVGGElement, scaleX: D3ScaleLinear) => {
  topRuler.call(d3.axisTop(scaleX));
};

// top ruler의 grid line 생성
export const createTopRulerGridLine = (topRuler: D3SVGGElement) => {
  topRuler.selectAll('line').attr('y1', -6).attr('y2', 2000);
};
