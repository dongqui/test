import React, {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useReactiveVar } from '@apollo/client';
import * as d3 from 'd3';
import _ from 'lodash';
import classNames from 'classnames/bind';
import {
  storeAnimatingData,
  storeContextMenuInfo,
  storeCurrentAction,
  storeCurrentVisualizedData,
  storeDeleteTargetKeyframes,
  storeSkeletonHelper,
  storeTPDopeSheetList,
  storePageInfo,
} from 'lib/store';
import PlayBar from './playBar';
import styles from './index.module.scss';
import { CurrentVisualizedDataType, PAGE_NAMES, ShootTrackType } from 'types';
import {
  fnDeleteKeyframe,
  fnGetSummaryTimes,
  fnUpdateKeyframeToBase,
  fnUpdateKeyframeToLayer,
} from 'utils/TP/editingUtils';
import produce from 'immer';
import { useDragBox } from 'hooks/common';
import useContextMenu from 'hooks/common/useContextMenu';
import { DragBox } from 'components/DragBox';
import { useSelector } from 'reducers';
import CircleGroup from './CircleGroup';

interface Props {
  panelWrapperRef: RefObject<HTMLDivElement>;
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

interface Datum {
  name: string;
  times: number[];
  values: number[];
}

type d3ScaleLinear = d3.ScaleLinear<number, number, never>;
type d3Selection = d3.Selection<SVGGElement, unknown, HTMLElement, any>;
type d3Axis = d3.Axis<d3.NumberValue>;

const cx = classNames.bind(styles);
const X_AXIS_SVG_CLASSNAME = 'x-axis-svg';
const CIRCLE_GROUP_CLASSNAME = 'circle-group';

const X_AXIS_DOMAIN = 500000;
const X_AXIS_HEIGHT = 48; // x축 높이
const TRACK_HEIGHT = 32; // 트랙 높이
const THROTTLE_TIMER = 75;
const INITIAL_SCALE_LEVEL = 7500;

const DopeSheet: React.FC<Props> = ({
  panelWrapperRef,
  currentTimeRef,
  currentTimeIndexRef,
  currentXAxisPosition,
  prevXScale,
}) => {
  const trackList = useSelector((state) => state.dopeSheet.trackList);
  const dopeSheetRef = useRef<HTMLDivElement>(null); // Dope Sheet의 Ref
  const prevScrollTop = useRef(0); // 직전 TP scroll 위치
  const prevModelKey = useRef('');
  const [playBarDisplayed, setPlayBarDisplayed] = useState(false);

  const xScale = useRef<d3ScaleLinear | d3.ZoomScale | null>(null); // x값 범위 저장
  const xAxisPosition = useRef<d3Axis | null>(null); // x축 위치 저장(axisTop)
  const renderXAxis = useRef<d3Selection | null>(null); // x축 랜더링
  const renderYGrid = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null); // grid선 랜더링

  const currentAction = useReactiveVar(storeCurrentAction);
  const animatingData = useReactiveVar(storeAnimatingData);
  const { startTimeIndex, endTimeIndex, playState } = animatingData;

  const [lastTime, setLastTime] = useState(0);

  const pageInfo = useReactiveVar(storePageInfo);

  const playBarPositionReqIdRef = useRef<number | undefined>();

  const setPlayBarPosition = useCallback(() => {
    if (currentXAxisPosition && currentAction) {
      currentXAxisPosition.current = currentAction.time ? currentAction.time * 30 : 1;
      const xScaleLinear = prevXScale.current as d3ScaleLinear;
      d3.select('#play-bar-wrapper').style(
        'transform',
        `translate3d(
          ${xScaleLinear(currentXAxisPosition.current) - 10}px, ${X_AXIS_HEIGHT / 2}px, 0)`,
      );
    }
    playBarPositionReqIdRef.current = window.requestAnimationFrame(setPlayBarPosition);
  }, [currentAction, currentXAxisPosition, prevXScale]);

  const startPlayBarPositionLoop = useCallback(() => {
    playBarPositionReqIdRef.current = window.requestAnimationFrame(setPlayBarPosition);
  }, [setPlayBarPosition]);

  const stopPlayBarPositionLoop = useCallback(() => {
    if (playBarPositionReqIdRef.current) {
      window.cancelAnimationFrame(playBarPositionReqIdRef.current);
    }
  }, []);

  // 미들바 애니메이션 싱크
  useEffect(() => {
    if (playState === 'play') {
      startPlayBarPositionLoop();
    } else if (playState === 'pause' || playState === 'stop') {
      stopPlayBarPositionLoop();
    }
  }, [playState, startPlayBarPositionLoop, stopPlayBarPositionLoop]);

  // svg로 x축 그리기
  useEffect(() => {
    if (!dopeSheetRef.current) return;
    const width = window.innerWidth - 248;

    xScale.current = d3.scaleLinear().domain([-X_AXIS_DOMAIN, X_AXIS_DOMAIN]).range([0, width]); // x값 범위 설정
    prevXScale.current = xScale.current.copy() as d3ScaleLinear; // 이전 x값 복사
    xAxisPosition.current = d3.axisTop(xScale.current as d3ScaleLinear); // x축 위치 설정

    const xScaleLinear = prevXScale.current as d3ScaleLinear;
    const rangeRectWidth = xScaleLinear(300) - xScaleLinear(1);

    // grid line wrapper 생성
    d3.select('.grid-line-wrapper').remove();
    renderYGrid.current = d3
      .select(dopeSheetRef.current)
      .append('svg')
      .attr('class', 'grid-line-wrapper')
      .attr('width', '100vw')
      .attr('height', '100%')
      .style('position', 'fixed')
      .append('g');

    // grid line 생성
    d3.selectAll('.grid-line-wrapper .tick')
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('y1', '100%')
      .attr('x2', 0)
      .attr('y2', 0);

    // x축 svg 태그 추가
    d3.select(dopeSheetRef.current)
      .call((dopeSheet) => dopeSheet.select(`.${X_AXIS_SVG_CLASSNAME}`).remove())
      .append('svg')
      .attr('class', `${X_AXIS_SVG_CLASSNAME}`)
      .attr('width', '100vw')
      .attr('height', X_AXIS_HEIGHT)
      .style('position', 'fixed')
      .style('z-index', 2);

    // x축 g 태그 랜더링
    renderXAxis.current = d3
      .select(`.${X_AXIS_SVG_CLASSNAME}`)
      .append('g')
      .attr('class', 'x-axis-g')
      .attr('transform', `translate(0, ${X_AXIS_HEIGHT / 2})`)
      .call((xAxisG) =>
        xAxisG
          .append('rect')
          .attr('width', '100%')
          .attr('height', X_AXIS_HEIGHT / 2)
          .attr('transform', `translate(0, -${X_AXIS_HEIGHT / 2})`)
          .style('fill', '#363636'),
      )
      .call((xAxisG) => {
        xAxisG
          .append('rect')
          .attr('class', 'range-rect')
          .attr('width', rangeRectWidth)
          .attr('height', X_AXIS_HEIGHT / 2)
          .attr('transform', `translate(${xScaleLinear(1)}, -${X_AXIS_HEIGHT / 2})`)
          .style('fill', '#3785F7');
      })
      .call((xAxisG) =>
        xAxisG
          .append('rect')
          .attr('width', '100%')
          .attr('height', X_AXIS_HEIGHT / 2)
          .attr('transform', `translate(0, 0)`)
          .style('fill', '#282727'),
      );
    d3.selectAll('.x-axis-g line').attr('y2', -24);
  }, [prevXScale]);

  // timelineWrapper에 scroll 효과 적용
  useEffect(() => {
    if (!dopeSheetRef.current || !panelWrapperRef.current) return;
    const timelineWrapper = panelWrapperRef.current;

    // circle x값 rescale
    const rescaleCircleX = () => {
      const isBelowPrevScrollTop = prevScrollTop.current < timelineWrapper.scrollTop;
      d3.selectAll(`.${CIRCLE_GROUP_CLASSNAME}`).each(function () {
        const circleGroup = d3.select(this);
        const circleGroupNode = circleGroup.node() as Element;
        const xScaleLinear = prevXScale.current as d3ScaleLinear;
        const rootMargin = `${isBelowPrevScrollTop ? 0 : X_AXIS_HEIGHT * 20}px 0px ${
          isBelowPrevScrollTop ? X_AXIS_HEIGHT * 20 : 0
        }px 0px`;

        const observer = new IntersectionObserver(
          ([entry], observer) => {
            if (!entry.isIntersecting) return observer.unobserve(entry.target);
            circleGroup.selectAll('circle').each(function () {
              d3.select(this).attr('cx', (times: any) => xScaleLinear(times.time * 30));
            });
            observer.unobserve(entry.target);
          },
          {
            root: document.getElementById('timeline-wrapper'),
            rootMargin: rootMargin,
          },
        );
        observer.observe(circleGroupNode);
      });
      prevScrollTop.current = timelineWrapper.scrollTop;
    };

    d3.select('#timeline-wrapper').on('scroll', rescaleCircleX);
  }, [prevXScale, panelWrapperRef]);

  const skeletonHelper = useReactiveVar(storeSkeletonHelper);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const deleteTargetKeyframes = useReactiveVar(storeDeleteTargetKeyframes);
  const tpDopesheetList = storeTPDopeSheetList();
  const selectedBaseDopeSheets = useMemo(
    () =>
      tpDopesheetList.filter(
        (item) =>
          item.isSelected &&
          !item.isLocked &&
          item.isTransformTrack &&
          item.layerKey === 'baseLayer',
      ),
    [tpDopesheetList],
  );
  const selectedLayerDopeSheets = useMemo(
    () =>
      tpDopesheetList.filter(
        (item) =>
          item.isSelected &&
          !item.isLocked &&
          item.isTransformTrack &&
          item.layerKey !== 'baseLayer',
      ),
    [tpDopesheetList],
  );

  const handleUpdateKeyframeToBase = useCallback(() => {
    if (currentVisualizedData && playState !== 'play') {
      const { baseLayer, layers } = currentVisualizedData;
      const updateTargetTime = _.round(_.round(currentXAxisPosition.current, 0) / 30, 4);
      if (updateTargetTime && baseLayer && skeletonHelper) {
        const selectedDopesheetNames = selectedBaseDopeSheets.map(
          (dopesheet) => dopesheet.trackName,
        );
        const resultTracks: [ShootTrackType, number][] = [];
        const targetTracks = baseLayer.filter((track) =>
          selectedDopesheetNames.includes(track.name),
        );
        targetTracks.forEach((track) => {
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
              resultTracks.push([resultTrack, targetTrackIndex]);
            }
          }
        });
        console.log(resultTracks);
        const state = storeCurrentVisualizedData();
        if (state && resultTracks.length !== 0) {
          const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
            resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
              draft.baseLayer[targetTrackIndex] = resultTrack;
            });
          });
          storeCurrentVisualizedData(nextState);
        }
      }
    }
  }, [
    currentVisualizedData,
    currentXAxisPosition,
    playState,
    selectedBaseDopeSheets,
    skeletonHelper,
  ]);

  const handleUpdateKeyframeToLayer = useCallback(() => {
    if (currentVisualizedData && playState !== 'play') {
      const { baseLayer, layers } = currentVisualizedData;
      const updateTargetTime = _.round(_.round(currentXAxisPosition.current, 0) / 30, 4);
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
          const resultTracks: [ShootTrackType, number][] = [];
          const selectedDopesheetNames = selectedLayerDopeSheets.map(
            (dopesheet) => dopesheet.trackName,
          );
          const targetTracks = layers[targetLayerIndex].tracks.filter((track) =>
            selectedDopesheetNames.includes(track.name),
          );

          targetTracks.forEach((track) => {
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
                resultTracks.push([resultTrack, targetTrackIndex]);
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
          }
        }
      }
    }
  }, [
    currentVisualizedData,
    currentXAxisPosition,
    playState,
    selectedLayerDopeSheets,
    skeletonHelper,
  ]);

  const handleDeleteKeyframe = useCallback(() => {
    if (currentVisualizedData && playState !== 'play') {
      const { baseLayer, layers } = currentVisualizedData;
      if (deleteTargetKeyframes && baseLayer && layers) {
        const resultBaseLayerTracks: [ShootTrackType, number][] = [];
        const resultLayersTracks: [ShootTrackType, number, number, string][] = [];
        _.forEach(deleteTargetKeyframes, (targetKeyframe) => {
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
                  resultBaseLayerTracks.push([resultTrack, targetTrackIndex]);
                } else {
                  resultBaseLayerTracks.splice(alreadyIncludedIndex, 1, [
                    resultTrack,
                    targetTrackIndex,
                  ]);
                }
              }
            } else {
              const targetLayerIndex = _.findIndex(layers, (layer) => layer.key === layerKey);
              if (layers.length !== 0 && targetLayerIndex !== -1) {
                const targetTrackIndex = _.findIndex(
                  layers[targetLayerIndex].tracks,
                  (t) => t.name === trackName,
                );
                let targetTrack = _.find(
                  resultLayersTracks,
                  (track) => targetTrackIndex === track[1] && layerKey === track[3],
                )?.[0];
                const alreadyIncludedIndex = _.findIndex(
                  resultLayersTracks,
                  (track) => targetTrackIndex === track[1],
                );
                if (!targetTrack) {
                  targetTrack = _.find(
                    layers[targetLayerIndex].tracks,
                    (track) => track.name === trackName,
                  ) as ShootTrackType;
                }
                if (targetTrack) {
                  const resultTrack = fnDeleteKeyframe({ track: targetTrack, time });
                  if (alreadyIncludedIndex === -1) {
                    resultLayersTracks.push([
                      resultTrack,
                      targetLayerIndex,
                      targetTrackIndex,
                      layerKey,
                    ]);
                  } else {
                    resultLayersTracks.splice(alreadyIncludedIndex, 1, [
                      resultTrack,
                      targetLayerIndex,
                      targetTrackIndex,
                      layerKey,
                    ]);
                  }
                }
              }
            }
          }
        });
        storeDeleteTargetKeyframes([]);
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
        }
      }
    }
  }, [currentVisualizedData, deleteTargetKeyframes, playState]);

  const handleMovePlayBarLeft = useCallback(() => {
    if (
      playState !== 'play' &&
      currentVisualizedData &&
      currentXAxisPosition &&
      currentTimeRef &&
      currentTimeIndexRef &&
      currentXAxisPosition.current &&
      currentTimeRef.current &&
      currentTimeIndexRef.current &&
      currentAction
    ) {
      const currentValue = currentXAxisPosition.current;
      let nextValue: number;
      if (currentValue === startTimeIndex) {
        nextValue = endTimeIndex;
      } else {
        nextValue = currentValue - 1;
      }
      // 미들바 업데이트
      currentXAxisPosition.current = nextValue;
      const xScaleLinear = prevXScale.current as d3ScaleLinear;
      d3.select('#play-bar-wrapper').style(
        'transform',
        `translate3d(
          ${xScaleLinear(currentXAxisPosition.current) - 10}px, ${X_AXIS_HEIGHT / 2}px, 0)`,
      );

      // currentTime 및 timeIndex 인풋 업데이트
      if (_.round(nextValue / 30, 4) >= lastTime) {
        currentTimeRef.current.value = new Date(_.round(lastTime, 0) * 1000)
          .toISOString()
          .substr(11, 8)
          .substr(2)
          .replace(':', '');
      } else {
        currentTimeRef.current.value = new Date(_.round(nextValue / 30, 0) * 1000)
          .toISOString()
          .substr(11, 8)
          .substr(2)
          .replace(':', '');
      }
      currentTimeIndexRef.current.value = nextValue.toString();
      // 액션 time 업데이트
      currentAction.time = _.round(nextValue / 30, 4);
    }
  }, [
    currentAction,
    currentTimeIndexRef,
    currentTimeRef,
    currentVisualizedData,
    currentXAxisPosition,
    endTimeIndex,
    lastTime,
    playState,
    prevXScale,
    startTimeIndex,
  ]);

  const handleMovePlayBarRight = useCallback(() => {
    if (
      playState !== 'play' &&
      currentVisualizedData &&
      currentXAxisPosition &&
      currentTimeRef &&
      currentTimeIndexRef &&
      currentXAxisPosition.current &&
      currentTimeRef.current &&
      currentTimeIndexRef.current &&
      currentAction
    ) {
      const currentValue = currentXAxisPosition.current;
      let nextValue: number;
      if (currentValue === endTimeIndex) {
        nextValue = startTimeIndex;
      } else {
        nextValue = currentValue + 1;
      }
      // 미들바 업데이트
      currentXAxisPosition.current = nextValue;
      const xScaleLinear = prevXScale.current as d3ScaleLinear;
      d3.select('#play-bar-wrapper').style(
        'transform',
        `translate3d(
          ${xScaleLinear(currentXAxisPosition.current) - 10}px, ${X_AXIS_HEIGHT / 2}px, 0)`,
      );

      // currentTime 및 timeIndex 인풋 업데이트
      if (_.round(nextValue / 30, 4) >= lastTime) {
        currentTimeRef.current.value = new Date(_.round(lastTime, 0) * 1000)
          .toISOString()
          .substr(11, 8)
          .substr(2)
          .replace(':', '');
      } else {
        currentTimeRef.current.value = new Date(_.round(nextValue / 30, 0) * 1000)
          .toISOString()
          .substr(11, 8)
          .substr(2)
          .replace(':', '');
      }
      currentTimeIndexRef.current.value = nextValue.toString();
      // 액션 time 업데이트
      currentAction.time = _.round(nextValue / 30, 4);
    }
  }, [
    currentAction,
    currentTimeIndexRef,
    currentTimeRef,
    currentVisualizedData,
    currentXAxisPosition,
    endTimeIndex,
    lastTime,
    playState,
    prevXScale,
    startTimeIndex,
  ]);

  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);

  const handleDopsheetContextMenu = ({
    top,
    left,
    e,
  }: {
    top: number;
    left: number;
    e?: MouseEvent;
  }) => {
    e?.preventDefault();
    storeContextMenuInfo({
      isShow: true,
      top,
      left,
      data: [
        {
          key: 'edit',
          value: 'Edit Keyframe',
          isSelected: false,
          isDisabled: selectedBaseDopeSheets.length === 0 && selectedLayerDopeSheets.length === 0,
        },
        {
          key: 'delete',
          value: 'Delete Keyframe',
          isSelected: false,
          isDisabled: deleteTargetKeyframes.length === 0,
        },
      ],
      onClick: (key) => {
        switch (key) {
          case 'edit':
            if (selectedBaseDopeSheets.length !== 0) {
              handleUpdateKeyframeToBase();
            }
            if (selectedLayerDopeSheets.length !== 0) {
              handleUpdateKeyframeToLayer();
            }
            storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
            break;
          case 'delete':
            handleDeleteKeyframe();
            storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
            break;
          default:
            break;
        }
      },
    });
  };

  useContextMenu({ targetRef: dopeSheetRef, event: handleDopsheetContextMenu });

  // 최초 visualize, 모델 변경 시 재생바 출력
  useEffect(() => {
    if (currentVisualizedData) {
      const { key } = currentVisualizedData;
      if (prevModelKey.current !== key) {
        prevModelKey.current = key;
        setPlayBarDisplayed(true);
      }
    } else {
      prevModelKey.current = '';
      setPlayBarDisplayed(false);
    }
  }, [currentVisualizedData]);

  useEffect(() => {
    if (currentVisualizedData) {
      const { baseLayer, layers } = currentVisualizedData;
      const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });
      const innerlastTime = summaryTimes[summaryTimes.length - 1];
      setLastTime(innerlastTime || 0);
    }
  }, [currentVisualizedData]);

  // 재생 바 드래그 event
  useEffect(() => {
    if (playBarDisplayed) {
      const setPlayBarX = (currentX: number) => {
        if (currentX < startTimeIndex) {
          return startTimeIndex;
        } else if (endTimeIndex < currentX) {
          return endTimeIndex;
        }
        return currentX;
      };
      const dragBehavior = d3
        .drag()
        .filter((playBar) => {
          if (playBar.target.tagName !== 'path') return false;
          return true;
        })
        .on('drag', function (drag: any) {
          const xScaleLinear = prevXScale.current as d3ScaleLinear;
          const currentX = _.floor(prevXScale.current?.invert(drag.x + 20) as number);

          if (currentAction) {
            currentAction.time = _.round(setPlayBarX(currentX) / 30, 4);
          }

          if (currentTimeRef.current) {
            if (_.round(setPlayBarX(currentX) / 30, 4) <= lastTime) {
              const value = new Date(_.round(setPlayBarX(currentX) / 30, 0) * 1000)
                .toISOString()
                .substr(11, 8)
                .substr(2)
                .replace(':', '');
              currentTimeRef.current.value = value;
            } else {
              const value = new Date(_.round(lastTime, 0) * 1000)
                .toISOString()
                .substr(11, 8)
                .substr(2)
                .replace(':', '');
              currentTimeRef.current.value = value;
            }
          }
          if (currentTimeIndexRef.current) {
            currentTimeIndexRef.current.value = setPlayBarX(currentX).toString();
          }
          currentXAxisPosition.current = setPlayBarX(currentX);
          d3.select(this).style(
            'transform',
            `translate3d(${xScaleLinear(setPlayBarX(currentX)) - 10}px, ${X_AXIS_HEIGHT / 2}px, 0)`,
          );
        });

      const initialXScale = setPlayBarX(currentXAxisPosition.current);
      const xScaleLinear = prevXScale.current as d3ScaleLinear;
      currentXAxisPosition.current = setPlayBarX(initialXScale);
      d3.select('#play-bar-wrapper')
        .style(
          'transform',
          `translate3d(${xScaleLinear(initialXScale) - 10}px, ${X_AXIS_HEIGHT / 2}px, 0)`,
        )
        .call(dragBehavior as any);
    }
  }, [
    currentAction,
    currentTimeIndexRef,
    currentTimeRef,
    currentXAxisPosition,
    playBarDisplayed,
    prevXScale,
    endTimeIndex,
    startTimeIndex,
    lastTime,
  ]);

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
          if (multiKeyController['Alt'].pressed && deleteTargetKeyframes.length !== 0) {
            handleDeleteKeyframe();
          }
          break;
        case '∂': // keyframe update
          if (deleteTargetKeyframes.length !== 0) {
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
      deleteTargetKeyframes.length,
      handleDeleteKeyframe,
      handleUpdateKeyframeToBase,
      handleUpdateKeyframeToLayer,
      multiKeyController,
      pageInfo.page,
      playState,
      selectedBaseDopeSheets.length,
      selectedLayerDopeSheets.length,
    ],
  );

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

  const handleDopesheetKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
      switch (event.key) {
        case ',':
        case '<':
          handleMovePlayBarLeft();
          break;
        case '.':
        case '>':
          handleMovePlayBarRight();
          break;
      }
    },
    [handleMovePlayBarLeft, handleMovePlayBarRight],
  );

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

  const startTimeIndexRef = useRef(0);
  const endTimeIndexRef = useRef(0);
  useEffect(() => {
    startTimeIndexRef.current = startTimeIndex;
    endTimeIndexRef.current = endTimeIndex;
  }, [startTimeIndex, endTimeIndex]);

  const curScaleLevel = useRef(INITIAL_SCALE_LEVEL);
  const prevWidth = useRef(0);
  useEffect(() => {
    if (dopeSheetRef.current) {
      const redrawRangeRect = () => {
        const xScaleLinear = prevXScale.current as d3ScaleLinear;
        const rangeRectWidth =
          xScaleLinear(endTimeIndexRef.current) - xScaleLinear(startTimeIndexRef.current);
        d3.select('.range-rect')
          .attr('width', rangeRectWidth)
          .attr(
            'transform',
            `translate(${xScaleLinear(startTimeIndexRef.current)}, -${X_AXIS_HEIGHT / 2})`,
          );
      };

      const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const [entry] = entries;
        const { width, height } = entry.contentRect;
        if (width !== 0 && height !== 0 && prevWidth.current !== width) {
          // x축 다시 그리기
          const rescaleXAxis = (event: d3.D3ZoomEvent<HTMLDivElement, Datum>) => {
            xScale.current = d3
              .scaleLinear()
              .domain([-X_AXIS_DOMAIN, X_AXIS_DOMAIN])
              .range([0, width]); // x값 범위 설정
            xAxisPosition.current = d3.axisTop(xScale.current as d3ScaleLinear); // x축 위치 설정

            const rescaleX = event.transform.rescaleX(xScale.current as d3.ZoomScale); // x rescale
            const xAxisPositionRef = xAxisPosition.current as d3Axis;

            curScaleLevel.current = event.transform.k;
            prevWidth.current = width;

            xScale.current = rescaleX; // rescale한 값으로 갱신
            prevXScale.current = xScale.current?.copy() as d3ScaleLinear; // 이전 x값 복사

            renderXAxis.current?.call(xAxisPositionRef.scale(xScale.current as d3ScaleLinear)); // x축 다시 그리기
            renderYGrid.current?.call(xAxisPositionRef.scale(xScale.current as d3ScaleLinear)); // grid line 다시 그리기
            d3.selectAll('.x-axis-g line').attr('y2', -24);

            const xScaleLinear = prevXScale.current as d3ScaleLinear;
            redrawRangeRect();

            // grid line 조정
            d3.selectAll('.grid-line').remove();
            d3.selectAll('.grid-line-wrapper .tick')
              .append('line')
              .attr('class', 'grid-line')
              .attr('x1', 0)
              .attr('y1', height)
              .attr('x2', 0)
              .attr('y2', 0);

            d3.select('#play-bar-wrapper').style(
              'transform',
              `translate3d(
                  ${xScaleLinear(currentXAxisPosition.current) - 10}px, ${X_AXIS_HEIGHT / 2}px, 0)`,
            );
          };

          // circle x값 rescale
          const rescaleCircleX = () => {
            d3.selectAll(`.${CIRCLE_GROUP_CLASSNAME}`).each(function () {
              if (dopeSheetRef.current) {
                const circleGroup = d3.select(this);
                const circleGroupNode = circleGroup.node() as Element;
                const xScaleLinear = xScale.current as d3ScaleLinear;
                const circleGroupTop = circleGroupNode.getBoundingClientRect().top;
                const timelineWrapperTop = panelWrapperRef.current?.getBoundingClientRect().top;
                if (timelineWrapperTop) {
                  const minimum = timelineWrapperTop - TRACK_HEIGHT * 4;
                  const manimum = window.innerHeight + TRACK_HEIGHT * 4;
                  if (minimum <= circleGroupTop && circleGroupTop <= manimum) {
                    circleGroup.selectAll('circle').each(function () {
                      d3.select(this).attr('cx', (times: any) => xScaleLinear(times.time * 30));
                    });
                  }
                }
              }
            });
          };

          // zoom 이벤트 적용
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
              _.throttle((event: d3.D3ZoomEvent<HTMLDivElement, Datum>) => {
                rescaleXAxis(event);
                rescaleCircleX();
              }, THROTTLE_TIMER),
            );
          d3.select(dopeSheetRef.current)
            .call(zoomBehavior.scaleTo as any, curScaleLevel.current)
            .call(zoomBehavior.translateTo as any, width / 2, height / 2)
            .call(zoomBehavior as any);
        }
      });

      redrawRangeRect();
      ro.observe(dopeSheetRef.current);
    }
  }, [currentXAxisPosition, endTimeIndex, prevXScale, startTimeIndex, panelWrapperRef]);

  const [isUpdated, setIsUpdated] = useState(false);
  const handleIsUpdated = useCallback(() => {
    setIsUpdated((prev) => !prev);
  }, []);
  const list = useDragBox({ ref: dopeSheetRef, isUpdated, onChangeIsUpdated: handleIsUpdated });

  return (
    <>
      <div className={cx('dopesheet-wrapper')} id="dopesheet-wrapper" ref={dopeSheetRef}>
        <div className={cx('circle-group-wrapper')}>
          {_.map(trackList, (dopeSheet) => {
            const { trackName, visualizedDataKey } = dopeSheet;
            const key = `${trackName}_${visualizedDataKey}`;
            return (
              dopeSheet.isShowed &&
              dopeSheet.isFiltered && (
                <CircleGroup
                  key={key}
                  dopeSheetData={dopeSheet}
                  prevXScale={prevXScale.current as d3ScaleLinear}
                />
              )
            );
          })}
        </div>
        {playBarDisplayed && <PlayBar />}
        <DragBox parentRef={dopeSheetRef} isAllCovered onChangeIsUpdated={handleIsUpdated} />
      </div>
    </>
  );
};

export default DopeSheet;
