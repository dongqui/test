import React, { memo, useCallback, useEffect } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { TPDopeSheet, KeyframeData } from 'types/TP';
import { useReactiveVar } from '@apollo/client';
import { storeDeleteTargetKeyframes } from 'lib/store';

interface Props {
  circleGroupRef: React.RefObject<SVGSVGElement>;
  dopeSheetData: TPDopeSheet;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const CIRCLE_RADIUS = 4; // 원 반지름 크기

const Circles: React.FC<Props> = ({ circleGroupRef, dopeSheetData, prevXScale }) => {
  // circle 생성
  const deleteTargetKeyframes = useReactiveVar(storeDeleteTargetKeyframes);

  // circle 클릭 이벤트
  const clickCircle = useCallback(
    (event, data) => {
      const { trackName, layerKey, isLocked, isTransformTrack, trackIndex } = dopeSheetData;
      if (!isLocked && isTransformTrack) {
        const keyframeData: KeyframeData = {
          key: `${layerKey}&&${trackName}&&${data}`,
          trackName,
          layerKey,
          time: data as number,
          isTransformTrack,
          trackIndex,
        };
        if (event.ctrlKey || event.metaKey) {
          const targetKeyframeIndex = _.findIndex(
            deleteTargetKeyframes,
            (keyframe) => keyframe.key === keyframeData.key,
          );
          if (targetKeyframeIndex === -1) {
            storeDeleteTargetKeyframes([...deleteTargetKeyframes, keyframeData]);
          } else {
            storeDeleteTargetKeyframes(
              _.filter(deleteTargetKeyframes, (_, idx) => idx !== targetKeyframeIndex),
            );
          }
        } else {
          if (deleteTargetKeyframes.length === 0) {
            storeDeleteTargetKeyframes([keyframeData]);
          }
        }
      }
    },
    [deleteTargetKeyframes, dopeSheetData],
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
        .attr('r', CIRCLE_RADIUS)
        .style('fill', dopeSheetData.isLocked ? '#404040' : '#7A7A7A');
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
    isLocked: prevIsLocked,
    times: prevTimes,
  } = prevProps.dopeSheetData;
  const {
    isClickedParentTrack: nextIsClickedParentTrack,
    isFiltered: nextIsFiltered,
    isLocked: nextIsLocked,
    times: nextTimes,
  } = nextProps.dopeSheetData;

  if (!_.isEqual(prevTimes, nextTimes)) return false;
  if (prevIsLocked !== nextIsLocked) return false;
  if (prevIsClickedParentTrack === nextIsClickedParentTrack) return true;
  if (prevIsFiltered === nextIsFiltered) return true;
  return false;
});
