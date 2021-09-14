import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';
import { useSelector } from 'reducers';
import * as animatingControlsActions from 'actions/animatingControls';
import { BaseInput } from 'components/Input';
import { PlayDirection_New } from 'types/RP';
import ScaleLinear from '../scaleLinear';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Scrubber = () => {
  const dispatch = useDispatch();
  const {
    playState,
    playDirection,
    playSpeed,
    currentTimeIndex,
    startTimeIndex,
    endTimeIndex,
  } = useSelector((state) => state.animatingControls);
  const [inputValue, setInputValue] = useState<number | string>(0);
  const scrubberRef = useRef<SVGGElement>(null);
  const scrubberLoopId = useRef(0);
  const currentTimeIndexRef = useRef(0);

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

  // blur 이벤트 적용
  const handleInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const nextValue = parseInt(event.target.value);
      if (isNaN(nextValue) || nextValue < startTimeIndex || endTimeIndex < nextValue) {
        setInputValue(currentTimeIndex);
      } else {
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: nextValue }));
      }
    },
    [currentTimeIndex, dispatch, endTimeIndex, startTimeIndex],
  );

  // currentTimeIndex 변경 시, now value와 scrubber 위치 변경
  useEffect(() => {
    const scaleX = ScaleLinear.getScaleX();
    const scrubber = scrubberRef.current;
    if (scrubber && scaleX) {
      const decimalToDigit = playDirection ? _.floor(currentTimeIndex) : _.ceil(currentTimeIndex);
      scrubber.style.transform = `translate3d(${scaleX(decimalToDigit) + 5}px, 0, 0)`;
      setInputValue(decimalToDigit || '0');
      currentTimeIndexRef.current = currentTimeIndex;
    }
  }, [currentTimeIndex, playDirection]);

  // 애니메이션 싱크
  useEffect(() => {
    const loopScrubber = () => {
      let payload: { currentTimeIndex: number } | undefined;
      const nextValue = currentTimeIndexRef.current + playDirection * playSpeed;
      if (playDirection === PlayDirection_New.forward) {
        payload = { currentTimeIndex: endTimeIndex < nextValue ? startTimeIndex : nextValue };
      } else if (playDirection === PlayDirection_New.backward) {
        payload = { currentTimeIndex: nextValue < startTimeIndex ? endTimeIndex : nextValue };
      }
      scrubberLoopId.current = window.requestAnimationFrame(loopScrubber);
      if (payload) dispatch(animatingControlsActions.moveScrubber(payload));
    };
    if (playState === 'play') {
      window.cancelAnimationFrame(scrubberLoopId.current); // 애니메이션 재생 도중 playDirection, startTimeIndex, endTimeIndex이 변경 될 경우 기존 애니메이션 종료
      scrubberLoopId.current = window.requestAnimationFrame(loopScrubber);
    } else if (playState === 'pause' || playState === 'stop') {
      window.cancelAnimationFrame(scrubberLoopId.current);
    }
  }, [playState, playDirection, dispatch, startTimeIndex, endTimeIndex, playSpeed]);

  // 드래그 이벤트 적용
  useEffect(() => {
    if (!scrubberRef.current) return;
    const clampTimeIndex = (timeIndex: number) => {
      if (timeIndex < startTimeIndex) return startTimeIndex;
      if (endTimeIndex < timeIndex) return endTimeIndex;
      return timeIndex;
    };
    const setDragBehavior = () => {
      const throttledThing = _.throttle((event) => {
        const scaleX = ScaleLinear.getScaleX();
        const subValue = 15; // now input 가로 절반 길이
        const cursorTimeIndex = _.floor(scaleX.invert(event.x - subValue));
        const currentTimeIndex = clampTimeIndex(cursorTimeIndex);
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex }));
      }, 50);
      const dragBehavior = d3
        .drag()
        .on('drag', throttledThing)
        .on('end', () => {
          throttledThing.cancel();
        });
      return dragBehavior;
    };
    const scrubber = d3.select(scrubberRef.current);
    const dragBehavior = setDragBehavior();
    scrubber.call(dragBehavior as any);
  }, [dispatch, endTimeIndex, startTimeIndex]);

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
