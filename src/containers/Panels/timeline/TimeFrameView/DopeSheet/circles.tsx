import React, { memo, useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { TPDopeSheet } from 'types/TP';
import { useReactiveVar } from '@apollo/client';
import { storeDeleteTargetKeyframes, storeTPDopeSheetList, storeTPLastBoneList } from 'lib/store';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { fnClickAnyKeyframeToMouse, fnClickAnyKeyframeToCtrl } from 'utils/TP/dopeSheetUtils';

interface Props {
  circleGroupRef: React.RefObject<SVGSVGElement>;
  dopeSheetData: TPDopeSheet;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const CIRCLE_RADIUS = 4; // 원 반지름 크기

const Circles: React.FC<Props> = ({ circleGroupRef, dopeSheetData, prevXScale }) => {
  const deleteTargetKeyframes = useReactiveVar(storeDeleteTargetKeyframes);
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
  const prevClickedCircles = useRef<number[]>([]);

  // circle 클릭 이벤트
  const clickCircle = useCallback(
    (event, { time }) => {
      const { trackName, layerKey, trackIndex, isLocked } = dopeSheetData;
      if (trackIndex === 1) return;
      if (event.ctrlKey || event.metaKey) {
        const keyframeDataList = fnClickAnyKeyframeToCtrl({
          deleteTargetKeyframes,
          dopeSheetList,
          lastBoneList,
          layerKey,
          time,
          trackName,
          trackIndex,
          isLocked,
        });
        storeDeleteTargetKeyframes(_.sortBy(keyframeDataList, ['trackIndex', 'time']));
      } else {
        const keyframeDataList = fnClickAnyKeyframeToMouse({
          dopeSheetList,
          lastBoneList,
          layerKey,
          time,
          trackName,
          trackIndex,
          isLocked,
        });
        storeDeleteTargetKeyframes(_.sortBy(keyframeDataList, ['trackIndex', 'time']));
      }
    },
    [deleteTargetKeyframes, dopeSheetData, dopeSheetList, lastBoneList],
  );

  // circle 생성
  useEffect(() => {
    if (circleGroupRef.current && dopeSheetData.times && prevXScale) {
      const { isLocked, times } = dopeSheetData;
      d3.select(circleGroupRef.current)
        .selectAll('circle')
        .data(times)
        .join('circle')
        .attr('cx', ({ time }) => prevXScale(time * 30))
        .attr('cy', TRACK_HEIGHT / 2)
        .attr('r', CIRCLE_RADIUS)
        .style('fill', isLocked ? '#404040' : '#7A7A7A');
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

  // 키프레임 클릭 효과 적용/해제
  useEffect(() => {
    if (circleGroupRef.current && deleteTargetKeyframes) {
      // 클릭 효과 제거
      _.forEach(prevClickedCircles.current, (index) => {
        const targetCircle = circleGroupRef.current?.childNodes[index];
        d3.select(targetCircle as Element).style(
          'fill',
          dopeSheetData.isLocked ? '#404040' : '#7A7A7A',
        );
      });

      const { trackIndex, times, isLocked } = dopeSheetData;
      const existed = fnGetBinarySearch({
        collection: deleteTargetKeyframes,
        index: trackIndex,
        key: 'trackIndex',
      });

      // 이진 검색 결과가 -1이 아닌 경우(검색 대상을 찾은 경우)
      if (existed !== -1) {
        for (let index = existed; index < deleteTargetKeyframes.length; index += 1) {
          if (deleteTargetKeyframes[index].trackIndex !== trackIndex) break;
          const { time } = deleteTargetKeyframes[index];
          const targetIndex = fnGetBinarySearch({
            collection: times,
            index: time,
            key: 'time',
          });

          // 클릭 효과 적용
          const targetCircle = circleGroupRef.current.childNodes[targetIndex + 1];
          d3.select(targetCircle as Element).style('fill', '#F9D454');
          prevClickedCircles.current.push(targetIndex + 1);
        }

        for (let index = existed; 0 <= index; index -= 1) {
          if (deleteTargetKeyframes[index].trackIndex !== trackIndex) break;
          const { time } = deleteTargetKeyframes[index];
          const targetIndex = fnGetBinarySearch({
            collection: times,
            index: time,
            key: 'time',
          });

          // 클릭 효과 적용
          const targetCircle = circleGroupRef.current.childNodes[targetIndex + 1];
          d3.select(targetCircle as Element).style('fill', '#F9D454');
          prevClickedCircles.current.push(targetIndex + 1);
        }
      }
      // 이진 검색 결과가 -1인 경우(검색 대상을 찾지 못한 경우)
      else {
        prevClickedCircles.current = [];
      }
    }
  }, [circleGroupRef, deleteTargetKeyframes, dopeSheetData]);

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
  if (prevIsClickedParentTrack !== nextIsClickedParentTrack) return false;
  if (prevIsFiltered !== nextIsFiltered) return false;
  return true;
});
