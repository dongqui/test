import React, { memo, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import produce from 'immer';
import * as d3 from 'd3';
import _ from 'lodash';
import { useSelector } from 'reducers';
import {
  fnGetBinarySearch,
  fnGetBoneTrackIndex,
  fnGetLayerTrackIndex,
  fnUpdateSelectedKeyframes,
} from 'utils/TP/trackUtils';
import { TP_TRACK_INDEX } from 'utils/const';
import { d3ScaleLinear } from 'types/TP';
import * as timelineActions from 'actions/timeline';

interface Props {
  circleGroupRef: React.RefObject<SVGSVGElement>;
  dopeSheetScale: d3ScaleLinear;
  isLocked: boolean;
  times: number[];
  layerKey: string;
  trackIndex: number;
  trackName: string;
}

const CIRCLE_RADIUS = 4;
const KEYFRAME_COLOR = {
  default: '#7A7A7A',
  locked: '#404040',
  selected: '#F9D454',
};
const TRACK_HEIGHT = 32;

const Circles: React.FC<Props> = ({
  circleGroupRef,
  isLocked,
  layerKey,
  times,
  trackIndex,
  trackName,
  dopeSheetScale,
}) => {
  const dispatch = useDispatch();
  const lastBoneOfLayers = useSelector((state) => state.timeline.lastBoneOfLayers);
  const trackList = useSelector((state) => state.timeline.trackList);
  const selectedKeyframes = useSelector((state) => state.timeline.selectedKeyframes);
  const selectedKeyframeIndices = useRef(new Set());

  // circle 생성
  useEffect(() => {
    if (circleGroupRef.current && dopeSheetScale) {
      d3.select(circleGroupRef.current)
        .selectAll('circle')
        .data(times)
        .join('circle')
        .attr('cx', (time) => dopeSheetScale(time * 30))
        .attr('cy', TRACK_HEIGHT / 2)
        .attr('id', 'grabbable')
        .attr('r', CIRCLE_RADIUS)
        .style('fill', isLocked ? KEYFRAME_COLOR.locked : KEYFRAME_COLOR.default);
    }
  }, [circleGroupRef, isLocked, dopeSheetScale, times]);

  // circle 클릭 이벤트 추가
  useEffect(() => {
    const clickCircle = (event: MouseEvent, time: number) => {
      const isMultipleClick = event.ctrlKey || event.metaKey;
      if (trackIndex === 1) return;
      if (isMultipleClick) {
        const remainder = trackIndex % 10;
        for (const keyframe of selectedKeyframes) {
          const isClickedMe = trackIndex === keyframe.trackIndex && time === keyframe.time;
          if (isClickedMe) {
            switch (remainder) {
              case TP_TRACK_INDEX.LAYER: {
                const filteredKeyframes = _.filter(
                  selectedKeyframes,
                  (keyframe) => keyframe.time !== time,
                );
                dispatch(timelineActions.selectKeyframes({ selectedKeyframes: filteredKeyframes }));
                break;
              }
              case TP_TRACK_INDEX.BONE_A:
              case TP_TRACK_INDEX.BONE_B: {
                const layerIndex = fnGetLayerTrackIndex({ trackIndex });
                const filteredKeyframes = _.filter(selectedKeyframes, (keyframe) => {
                  const isEqualTimeIndex = keyframe.time === time;
                  const childrenTrackIndices = [trackIndex + 1, trackIndex + 2, trackIndex + 3];
                  const isNotEqualKeyframeIndex = _.every(
                    [layerIndex, trackIndex, ...childrenTrackIndices],
                    (index) => keyframe.trackIndex !== index,
                  );
                  if (!isEqualTimeIndex) return true;
                  if (isEqualTimeIndex && isNotEqualKeyframeIndex) return true;
                  return false;
                });
                dispatch(timelineActions.selectKeyframes({ selectedKeyframes: filteredKeyframes }));
                break;
              }
              default: {
                const layerIndex = fnGetLayerTrackIndex({ trackIndex });
                const boneIndex = fnGetBoneTrackIndex({ trackIndex });
                const filteredKeyframes = _.filter(selectedKeyframes, (keyframe) => {
                  const isEqualTimeIndex = keyframe.time === time;
                  const isNotEqualKeyframeIndex = _.every(
                    [layerIndex, boneIndex, trackIndex],
                    (index) => keyframe.trackIndex !== index,
                  );
                  if (!isEqualTimeIndex) return true;
                  if (isEqualTimeIndex && isNotEqualKeyframeIndex) return true;
                  return false;
                });
                dispatch(timelineActions.selectKeyframes({ selectedKeyframes: filteredKeyframes }));
                break;
              }
            }
            return; // 자기 자신을 클릭한 경우 반목문과 함수 종료. 이후 아래 로직은 동작하지 않음 -> 선택 효과 해제
          }
        }
        // 반복문이 중간에 멈추지 않은 경우(다른 time index에 있는 키프레임을 클릭한 경우) -> 키프레임 다중 선택
        const newSelectedKeyframes = fnUpdateSelectedKeyframes({
          lastBoneOfLayers,
          trackIndex,
          trackList,
          time,
        });
        const nextState = produce(selectedKeyframes, (draft) => {
          _.forEach(newSelectedKeyframes, (newKeyframe) => {
            draft.push(newKeyframe);
          });
        });
        dispatch(
          timelineActions.selectKeyframes({
            selectedKeyframes: _.sortBy(nextState, ['trackIndex', 'time']),
          }),
        );
      } else if (!isMultipleClick) {
        const selectedKeyframes = fnUpdateSelectedKeyframes({
          lastBoneOfLayers,
          trackIndex,
          trackList,
          time,
        });
        dispatch(timelineActions.selectKeyframes({ selectedKeyframes }));
      }
    };
    d3.select(circleGroupRef.current)
      .selectAll('circle')
      .on('mouseenter', (event) => {
        event.target.style.cursor = 'pointer';
      })
      .on('mouseout', (event) => {
        event.target.style.cursor = '';
      })
      .on('click', (event, time) => clickCircle(event, time as number));
  }, [
    circleGroupRef,
    dispatch,
    isLocked,
    lastBoneOfLayers,
    layerKey,
    selectedKeyframes,
    trackIndex,
    trackList,
    trackName,
  ]);

  // 키프레임 색상 적용, 해제
  useEffect(() => {
    if (circleGroupRef.current) {
      // 키프레임 선택 색상 제거
      selectedKeyframeIndices.current.forEach((keyframeIndex) => {
        const selectedKeyframe = circleGroupRef.current?.childNodes[keyframeIndex as number];
        const keyframeColor = isLocked ? KEYFRAME_COLOR.locked : KEYFRAME_COLOR.default;
        d3.select(selectedKeyframe as Element).style('fill', keyframeColor);
      });
      const targetKeyframeIndex = fnGetBinarySearch({
        collection: selectedKeyframes,
        index: trackIndex,
        key: 'trackIndex',
      });
      const hasNotSelectedKeyframeInTrack = targetKeyframeIndex === -1; // selectedKeyframes에서 자신의 트랙에 선택 된 키프레임이 없을 경우
      if (hasNotSelectedKeyframeInTrack) {
        selectedKeyframeIndices.current.clear();
      } else {
        // 이진 탐색으로 찾은 인덱스 기준으로 순회
        for (let index = targetKeyframeIndex; index < selectedKeyframes.length; index += 1) {
          const targetIndex = fnGetBinarySearch({
            collection: times,
            index: selectedKeyframes[index].time,
          });
          const isNotEqualTrackIndex = selectedKeyframes[index].trackIndex !== trackIndex;
          if (isNotEqualTrackIndex || targetIndex === -1) break;
          const targetCircle = circleGroupRef.current.childNodes[targetIndex + 1];
          selectedKeyframeIndices.current.add(targetIndex + 1);
          d3.select(targetCircle as Element).style('fill', KEYFRAME_COLOR.selected);
        }
        // 이진 탐색으로 찾은 인덱스 기준으로 역방향 순회
        for (let index = targetKeyframeIndex; 0 <= index; index -= 1) {
          const targetIndex = fnGetBinarySearch({
            collection: times,
            index: selectedKeyframes[index].time,
          });
          const isNotEqualTrackIndex = selectedKeyframes[index].trackIndex !== trackIndex;
          if (isNotEqualTrackIndex || targetIndex === -1) break;
          const targetCircle = circleGroupRef.current.childNodes[targetIndex + 1];
          selectedKeyframeIndices.current.add(targetIndex + 1);
          d3.select(targetCircle as Element).style('fill', KEYFRAME_COLOR.selected);
        }
      }
    }
  }, [circleGroupRef, isLocked, selectedKeyframes, times, trackIndex]);

  return <></>;
};

export default memo(Circles);
