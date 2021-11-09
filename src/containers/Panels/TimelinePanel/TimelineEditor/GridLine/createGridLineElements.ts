import { D3SVGGElement } from 'types/TP/d3';

// top ruler의 grid line 생성
export const createTopGridLine = (topRuler: D3SVGGElement) => {
  topRuler.selectAll('line').attr('y1', -6).attr('y2', 2000);
};
