import * as d3 from 'd3';
import { D3SVGGElement, D3ScaleLinear } from 'types/TP/d3';

// top ruler의 눈금 숫자 생성
export const createTopRulerNumbers = (topRuler: D3SVGGElement, scaleX: D3ScaleLinear) => {
  topRuler.call(d3.axisTop(scaleX));
};
