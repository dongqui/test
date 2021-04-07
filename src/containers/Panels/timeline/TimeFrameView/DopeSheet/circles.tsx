import React, { memo, useEffect } from 'react';
import * as d3 from 'd3';
import { TPDopeSheet } from 'types/TP';

interface Props {
  circleGroupRef: React.RefObject<SVGSVGElement>;
  dopeSheetData: TPDopeSheet;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const CIRCLE_RADIUS = 4; // 원 반지름 크기

const Circles: React.FC<Props> = ({ circleGroupRef, dopeSheetData, prevXScale }) => {
  // circle 생성
  useEffect(() => {
    if (circleGroupRef.current) {
      d3.select(circleGroupRef.current)
        .selectAll('circle')
        .data(dopeSheetData.times as number[])
        .join('circle')
        .attr('cx', (time) => prevXScale(time * 30))
        .attr('cy', TRACK_HEIGHT / 2)
        .attr('r', CIRCLE_RADIUS)
        .on('mouseenter', (event) => {
          event.target.style.cursor = 'pointer';
        })
        .on('mouseout', (event) => {
          event.target.style.cursor = '';
        });
    }
  }, [circleGroupRef, dopeSheetData, prevXScale]);

  return <></>;
};

export default memo(Circles, (prevProps, nextProps) => {
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
