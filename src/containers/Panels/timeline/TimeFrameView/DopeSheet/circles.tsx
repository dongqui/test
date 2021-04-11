import React, { memo, useEffect } from 'react';
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

  useEffect(() => {
    if (circleGroupRef.current) {
      d3.select(circleGroupRef.current)
        .selectAll('circle')
        .data(dopeSheetData.times as number[])
        .join('circle')
        .attr('cx', (time) => prevXScale(time * 30))
        .attr('cy', TRACK_HEIGHT / 2)
        .attr('r', CIRCLE_RADIUS);
    }
  }, [circleGroupRef, dopeSheetData, prevXScale]);

  useEffect(() => {
    d3.selectAll('circle')
      .on('mouseenter', (event) => {
        event.target.style.cursor = 'pointer';
      })
      .on('mouseout', (event) => {
        event.target.style.cursor = '';
      })
      .on('click', (event, data) => {
        const { trackName, layerKey, isLocked, isTransformTrack } = dopeSheetData;
        if (!isLocked && isTransformTrack) {
          const keyframeData: KeyframeData = {
            key: `${layerKey}&&${trackName}&&${data}`,
            trackName,
            layerKey,
            time: data as number,
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
      });
  }, [deleteTargetKeyframes, dopeSheetData]);

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
