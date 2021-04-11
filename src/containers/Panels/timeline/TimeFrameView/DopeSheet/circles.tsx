import React, { memo, useCallback, useEffect } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { TPDopeSheet } from 'types/TP';
import { useReactiveVar } from '@apollo/client';
import { storeDeleteTargetTime } from 'lib/store';

interface Props {
  circleGroupRef: React.RefObject<SVGSVGElement>;
  dopeSheetData: TPDopeSheet;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const CIRCLE_RADIUS = 4; // 원 반지름 크기

const Circles: React.FC<Props> = ({ circleGroupRef, dopeSheetData, prevXScale }) => {
  const deleteTargetTime = useReactiveVar(storeDeleteTargetTime);

  // circle 클릭 이벤트
  const clickCircle = useCallback(
    (event, data) => {
      if (event.ctrlKey || event.metaKey) {
        if (deleteTargetTime && data === deleteTargetTime) {
          storeDeleteTargetTime(undefined);
        }
      } else {
        if (!deleteTargetTime || (deleteTargetTime && data !== deleteTargetTime)) {
          storeDeleteTargetTime(data as number);
        }
      }
    },
    [deleteTargetTime],
  );

  // circle 생성
  useEffect(() => {
    if (circleGroupRef.current && dopeSheetData.times) {
      d3.select(circleGroupRef.current)
        .selectAll('circle')
        .data(dopeSheetData.times)
        .join('circle')
        .attr('cx', (time) => prevXScale(time * 30))
        .attr('cy', TRACK_HEIGHT / 2)
        .attr('r', CIRCLE_RADIUS);
    }
  }, [circleGroupRef, dopeSheetData, prevXScale]);

  // circle에 이벤트 추가
  useEffect(() => {
    d3.select(circleGroupRef.current)
      .selectAll('circle')
      .on('mouseenter', (event) => {
        event.target.style.cursor = 'pointer';
      })
      .on('mouseout', (event) => {
        event.target.style.cursor = '';
      })
      .on('click', (event, data) => clickCircle(event, data));
  }, [circleGroupRef, clickCircle]);

  return <></>;
};

export default memo(Circles, (prevProps, nextProps) => {
  const {
    isClickedParentTrack: prevIsClickedParentTrack,
    isFiltered: prevIsFiltered,
    times: prevTimes,
  } = prevProps.dopeSheetData;
  const {
    isClickedParentTrack: nextIsClickedParentTrack,
    isFiltered: nextIsFiltered,
    times: nextTimes,
  } = nextProps.dopeSheetData;

  if (!_.isEqual(prevTimes, nextTimes)) return false;
  if (prevIsClickedParentTrack === nextIsClickedParentTrack) return true;
  if (prevIsFiltered === nextIsFiltered) return true;
  return false;
});
