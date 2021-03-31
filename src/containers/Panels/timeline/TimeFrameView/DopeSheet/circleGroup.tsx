import React, { memo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TPDopeSheet } from 'types/TP';

interface Props {
  dopeSheetData: TPDopeSheet;
  xScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 48; // 트랙 높이
const CIRCLE_RADIUS = 12; // 원 반지름 크기
const DOPE_SHEET_MARGIN = { top: 8, right: 20, bottom: 30, left: 30 }; // dope sheet에 적용 된 margin

const CircleGroup: React.FC<Props> = ({ dopeSheetData, xScale }) => {
  const circleGroupRef = useRef<SVGSVGElement>(null);

  // circle 생성
  useEffect(() => {
    if (circleGroupRef.current) {
      d3.select(circleGroupRef.current)
        .selectAll('circle')
        .data(dopeSheetData.times as number[])
        .join('circle')
        .attr('cx', (time) => xScale(time) + CIRCLE_RADIUS * 0.25)
        .attr('cy', TRACK_HEIGHT - DOPE_SHEET_MARGIN.top - CIRCLE_RADIUS * 1.5)
        .attr('r', CIRCLE_RADIUS)
        .attr('stroke', '#ffffff');
    }
  }, [dopeSheetData, xScale]);

  return (
    <svg className="circle-group" width="100%" height={TRACK_HEIGHT} ref={circleGroupRef}>
      <rect width="100%" height={TRACK_HEIGHT} fill="#151515" strokeDasharray="100, 50" />
    </svg>
  );
};

export default memo(CircleGroup, (prevProps, nextProps) => {
  const { isClickedParentTrack: prevIsClickedParentTrack } = prevProps.dopeSheetData;
  const { isClickedParentTrack: nextIsClickedParentTrack } = nextProps.dopeSheetData;

  if (prevIsClickedParentTrack === nextIsClickedParentTrack) return true;
  return false;
});
