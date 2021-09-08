import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';
import { useSelector } from 'reducers';
import * as animatingDataActions from 'actions/animatingData';
import { BaseInput } from 'components/Input';
import ScaleLinear from '../scaleLinear';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Scrubber = () => {
  const dispatch = useDispatch();
  const endTimeIndex = useSelector((state) => state.animatingData.endTimeIndex);
  const startTimeIndex = useSelector((state) => state.animatingData.startTimeIndex);
  const currentAction = useSelector((state) => state.animatingData.currentAction);
  const playState = useSelector((state) => state.animatingData.playState);
  const [inputValue, setInputValue] = useState<number | string>(0);
  const scrubberRef = useRef<SVGGElement>(null);
  const previousValue = useRef(0);
  const scrubberRafId = useRef<number | undefined>();

  // value값 변경
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  // start, end input에 Enter key 입력 동작
  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.currentTarget.blur();
        break;
      default:
        break;
    }
  }, []);

  // 현재 time index가 start와 end 사이에 있는지 체크
  const clampTimeIndex = useCallback(
    (timeIndex: number) => {
      if (timeIndex < startTimeIndex) return startTimeIndex;
      if (endTimeIndex < timeIndex) return endTimeIndex;
      return timeIndex;
    },
    [endTimeIndex, startTimeIndex],
  );

  // scrubber의 위치 변경
  const translateScrubber = useCallback((scrubberTimeIndex: number) => {
    if (!scrubberRef.current) return;
    const scrubber = d3.select(scrubberRef.current);
    const scaleX = ScaleLinear.getScaleX();
    scrubber.style('transform', `translate3d(${scaleX(scrubberTimeIndex) + 5}px, 0, 0)`);
  }, []);

  // drag, now input 변경 시 scrubber 업데이트
  const updateScrubberStatus = useCallback(
    (nextValue: number) => {
      const currentTimeIndex = clampTimeIndex(nextValue);
      translateScrubber(currentTimeIndex);
      setInputValue(currentTimeIndex);
      dispatch(animatingDataActions.setCurrentTimeIndex({ currentTimeIndex }));
      previousValue.current = currentTimeIndex;
    },
    [clampTimeIndex, dispatch, translateScrubber],
  );

  // blur 이벤트 적용
  const handleInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const nextValue = parseInt(event.target.value);
      const isMinusZero = Object.is(-0, nextValue);
      if (isNaN(nextValue)) {
        setInputValue(previousValue.current);
      } else if (isMinusZero) {
        event.target.value = '0';
        updateScrubberStatus(0);
      } else {
        updateScrubberStatus(nextValue);
      }
    },
    [updateScrubberStatus],
  );

  // 애니메이션 싱크
  useEffect(() => {
    const loopScrubber = () => {
      if (!currentAction) return;
      const timeIndex = currentAction.time ? currentAction.time * 30 : 1; // ?
      translateScrubber(timeIndex);
      scrubberRafId.current = window.requestAnimationFrame(loopScrubber);
    };
    if (playState === 'play') {
      scrubberRafId.current = window.requestAnimationFrame(loopScrubber);
    } else if (playState === 'pause' || playState === 'stop') {
      if (scrubberRafId.current) window.cancelAnimationFrame(scrubberRafId.current);
    }
  }, [currentAction, playState, translateScrubber]);

  // 드래그 이벤트 적용
  useEffect(() => {
    if (!scrubberRef.current) return;
    const scrubber = d3.select(scrubberRef.current);
    const throttledThing = _.throttle((event: MouseEvent) => {
      const scaleX = ScaleLinear.getScaleX();
      const subValue = 15; // now input 가로 절반 길이
      const cursorTimeIndex = _.floor(scaleX.invert(event.x - subValue));
      updateScrubberStatus(cursorTimeIndex);
    }, 50);
    const dragBehavior = d3
      .drag()
      .on('drag', throttledThing)
      .on('end', () => throttledThing.cancel());
    scrubber.call(dragBehavior as any);
  }, [updateScrubberStatus]);

  return (
    <g id="scrubber" className={cx('scrubber')} ref={scrubberRef}>
      <line x1="15" y1="12" x2="15" y2="2000" />
      <foreignObject width="30" height="12">
        <BaseInput
          arrow={false}
          maxLength={4}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          type="number"
          value={inputValue}
        />
      </foreignObject>
    </g>
  );
};

export default Scrubber;
