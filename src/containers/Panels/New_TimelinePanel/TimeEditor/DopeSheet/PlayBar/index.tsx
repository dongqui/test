import React, {
  memo,
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames/bind';
import * as d3 from 'd3';
import _ from 'lodash';
import styles from './index.module.scss';
import { d3ScaleLinear } from 'types/TP';
import * as currentVisualizedDataActions from 'actions/currentVisualizedData';
import { fnGetSummaryTimes } from 'utils/TP/editingUtils';
import { useSelector } from 'reducers';
import { fnGetMaskedValue, fnSetValue } from 'utils/common';

const cx = classNames.bind(styles);
const PLAY_BAR_COLOR = '#ECEDEE';
const TIME_FRAME_HEIGHT = 48;

interface Props {
  currentPlayBarTime: MutableRefObject<number>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentTimeRef: RefObject<HTMLInputElement>;
  dopeSheetScale: MutableRefObject<d3ScaleLinear | null>;
}

const PlayBar: React.FC<Props> = (props) => {
  const { currentPlayBarTime, currentTimeIndexRef, currentTimeRef, dopeSheetScale } = props;
  const [lastTime, setLastTime] = useState(0);

  const currentVisualizedData = useSelector<currentVisualizedDataActions.CurrentVisualizedData>(
    (state) => state.currentVisualizedData,
  );
  const { startTimeIndex, endTimeIndex, playState, currentAction } = useSelector(
    (state) => state.animatingData,
  );

  // 재생바 위치 변경
  const playBarReqId = useRef<number | undefined>();
  const setPlayBarPosition = useCallback(() => {
    if (currentPlayBarTime && currentAction && dopeSheetScale.current) {
      currentPlayBarTime.current = currentAction.time ? currentAction.time * 30 : 1;
      const scaleXLineaer = dopeSheetScale.current;
      const translateX = scaleXLineaer(currentPlayBarTime.current) - 10;
      const translateY = TIME_FRAME_HEIGHT / 2;
      d3.select('#play-bar').style('transform', `translate3d(${translateX}px, ${translateY}px, 0)`);
    }
    playBarReqId.current = window.requestAnimationFrame(setPlayBarPosition);
  }, [currentAction, currentPlayBarTime, dopeSheetScale]);

  // 재생바 loop 시작
  const startPlayBarPositionLoop = useCallback(() => {
    playBarReqId.current = window.requestAnimationFrame(setPlayBarPosition);
  }, [setPlayBarPosition]);

  // 재생바 loop 중지
  const stopPlayBarPositionLoop = useCallback(() => {
    if (playBarReqId.current) {
      window.cancelAnimationFrame(playBarReqId.current);
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

  // keypress 발생 시 재생바 왼쪽으로 이동
  const handleMovePlayBarLeft = useCallback(() => {
    if (
      playState !== 'play' &&
      currentVisualizedData &&
      currentPlayBarTime &&
      currentTimeRef &&
      currentTimeIndexRef &&
      currentPlayBarTime.current &&
      currentTimeRef.current &&
      currentTimeIndexRef.current &&
      currentAction &&
      dopeSheetScale.current
    ) {
      const currentValue = currentPlayBarTime.current;
      let nextValue: number;
      if (currentValue === startTimeIndex) {
        nextValue = endTimeIndex;
      } else {
        nextValue = currentValue - 1;
      }
      currentPlayBarTime.current = nextValue;
      const scaleXLineaer = dopeSheetScale.current;
      const translateX = scaleXLineaer(currentPlayBarTime.current) - 10;
      const translateY = TIME_FRAME_HEIGHT / 2;
      d3.select('#play-bar').style('transform', `translate3d(${translateX}px, ${translateY}px, 0)`);

      if (_.round(nextValue / 30, 4) >= lastTime) {
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(lastTime, 0)));
      } else {
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(nextValue / 30, 0)));
      }
      fnSetValue(currentTimeIndexRef, nextValue);
      currentAction.time = _.round(nextValue / 30, 4);
    }
  }, [
    currentAction,
    currentTimeIndexRef,
    currentTimeRef,
    currentVisualizedData,
    currentPlayBarTime,
    endTimeIndex,
    lastTime,
    playState,
    dopeSheetScale,
    startTimeIndex,
  ]);

  // keypress 발생 시 재생바 오른쪽으로 이동
  const handleMovePlayBarRight = useCallback(() => {
    if (
      playState !== 'play' &&
      currentVisualizedData &&
      currentPlayBarTime &&
      currentTimeRef &&
      currentTimeIndexRef &&
      currentPlayBarTime.current &&
      currentTimeRef.current &&
      currentTimeIndexRef.current &&
      currentAction &&
      dopeSheetScale.current
    ) {
      const currentValue = currentPlayBarTime.current;
      let nextValue: number;
      if (currentValue === endTimeIndex) {
        nextValue = startTimeIndex;
      } else {
        nextValue = currentValue + 1;
      }
      currentPlayBarTime.current = nextValue;
      const scaleXLineaer = dopeSheetScale.current;
      const translateX = scaleXLineaer(currentPlayBarTime.current) - 10;
      const translateY = TIME_FRAME_HEIGHT / 2;
      d3.select('#play-bar').style('transform', `translate3d(${translateX}px, ${translateY}px, 0)`);

      if (_.round(nextValue / 30, 4) >= lastTime) {
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(lastTime, 0)));
      } else {
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(nextValue / 30, 0)));
      }
      fnSetValue(currentTimeIndexRef, nextValue);
      currentAction.time = _.round(nextValue / 30, 4);
    }
  }, [
    currentAction,
    currentTimeIndexRef,
    currentTimeRef,
    currentVisualizedData,
    currentPlayBarTime,
    endTimeIndex,
    lastTime,
    playState,
    dopeSheetScale,
    startTimeIndex,
  ]);

  // dope sheet key press 이벤트
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

  //  key press 이벤트 추가
  useEffect(() => {
    document.addEventListener('keypress', handleDopesheetKeyPress);
    return () => {
      document.removeEventListener('keypress', handleDopesheetKeyPress);
    };
  }, [handleDopesheetKeyPress]);

  // 재생바 드레그 이벤트
  useEffect(() => {
    if (dopeSheetScale.current) {
      const setPlayBarTime = (time: number) => {
        if (time < startTimeIndex) return startTimeIndex;
        if (endTimeIndex < time) return endTimeIndex;
        return time;
      };
      const dragBehavior = d3
        .drag()
        .filter((playBar) => {
          if (playBar.target.tagName === 'line') return false;
          return true;
        })
        .on('drag', function (drag: MouseEvent) {
          if (!dopeSheetScale.current) return;
          const playBarTime = _.floor(dopeSheetScale.current.invert(drag.x + 20) as number);
          if (currentAction) {
            currentAction.time = _.round(setPlayBarTime(playBarTime) / 30, 4);
          }
          if (currentTimeRef.current) {
            if (_.round(setPlayBarTime(playBarTime) / 30, 4) <= lastTime) {
              const value = new Date(_.round(setPlayBarTime(playBarTime) / 30, 0) * 1000)
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
            currentTimeIndexRef.current.value = setPlayBarTime(playBarTime).toString();
          }
          const scaleXLineaer = dopeSheetScale.current;
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
  }, [
    currentAction,
    currentPlayBarTime,
    currentTimeIndexRef,
    currentTimeRef,
    dopeSheetScale,
    endTimeIndex,
    lastTime,
    startTimeIndex,
  ]);

  useEffect(() => {
    if (currentVisualizedData) {
      const { baseLayer, layers } = currentVisualizedData;
      const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });
      const innerlastTime = summaryTimes[summaryTimes.length - 1];
      setLastTime(innerlastTime || 0);
    }
  }, [currentVisualizedData]);

  return (
    <>
      <svg width="20" height="480" className={cx('play-bar')} id="play-bar">
        <g>
          <line x1="0" y1="480" x2="0" y2="0" />
          <path
            d="M0 1C0 0.447716 0.447715 0 1 0H19C19.5523 0 20 0.447715 20 1V14.4114C20 14.692 19.8821 14.9598 19.675 15.1492L10.675 23.3825C10.2929 23.7321 9.70712 23.7321 9.32502 23.3825L0.325019 15.1492C0.11794 14.9598 0 14.692 0 14.4114V1Z"
            fill={PLAY_BAR_COLOR}
          />
        </g>
      </svg>
    </>
  );
};

export default memo(PlayBar);
