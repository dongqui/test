import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import produce from 'immer';
import * as d3 from 'd3';
import _ from 'lodash';
import { useSelector } from 'reducers';
import {
  fnUpdateKeyframeToBase,
  fnGetLayerTimes,
  fnGetSummaryTimes,
  fnUpdateKeyframeToLayer,
  fnDeleteKeyframe,
} from 'utils/TP/editingUtils';
import { fnGetBinarySearch, fnGetBoneTrackIndex, fnGetLayerTrackIndex } from 'utils/TP/New';
import PlayBar from './PlayBar';
import CircleGroup from './CircleGroup';
import styles from './index.module.scss';
import * as dopeSheetActions from 'actions/dopeSheet';

// ToDo...없애야 됨
import { useReactiveVar } from '@apollo/client';
import {
  storeAnimatingData,
  storeCurrentVisualizedData,
  storeSkeletonHelper,
  storePageInfo,
} from 'lib/store';
import { CurrentVisualizedDataType, PAGE_NAMES, ShootTrackType } from 'types';

const cx = classNames.bind(styles);

const X_AXIS_DOMAIN = 500000;
const TIME_FRAME_HEIGHT = 48;
const TRACK_HEIGHT = 32;
const ZOOM_THROTTLE_TIMER = 75;
const INITIAL_ZOOM_LEVEL = 7500;

type d3ScaleLinear = d3.ScaleLinear<number, number, never>;

interface Datum {
  name: string;
  times: number[];
  values: number[];
}

const DopeSheet: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const trackList = useSelector((state) => state.dopeSheet.trackList);
  const selectedKeyframes = useSelector((state) => state.dopeSheet.selectedKeyframes);
  const lastBoneOfLayers = useSelector((state) => state.dopeSheet.lastBoneOfLayers);
  const dopeSheetRef = useRef<HTMLDivElement>(null);
  const dopeSheetScale = useRef<d3ScaleLinear | null>(null);

  // ToDo...없애야 됨
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const skeletonHelper = useReactiveVar(storeSkeletonHelper);
  const animatingData = useReactiveVar(storeAnimatingData);
  const pageInfo = useReactiveVar(storePageInfo);
  const { startTimeIndex, endTimeIndex, playState } = animatingData;

  const multiKeyController = useMemo(
    () => ({
      v: { pressed: false },
      V: { pressed: false },
      ㅍ: { pressed: false },
      Alt: { pressed: false },
      ' ': { pressed: false },
    }),
    [],
  );

  const selectedBaseDopeSheets = useMemo(
    () =>
      trackList.filter(
        (item) =>
          item.isSelected &&
          !item.isLocked &&
          item.isTransformTrack &&
          item.layerKey === 'baseLayer',
      ),
    [trackList],
  );

  const selectedLayerDopeSheets = useMemo(
    () =>
      trackList.filter(
        (item) =>
          item.isSelected &&
          !item.isLocked &&
          item.isTransformTrack &&
          item.layerKey !== 'baseLayer',
      ),
    [trackList],
  );

  // base 트랙 키프레임 추가
  const handleUpdateKeyframeToBase = useCallback(() => {
    if (currentVisualizedData && playState !== 'play') {
      const { baseLayer } = currentVisualizedData;
      const updateTargetTime = _.round(_.round(currentPlayBarTime.current, 0) / 30, 4);
      if (updateTargetTime && baseLayer && skeletonHelper) {
        const selectedDopesheetNames = selectedBaseDopeSheets.map(({ trackName }) => trackName);
        const selectedTrackIndexes = selectedBaseDopeSheets.map(({ trackIndex }) => trackIndex);
        const resultTracks: [ShootTrackType, number, number][] = [];
        const targetTracks = baseLayer.filter((track) =>
          selectedDopesheetNames.includes(track.name),
        );
        targetTracks.forEach((track, index) => {
          const [boneName, propertyName] = track.name.split('.');
          const bone = _.find(skeletonHelper.bones, (b) => b.name === boneName);
          if (bone) {
            let values;
            if (propertyName === 'position') {
              values = { x: bone.position.x, y: bone.position.y, z: bone.position.z };
            } else if (propertyName === 'rotation') {
              values = { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
            } else if (propertyName === 'scale') {
              values = { x: bone.scale.x, y: bone.scale.y, z: bone.scale.z };
            }
            if (values) {
              const resultTrack = fnUpdateKeyframeToBase({ track, time: updateTargetTime, values });
              const targetTrackIndex = _.findIndex(baseLayer, (t) => t.name === track.name);
              resultTracks.push([resultTrack, targetTrackIndex, selectedTrackIndexes[index]]);
            }
          }
        });
        const state = storeCurrentVisualizedData();
        if (state && resultTracks.length !== 0) {
          const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
            resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
              draft.baseLayer[targetTrackIndex] = resultTrack;
            });
          });
          storeCurrentVisualizedData(nextState);
          const nextTrackList = produce(trackList, (draft) => {
            const summaryTimes = fnGetSummaryTimes({
              baseLayer: nextState.baseLayer,
              layers: nextState.layers,
            });
            draft[0].times = summaryTimes;
            const layerTimes = fnGetLayerTimes({
              targetLayer: nextState.baseLayer,
            });
            draft[1].times = layerTimes;
            for (let index = 0; index < resultTracks.length; index += 1) {
              const transformIndex = resultTracks[index][2];
              const times = resultTracks[index][0].times;
              const targetTransformIndex = fnGetBinarySearch({
                collection: trackList,
                index: transformIndex,
                key: 'trackIndex',
              });
              draft[targetTransformIndex].times = times;
              const boneIndex = fnGetBoneTrackIndex({ trackIndex: transformIndex });
              const targetBoneIndex = fnGetBinarySearch({
                collection: trackList,
                index: boneIndex,
                key: 'trackIndex',
              });
              const transformTracks = [
                draft[targetBoneIndex + 1].times,
                draft[targetBoneIndex + 2].times,
                draft[targetBoneIndex + 3].times,
              ];
              const boneTimes = _.union(...transformTracks).sort((a, b) => a - b);
              draft[targetBoneIndex].times = boneTimes;
            }
          });
          dispatch(dopeSheetActions.addKeyframes({ trackList: nextTrackList }));
        }
      }
    }
  }, [
    currentVisualizedData,
    dispatch,
    playState,
    selectedBaseDopeSheets,
    skeletonHelper,
    trackList,
  ]);

  // layers 트랙 키프레임 추가
  const handleUpdateKeyframeToLayer = useCallback(() => {
    if (currentVisualizedData && playState !== 'play') {
      const { baseLayer, layers } = currentVisualizedData;
      const updateTargetTime = _.round(_.round(currentPlayBarTime.current, 0) / 30, 4);
      if (
        updateTargetTime &&
        baseLayer &&
        layers &&
        layers.length !== 0 &&
        skeletonHelper &&
        selectedLayerDopeSheets.length !== 0
      ) {
        const targetLayerIndex = _.findIndex(
          layers,
          (layer) => layer.key === selectedLayerDopeSheets[0].layerKey,
        );
        if (targetLayerIndex !== -1) {
          const resultTracks: [ShootTrackType, number, number][] = [];
          const selectedDopesheetNames = selectedLayerDopeSheets.map(
            (dopesheet) => dopesheet.trackName,
          );
          const selectedTrackIndexes = selectedLayerDopeSheets.map(({ trackIndex }) => trackIndex);
          const targetTracks = layers[targetLayerIndex].tracks.filter((track) =>
            selectedDopesheetNames.includes(track.name),
          );

          targetTracks.forEach((track, index) => {
            const [boneName, propertyName] = track.name.split('.');
            const bone = _.find(skeletonHelper.bones, (b) => b.name === boneName);
            if (bone) {
              let values;
              if (propertyName === 'position') {
                values = { x: bone.position.x, y: bone.position.y, z: bone.position.z };
              } else if (propertyName === 'rotation') {
                values = { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
              } else if (propertyName === 'scale') {
                values = { x: bone.scale.x, y: bone.scale.y, z: bone.scale.z };
              }
              if (values) {
                const resultTrack = fnUpdateKeyframeToLayer({
                  track,
                  currentLayerKey: layers[targetLayerIndex].key,
                  baseLayer,
                  layers,
                  time: updateTargetTime,
                  values,
                });
                const targetTrackIndex = _.findIndex(
                  layers[targetLayerIndex].tracks,
                  (t) => t.name === track.name,
                );
                resultTracks.push([resultTrack, targetTrackIndex, selectedTrackIndexes[index]]);
              }
            }
          });
          const state = storeCurrentVisualizedData();
          if (state && resultTracks.length !== 0) {
            const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
              resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
                draft.layers[targetLayerIndex].tracks[targetTrackIndex] = resultTrack;
              });
            });
            storeCurrentVisualizedData(nextState);
            const nextTrackList = produce(trackList, (draft) => {
              const summaryTimes = fnGetSummaryTimes({
                baseLayer: nextState.baseLayer,
                layers: nextState.layers,
              });
              draft[0].times = summaryTimes;
              const layerIndex = _.findIndex(
                layers,
                (layer) => layer.key === selectedLayerDopeSheets[0].layerKey,
              );
              const targetLayerIndex = fnGetBinarySearch({
                collection: trackList,
                index: fnGetLayerTrackIndex({ trackIndex: selectedLayerDopeSheets[0].trackIndex }),
                key: 'trackIndex',
              });
              const layerTimes = fnGetLayerTimes({
                targetLayer: nextState.layers[layerIndex].tracks,
              });
              draft[targetLayerIndex].times = layerTimes;
              for (let index = 0; index < resultTracks.length; index += 1) {
                const transformIndex = resultTracks[index][2];
                const times = resultTracks[index][0].times;
                const targetTransformIndex = fnGetBinarySearch({
                  collection: trackList,
                  index: transformIndex,
                  key: 'trackIndex',
                });
                draft[targetTransformIndex].times = times;
                const boneIndex = fnGetBoneTrackIndex({ trackIndex: transformIndex });
                const targetBoneIndex = fnGetBinarySearch({
                  collection: trackList,
                  index: boneIndex,
                  key: 'trackIndex',
                });
                const transformTracks = [
                  draft[targetBoneIndex + 1].times,
                  draft[targetBoneIndex + 2].times,
                  draft[targetBoneIndex + 3].times,
                ];
                const boneTimes = _.union(...transformTracks).sort((a, b) => a - b);
                draft[targetBoneIndex].times = boneTimes;
              }
            });
            dispatch(dopeSheetActions.addKeyframes({ trackList: nextTrackList }));
          }
        }
      }
    }
  }, [
    currentVisualizedData,
    dispatch,
    playState,
    selectedLayerDopeSheets,
    skeletonHelper,
    trackList,
  ]);

  // 선택 된 키프레임 삭제
  const handleDeleteKeyframe = useCallback(() => {
    if (currentVisualizedData && playState !== 'play') {
      const { baseLayer, layers } = currentVisualizedData;
      if (selectedKeyframes && baseLayer && layers) {
        const resultBaseLayerTracks: [ShootTrackType, number, number][] = [];
        const resultLayersTracks: [ShootTrackType, number, number, string, number][] = [];
        const isAlreadyIncluded: { time: number; trackIndex: number; layerIndex: number }[] = [];
        _.forEach(selectedKeyframes, (targetKeyframe) => {
          if (targetKeyframe.isTransformTrack && !targetKeyframe.isLocked) {
            const { trackName, time, layerKey } = targetKeyframe;
            if (layerKey === 'baseLayer') {
              const targetTrackIndex = _.findIndex(baseLayer, (t) => t.name === trackName);
              let targetTrack = _.find(
                resultBaseLayerTracks,
                (track) => targetTrackIndex === track[1],
              )?.[0];
              const alreadyIncludedIndex = _.findIndex(
                resultBaseLayerTracks,
                (track) => targetTrackIndex === track[1],
              );
              if (!targetTrack) {
                targetTrack = _.find(baseLayer, (track) => track.name === trackName);
              }
              if (targetTrack) {
                const resultTrack = fnDeleteKeyframe({ track: targetTrack, time });
                if (alreadyIncludedIndex === -1) {
                  resultBaseLayerTracks.push([
                    resultTrack,
                    targetTrackIndex,
                    targetKeyframe.trackIndex,
                  ]);
                } else {
                  resultBaseLayerTracks.splice(alreadyIncludedIndex, 1, [
                    resultTrack,
                    targetTrackIndex,
                    targetKeyframe.trackIndex,
                  ]);
                }
              }
            } else {
              const targetLayerIndex = _.findIndex(layers, (layer) => layer.key === layerKey);
              if (layers.length !== 0 && targetLayerIndex !== -1) {
                const targetTrackIndex = _.findIndex(
                  layers[targetLayerIndex].tracks,
                  (track) => track.name === trackName,
                );
                const isIncluded = _.findIndex(
                  isAlreadyIncluded,
                  (track) =>
                    track.layerIndex === targetLayerIndex &&
                    track.trackIndex === targetTrackIndex &&
                    track.time !== time,
                );
                if (isIncluded === -1) {
                  const targetTrack = layers[targetLayerIndex].tracks[targetTrackIndex];
                  const resultTrack = fnDeleteKeyframe({ track: targetTrack, time });
                  isAlreadyIncluded.push({
                    layerIndex: targetLayerIndex,
                    trackIndex: targetTrackIndex,
                    time,
                  });
                  resultLayersTracks.push([
                    resultTrack,
                    targetLayerIndex,
                    targetTrackIndex,
                    layerKey,
                    targetKeyframe.trackIndex,
                  ]);
                } else {
                  const targetTrack = resultLayersTracks[isIncluded][0];
                  const resultTrack = fnDeleteKeyframe({ track: targetTrack, time });
                  resultLayersTracks[isIncluded][0] = resultTrack;
                }
              }
            }
          }
        });
        const state = storeCurrentVisualizedData();
        if (state && (resultBaseLayerTracks.length !== 0 || resultLayersTracks.length !== 0)) {
          const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
            resultBaseLayerTracks.forEach(([resultTrack, targetTrackIndex]) => {
              draft.baseLayer[targetTrackIndex] = resultTrack;
            });
            resultLayersTracks.forEach(([resultTrack, targetLayerIndex, targetTrackIndex]) => {
              draft.layers[targetLayerIndex].tracks[targetTrackIndex] = resultTrack;
            });
          });
          storeCurrentVisualizedData(nextState);
          const nextTrackList = produce(trackList, (draft) => {
            const summaryTimes = fnGetSummaryTimes({
              baseLayer: nextState.baseLayer,
              layers: nextState.layers,
            });
            draft[0].times = summaryTimes;
            const baseLayerTimes = fnGetLayerTimes({
              targetLayer: nextState.baseLayer,
            });
            draft[1].times = baseLayerTimes;
            if (!_.isEmpty(nextState.layers)) {
              _.forEach(lastBoneOfLayers, (track, index) => {
                const isNotBaseLayer = index !== 0;
                if (isNotBaseLayer) {
                  const targetLayerIndex = fnGetBinarySearch({
                    collection: trackList,
                    index: track.layerIndex,
                    key: 'trackIndex',
                  });
                  const layerTimes = fnGetLayerTimes({
                    targetLayer: nextState.layers[index - 1].tracks,
                  });
                  draft[targetLayerIndex].times = layerTimes;
                }
              });
            }
            for (let index = 0; index < resultBaseLayerTracks.length; index += 1) {
              const transformIndex = resultBaseLayerTracks[index][2];
              const transformTimes = resultBaseLayerTracks[index][0].times;
              const targetTransformIndex = fnGetBinarySearch({
                collection: trackList,
                index: transformIndex,
                key: 'trackIndex',
              });
              draft[targetTransformIndex].times = transformTimes;
              const boneIndex = fnGetBoneTrackIndex({ trackIndex: transformIndex });
              const targetBoneIndex = fnGetBinarySearch({
                collection: trackList,
                index: boneIndex,
                key: 'trackIndex',
              });
              const transformTracks = [
                draft[targetBoneIndex + 1].times,
                draft[targetBoneIndex + 2].times,
                draft[targetBoneIndex + 3].times,
              ];
              const boneTimes = _.union(...transformTracks).sort((a, b) => a - b);
              draft[targetBoneIndex].times = boneTimes;
            }
            for (let index = 0; index < resultLayersTracks.length; index += 1) {
              const transformIndex = resultLayersTracks[index][4];
              const transformTimes = resultLayersTracks[index][0].times;
              const targetTransformIndex = fnGetBinarySearch({
                collection: trackList,
                index: transformIndex,
                key: 'trackIndex',
              });
              draft[targetTransformIndex].times = transformTimes;
              const boneIndex = fnGetBoneTrackIndex({ trackIndex: transformIndex });
              const targetBoneIndex = fnGetBinarySearch({
                collection: trackList,
                index: boneIndex,
                key: 'trackIndex',
              });
              const transformTracks = [
                draft[targetBoneIndex + 1].times,
                draft[targetBoneIndex + 2].times,
                draft[targetBoneIndex + 3].times,
              ];
              const boneTimes = _.union(...transformTracks).sort((a, b) => a - b);
              draft[targetBoneIndex].times = boneTimes;
            }
          });
          dispatch(
            dopeSheetActions.deleteKeyframes({ trackList: nextTrackList, selectedKeyframes: [] }),
          );
        }
      }
    }
  }, [currentVisualizedData, dispatch, lastBoneOfLayers, playState, selectedKeyframes, trackList]);

  // dope sheet key down 이벤트
  const handleDopesheetKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
      switch (event.key) {
        case 'Alt':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          break;
        case 'v': // v (viewport)
        case 'V':
        case 'ㅍ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          break;
        case 'k': // keyframe update
        case 'K':
        case 'ㅏ':
          if (
            !(
              multiKeyController['v'].pressed || // view port 전환 단축키와 중복 방지
              multiKeyController['V'].pressed ||
              multiKeyController['ㅍ'].pressed
            )
          ) {
            if (selectedBaseDopeSheets.length !== 0) {
              handleUpdateKeyframeToBase();
            }
            if (selectedLayerDopeSheets.length !== 0) {
              handleUpdateKeyframeToLayer();
            }
          }
          break;
        case 'd': // keyframe update
        case 'D':
        case 'ㅇ':
          if (multiKeyController['Alt'].pressed && selectedKeyframes.length !== 0) {
            handleDeleteKeyframe();
          }
          break;
        case '∂': // keyframe update
          if (selectedKeyframes.length !== 0) {
            handleDeleteKeyframe();
          }
          break;
        case ' ': // space bar
          if (multiKeyController[event.key] && !multiKeyController[event.key].pressed) {
            if (pageInfo.page === PAGE_NAMES.shoot && currentVisualizedData) {
              if (playState === 'play') {
                storeAnimatingData({ ...animatingData, playState: 'pause' });
              } else {
                storeAnimatingData({ ...animatingData, playState: 'play' });
              }
            }
            multiKeyController[event.key].pressed = true;
          }
          break;
        default:
          break;
      }
    },
    [
      animatingData,
      currentVisualizedData,
      handleDeleteKeyframe,
      handleUpdateKeyframeToBase,
      handleUpdateKeyframeToLayer,
      multiKeyController,
      pageInfo.page,
      playState,
      selectedBaseDopeSheets.length,
      selectedKeyframes.length,
      selectedLayerDopeSheets.length,
    ],
  );

  // dope sheet key up 이벤트
  const handleDopesheetKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
      switch (event.key) {
        case 'Alt':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        case 'v': // v (viewport)
        case 'V':
        case 'ㅍ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        case ' ': // space bar 연속 down 방지
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        default:
          break;
      }
    },
    [multiKeyController],
  );

  // dope sheet key press 이벤트
  const handleDopesheetKeyPress = useCallback((event: KeyboardEvent) => {
    const target = event.target as Element;
    if (target.tagName.toLowerCase() === 'input') {
      return;
    }
    switch (event.key) {
      case ',':
      case '<':
        // handleMovePlayBarLeft();
        break;
      case '.':
      case '>':
        // handleMovePlayBarRight();
        break;
    }
  }, []);

  // key down, key up, key press 이벤트 추가
  useEffect(() => {
    document.addEventListener('keydown', handleDopesheetKeyDown);
    document.addEventListener('keyup', handleDopesheetKeyUp);
    document.addEventListener('keypress', handleDopesheetKeyPress);

    return () => {
      document.removeEventListener('keydown', handleDopesheetKeyDown);
      document.removeEventListener('keyup', handleDopesheetKeyUp);
      document.removeEventListener('keypress', handleDopesheetKeyPress);
    };
  }, [handleDopesheetKeyDown, handleDopesheetKeyPress, handleDopesheetKeyUp]);

  // dope sheet zoom 적용
  const prevDoepSheetWidth = useRef(0);
  const currentZoomLevel = useRef(INITIAL_ZOOM_LEVEL);
  useEffect(() => {
    if (dopeSheetRef.current) {
      // 현재 zoom level로 scale 조정
      const rescaleDopeSheet = (resizedWidth: number, event: d3.D3ZoomEvent<Element, Datum>) => {
        dopeSheetScale.current = d3
          .scaleLinear()
          .domain([-X_AXIS_DOMAIN, X_AXIS_DOMAIN])
          .range([0, resizedWidth]);
        const rescaleXLineer = event.transform.rescaleX(dopeSheetScale.current) as d3ScaleLinear;
        dopeSheetScale.current = rescaleXLineer;
      };

      // time frame, 세로 선 생성
      const arrangeTimeFrame = () => {
        if (!dopeSheetScale.current) return;
        const scaleXLineaer = dopeSheetScale.current;
        const rangeRectWidth = scaleXLineaer(endTimeIndex) - scaleXLineaer(startTimeIndex);

        // 세로 선 생성
        d3.select('.vertical-line-wrapper').remove();
        d3.select(dopeSheetRef.current)
          .append('svg')
          .attr('class', 'vertical-line-wrapper')
          .attr('width', '100%')
          .attr('height', '100%')
          .style('position', 'fixed')
          .style('z-index', 1)
          .append('g')
          .call(d3.axisTop(dopeSheetScale.current).scale(scaleXLineaer))
          .call((wrapper) =>
            wrapper
              .selectAll('.tick')
              .append('line')
              .attr('class', 'vertical-line')
              .attr('y1', '100%'),
          );

        // 타임 프레임 생성
        d3.select('.time-frame-wrapper').remove();
        d3.select(dopeSheetRef.current)
          .append('svg')
          .attr('class', 'time-frame-wrapper')
          .attr('width', '100%')
          .attr('height', TIME_FRAME_HEIGHT)
          .style('position', 'fixed')
          .style('z-index', 2)
          .append('g')
          .attr('transform', `translate(0, ${TIME_FRAME_HEIGHT / 2})`)
          .call((wrapper) =>
            wrapper
              .append('rect')
              .attr('width', '100%')
              .attr('height', TIME_FRAME_HEIGHT / 2)
              .attr('transform', `translate(0, -${TIME_FRAME_HEIGHT / 2})`)
              .style('fill', '#363636'),
          )
          .call((wrapper) =>
            wrapper
              .append('rect')
              .attr('width', '100%')
              .attr('height', TIME_FRAME_HEIGHT / 2)
              .attr('transform', `translate(0, 0)`)
              .style('fill', '#282727'),
          )
          .call((wrapper) =>
            wrapper
              .append('rect')
              .attr('class', 'range-rect')
              .attr('width', rangeRectWidth)
              .attr('height', TIME_FRAME_HEIGHT / 2)
              .attr(
                'transform',
                `translate(${scaleXLineaer(startTimeIndex)}, -${TIME_FRAME_HEIGHT / 2})`,
              )
              .style('fill', '#3785F7'),
          )
          .call(d3.axisTop(dopeSheetScale.current).scale(scaleXLineaer))
          .call((wrapper) => {
            wrapper
              .append('line')
              .attr('x2', '100%')
              .style('stroke', '#303030')
              .style('stroke-width', 4);
          });
      };

      // 키프레임 위치 조정
      const arrangeKeyframes = () => {
        d3.selectAll('.circle-group').each(function () {
          const circleGroup = d3.select(this);
          const circleGroupNode = circleGroup.node() as Element;
          const circleGroupTop = circleGroupNode.getBoundingClientRect().top;
          const parentWrapperTop = circleGroupNode.parentElement?.getBoundingClientRect().top;

          if (parentWrapperTop && dopeSheetScale.current) {
            const scaleXLineaer = dopeSheetScale.current;
            const rangeTop = parentWrapperTop - TRACK_HEIGHT * 4;
            const rangeBottom = window.innerHeight + TRACK_HEIGHT * 4;
            if (rangeTop <= circleGroupTop && circleGroupTop <= rangeBottom) {
              circleGroup.selectAll('circle').each(function () {
                const times = d3.select(this).data() as number[];
                d3.select(this).attr('cx', scaleXLineaer(times[0] * 30));
              });
            }
          }
        });
      };

      // 재생바 위치 조정
      const arrangePlayBar = () => {
        if (!dopeSheetScale.current) return;
        const scaleXLineaer = dopeSheetScale.current;
        const translateX = scaleXLineaer(currentPlayBarTime.current) - 10;
        const translateY = TIME_FRAME_HEIGHT / 2;
        d3.select('#play-bar').style(
          'transform',
          `translate3d(${translateX}px, ${translateY}px, 0)`,
        );
      };

      // TP 리사이즈 감지
      const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const [entry] = entries;
        const { width, height } = entry.contentRect;
        const isNotChangedWidth = prevDoepSheetWidth.current === width;
        if (width === 0 || height === 0 || isNotChangedWidth) return;
        const zoomBehavior = d3
          .zoom()
          .scaleExtent([1, 100000])
          .translateExtent([
            [0, 0],
            [width, height],
          ])
          .filter((event: WheelEvent) => {
            if (_.isEqual(event.type, 'dblclick')) return false;
            if (
              _.isEqual(event.type, 'mousedown') &&
              _.isEqual(event.ctrlKey, false) &&
              _.isEqual(event.metaKey, false)
            )
              return false;
            return true;
          })
          .on(
            'zoom',
            _.throttle((event: d3.D3ZoomEvent<Element, Datum>) => {
              rescaleDopeSheet(width, event);
              arrangeTimeFrame();
              arrangeKeyframes();
              arrangePlayBar();
            }, ZOOM_THROTTLE_TIMER),
          );

        d3.select(dopeSheetRef.current)
          .call(zoomBehavior.scaleTo as any, currentZoomLevel.current)
          .call(zoomBehavior.translateTo as any, width / 2, height / 2)
          .call(zoomBehavior as any);
      });
      resizeObserver.observe(dopeSheetRef.current);
    }
  }, [endTimeIndex, startTimeIndex]);

  // 채널 리스트에 커서를 놓고 스크롤 시, 키프레임 위치 조정
  const prevScrollTop = useRef(0);
  useEffect(() => {
    if (dopeSheetRef.current) {
      const arrangeKeyframes = (event: MouseEvent) => {
        if (!dopeSheetScale.current) return;
        const scaleXLineaer = dopeSheetScale.current;
        const scrollTop = (event.target as Element).scrollTop;
        const isSmallPrevScrollTop = prevScrollTop.current < scrollTop;
        const rootMarginTop = isSmallPrevScrollTop ? 0 : TRACK_HEIGHT * 20;
        const rootMarginBottom = isSmallPrevScrollTop ? TRACK_HEIGHT * 20 : 0;
        const rootMargin = `${rootMarginTop}px 0px ${rootMarginBottom}px 0px`;

        const observerOptions: IntersectionObserverInit = {
          root: document.getElementById('timeline-wrapper'),
          rootMargin: rootMargin,
        };

        d3.selectAll('.circle-group').each(function () {
          const circleGroup = d3.select(this);
          const circleGroupNode = circleGroup.node() as Element;
          const intersectionObserver = new IntersectionObserver(([entry], observer) => {
            if (!entry.isIntersecting) return observer.unobserve(entry.target);
            circleGroup.selectAll('circle').each(function () {
              const times = d3.select(this).data() as number[];
              d3.select(this).attr('cx', scaleXLineaer(times[0] * 30));
            });
            observer.unobserve(entry.target);
          }, observerOptions);
          intersectionObserver.observe(circleGroupNode);
        });
        prevScrollTop.current = scrollTop;
      };

      d3.select('#timeline-wrapper').on('scroll', arrangeKeyframes);
    }
  }, []);

  // 재생바 출력 여부
  const [isShowedPlayBar, setIsShowedPlayBar] = useState(false);
  const prevModelKey = useRef('');
  useEffect(() => {
    const modelKey = trackList[0]?.visualizedDataKey;
    const isChangedModel = trackList.length && modelKey !== prevModelKey.current;
    if (isChangedModel) {
      prevModelKey.current = modelKey;
      setIsShowedPlayBar(true);
    } else if (!trackList.length) {
      prevModelKey.current = '';
      setIsShowedPlayBar(false);
    }
  }, [trackList]);

  // 재생바 드레그 이벤트
  const currentPlayBarTime = useRef(1);
  useEffect(() => {
    if (dopeSheetScale.current && isShowedPlayBar) {
      const setPlayBarTime = (time: number) => {
        if (time < startTimeIndex) return startTimeIndex;
        if (endTimeIndex < time) return endTimeIndex;
        return time;
      };
      const dragBehavior = d3
        .drag()
        .filter((playBar) => {
          if (playBar.target.tagName !== 'path') return false;
          return true;
        })
        .on('drag', function (drag: MouseEvent) {
          if (!dopeSheetScale.current) return;
          const scaleXLineaer = dopeSheetScale.current;
          const playBarTime = _.floor(dopeSheetScale.current.invert(drag.x + 20) as number);
          const translateX = scaleXLineaer(setPlayBarTime(playBarTime)) - 10;
          const translateY = TIME_FRAME_HEIGHT / 2;

          d3.select(this).style('transform', `translate3d(${translateX}px, ${translateY}px, 0)`);
          currentPlayBarTime.current = setPlayBarTime(playBarTime);
        });

      const scaleXLineaer = dopeSheetScale.current;
      const initialPlayBarTime = setPlayBarTime(currentPlayBarTime.current);
      const translateX = scaleXLineaer(initialPlayBarTime) - 10;
      const translateY = TIME_FRAME_HEIGHT / 2;

      d3.select('#play-bar')
        .style('transform', `translate3d(${translateX}px, ${translateY}px, 0)`)
        .call(dragBehavior as any);
      currentPlayBarTime.current = initialPlayBarTime;
    }
  }, [endTimeIndex, isShowedPlayBar, startTimeIndex]);

  return (
    <div className={cx('dopesheet-wrapper')} ref={dopeSheetRef}>
      <div className={cx('circle-group-wrapper')}>
        {_.map(trackList, (track) => {
          const {
            isLocked,
            isSelected,
            isShowed,
            isFiltered,
            layerKey,
            times,
            trackName,
            trackIndex,
          } = track;
          const key = `${trackIndex}_${trackName}`;
          return (
            isShowed &&
            isFiltered && (
              <CircleGroup
                key={key}
                isLocked={isLocked}
                isSelected={isSelected}
                layerKey={layerKey}
                times={times}
                trackIndex={trackIndex}
                trackName={trackName}
                dopeSheetScale={dopeSheetScale.current as d3ScaleLinear}
              />
            )
          );
        })}
      </div>
      {isShowedPlayBar && <PlayBar />}
    </div>
  );
};

export default DopeSheet;
