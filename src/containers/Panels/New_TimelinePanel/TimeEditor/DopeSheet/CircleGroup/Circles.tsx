import React, { memo, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';
import { useSelector } from 'reducers';
import {
  fnGetBinarySearch,
  fnGetBoneTrackIndex,
  fnGetLayerTrackIndex,
  fnUpdateSelectedKeyframes,
} from 'utils/TP/New';
import * as dopeSheetActions from 'actions/dopeSheet';
import { TP_TRACK_INDEX } from 'utils/const';
import produce from 'immer';

interface Props {
  circleGroupRef: React.RefObject<SVGSVGElement>;
  isLocked: boolean;
  layerKey: string;
  times: number[];
  trackIndex: number;
  trackName: string;
  dopeSheetScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const CIRCLE_RADIUS = 4; // 원 반지름 크기
const KEYFRAME_COLOR = {
  default: '#7A7A7A',
  locked: '#404040',
  selected: '#F9D454',
};

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
  const lastBoneOfLayers = useSelector((state) => state.dopeSheet.lastBoneOfLayers);
  const trackList = useSelector((state) => state.dopeSheet.trackList);
  const selectedKeyframes = useSelector((state) => state.dopeSheet.selectedKeyframes);
  const selectedKeyframesInMyTrack = useRef(new Set());

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
          const isClickedOwnKeyframe = trackIndex === keyframe.trackIndex && time === keyframe.time;
          if (isClickedOwnKeyframe) {
            switch (remainder) {
              case TP_TRACK_INDEX.LAYER: {
                const filteredKeyframes = _.filter(
                  selectedKeyframes,
                  (keyframe) => keyframe.time !== time,
                );
                dispatch(
                  dopeSheetActions.selectKeyframes({ selectedKeyframes: filteredKeyframes }),
                );
                break;
              }
              case TP_TRACK_INDEX.BONE_A:
              case TP_TRACK_INDEX.BONE_B: {
                const layerIndex = fnGetLayerTrackIndex({ trackIndex });
                const filteredKeyframes = _.filter(selectedKeyframes, (keyframe) => {
                  const isEqualTimeIndex = keyframe.time === time;
                  const isNotParentLayerTrack = keyframe.trackIndex !== layerIndex;
                  const isNotOwnTrack = keyframe.trackIndex !== trackIndex;
                  const isNotChildPositionTrack = keyframe.trackIndex !== trackIndex + 1;
                  const isNotChildRotationTrack = keyframe.trackIndex !== trackIndex + 2;
                  const isNotChildScaleTrack = keyframe.trackIndex !== trackIndex + 3;
                  if (!isEqualTimeIndex) return true;
                  if (
                    isEqualTimeIndex &&
                    isNotParentLayerTrack &&
                    isNotOwnTrack &&
                    isNotChildPositionTrack &&
                    isNotChildRotationTrack &&
                    isNotChildScaleTrack
                  )
                    return true;
                  return false;
                });
                dispatch(
                  dopeSheetActions.selectKeyframes({ selectedKeyframes: filteredKeyframes }),
                );
                break;
              }
              default: {
                const layerIndex = fnGetLayerTrackIndex({ trackIndex });
                const boneIndex = fnGetBoneTrackIndex({ trackIndex });
                const filteredKeyframes = _.filter(selectedKeyframes, (keyframe) => {
                  const isEqualTimeIndex = keyframe.time === time;
                  const isNotParentLayerTrack = keyframe.trackIndex !== layerIndex;
                  const isNotParentBoneTrack = keyframe.trackIndex !== boneIndex;
                  const isNotOwnTrack = keyframe.trackIndex !== trackIndex;
                  if (!isEqualTimeIndex) return true;
                  if (
                    isEqualTimeIndex &&
                    isNotParentLayerTrack &&
                    isNotParentBoneTrack &&
                    isNotOwnTrack
                  )
                    return true;
                  return false;
                });
                dispatch(
                  dopeSheetActions.selectKeyframes({ selectedKeyframes: filteredKeyframes }),
                );
                break;
              }
            }
            return; // isClickedOwnKeyframe === true이면 clickCircle 함수 종료
          }
        }
        // 반복문이 중간에 멈추지 않은 경우(다른 time index에 있는 키프레임을 클릭한 경우)
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
          dopeSheetActions.selectKeyframes({
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
        dispatch(dopeSheetActions.selectKeyframes({ selectedKeyframes }));
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
      .on('click', (event, time) => {
        return clickCircle(event, time as number);
      });
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
      selectedKeyframesInMyTrack.current.forEach((keyframeIndex) => {
        const selectedKeyframe = circleGroupRef.current?.childNodes[keyframeIndex as number];
        const color = isLocked ? KEYFRAME_COLOR.locked : KEYFRAME_COLOR.default;
        d3.select(selectedKeyframe as Element).style('fill', color);
      });
      const targetIndex = fnGetBinarySearch({
        collection: selectedKeyframes,
        index: trackIndex,
        key: 'trackIndex',
      });
      const hasNotSelectedKeyframes = targetIndex === -1;
      if (hasNotSelectedKeyframes) {
        selectedKeyframesInMyTrack.current.clear();
      } else {
        for (let index = targetIndex; index < selectedKeyframes.length; index += 1) {
          const targetIndex = fnGetBinarySearch({
            collection: times,
            index: selectedKeyframes[index].time,
          });
          const isNotEqualTrackIndex = selectedKeyframes[index].trackIndex !== trackIndex;
          if (isNotEqualTrackIndex || targetIndex === -1) break;
          const targetCircle = circleGroupRef.current.childNodes[targetIndex + 1];
          d3.select(targetCircle as Element).style('fill', KEYFRAME_COLOR.selected);
          selectedKeyframesInMyTrack.current.add(targetIndex + 1);
        }
        for (let index = targetIndex; 0 <= index; index -= 1) {
          const targetIndex = fnGetBinarySearch({
            collection: times,
            index: selectedKeyframes[index].time,
          });
          const isNotEqualTrackIndex = selectedKeyframes[index].trackIndex !== trackIndex;
          if (isNotEqualTrackIndex || targetIndex === -1) break;
          const targetCircle = circleGroupRef.current.childNodes[targetIndex + 1];
          d3.select(targetCircle as Element).style('fill', KEYFRAME_COLOR.selected);
          selectedKeyframesInMyTrack.current.add(targetIndex + 1);
        }
      }
    }
  }, [circleGroupRef, isLocked, selectedKeyframes, times, trackIndex]);

  return <></>;
};

export default memo(Circles);
