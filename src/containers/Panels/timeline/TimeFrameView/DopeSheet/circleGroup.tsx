import React, { memo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TPDopeSheet } from 'types/TP';

interface Props {
  dopeSheetData: TPDopeSheet;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 48; // 트랙 높이
const CIRCLE_RADIUS = 12; // 원 반지름 크기
const DOPE_SHEET_MARGIN = { top: 8, right: 20, bottom: 30, left: 30 }; // dope sheet에 적용 된 margin

const CircleGroup: React.FC<Props> = ({ dopeSheetData, prevXScale }) => {
  const circleGroupRef = useRef<SVGSVGElement>(null);

  // circle 생성
  useEffect(() => {
    if (circleGroupRef.current) {
      d3.select(circleGroupRef.current)
        .selectAll('circle')
        .data(dopeSheetData.times as number[])
        .join('circle')
        .attr('cx', (time) => prevXScale(time * 30))
        .attr('cy', TRACK_HEIGHT - DOPE_SHEET_MARGIN.top - CIRCLE_RADIUS * 1.5)
        .attr('r', CIRCLE_RADIUS)
        .attr('stroke', '#ffffff')
        .on('mouseenter', (event) => {
          event.target.style.cursor = 'pointer';
        })
        .on('mouseout', (event) => {
          event.target.style.cursor = '';
        })
        .on('click', (event, time) => {
          console.log('event: ', event);
          console.log('time: ', time);
        });
    }
  }, [dopeSheetData, prevXScale]);

  return (
    <svg className="circle-group" width="100%" height={TRACK_HEIGHT} ref={circleGroupRef}>
      <title style={{ display: 'none' }}>{dopeSheetData.trackIndex}</title>
      <rect width="100%" height={TRACK_HEIGHT} fill="#151515" strokeDasharray="100, 50" />
    </svg>
  );
};

export default memo(CircleGroup, (prevProps, nextProps) => {
  const {
    isClickedParentTrack: prevIsClickedParentTrack,
    isFiltered: prevIsFiltered,
  } = prevProps.dopeSheetData;
  const {
    isClickedParentTrack: nextIsClickedParentTrack,
    isFiltered: nextIsFiltered,
  } = nextProps.dopeSheetData;

  if (prevIsClickedParentTrack === nextIsClickedParentTrack) return true;
  if (prevIsFiltered === nextIsFiltered) return true;
  return false;
});
