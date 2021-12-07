import { useCallback, useEffect, useRef, useState, FunctionComponent, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import { useSelector } from 'reducers';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { BaseInput } from 'components/Input';
import { ScaleLinear, TimeIndex } from 'utils/TP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  timelineEditorRef: RefObject<SVGSVGElement>;
}

const Scrubber: FunctionComponent<Props> = (props) => {
  const { timelineEditorRef } = props;
  const dispatch = useDispatch();

  const currentTimeIndex = useSelector((state) => state.animatingControls.currentTimeIndex);
  const playDirection = useSelector((state) => state.animatingControls.playDirection);

  const [inputValue, setInputValue] = useState<number | string>(0);

  const scrubberRef = useRef<SVGGElement>(null);

  const clampTimeIndex = (timeIndex: number) => {
    const startTimeIndex = TimeIndex.getStartTimeIndex();
    const endTimeIndex = TimeIndex.getEndTimeIndex();
    if (timeIndex < startTimeIndex) return startTimeIndex;
    if (endTimeIndex < timeIndex) return endTimeIndex;
    return timeIndex;
  };

  // value값 변경
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!value.includes('e' || 'E')) setInputValue(event.target.value);
  }, []);

  // start, end input에 Enter key 입력 동작
  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isNaN(parseInt(event.key, 10))) {
        timelineEditorRef.current?.focus();
        event.currentTarget.blur();
      }
    },
    [timelineEditorRef],
  );

  // blur 이벤트 적용
  const handleInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const nextValue = parseInt(event.target.value);
      const startTimeIndex = TimeIndex.getStartTimeIndex();
      const endTimeIndex = TimeIndex.getEndTimeIndex();
      const currentTimeIndex = TimeIndex.getCurrentTimeIndex();
      if (isNaN(nextValue) || nextValue < startTimeIndex || endTimeIndex < nextValue) {
        setInputValue(currentTimeIndex);
      } else {
        console.log('scrubber now 입력, containers/Panels/TimelinePanel/TimelineEditor/Scrubber/index.tsx');
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: nextValue }));
      }
    },
    [dispatch],
  );

  // currentTimeIndex 변경 시, now value와 scrubber 위치 변경
  useEffect(() => {
    const scaleX = ScaleLinear.getScaleX();
    const scrubber = scrubberRef.current;
    if (scrubber && scaleX) {
      scrubber.setAttribute('transform', `translate(${scaleX(currentTimeIndex)}, 0)`);
      setInputValue(currentTimeIndex || '0');
    }
  }, [currentTimeIndex, playDirection]);

  // 드래그 이벤트 적용
  useEffect(() => {
    if (!scrubberRef.current) return;
    const setDragBehavior = () => {
      const throttledThing = _.throttle((event) => {
        const scaleX = ScaleLinear.getScaleX();
        const subValue = 15; // now input 가로 절반 길이
        const cursorTimeIndex = _.floor(scaleX.invert(event.x - subValue));
        const clampedTimeIndex = clampTimeIndex(cursorTimeIndex);
        console.log('scrubber 드래그, containers/Panels/TimelinePanel/TimelineEditor/Scrubber/index.tsx');
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: clampedTimeIndex }));
      }, 75);
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
  }, [dispatch]);

  // a/s 키 입력 시, scrubber 이동
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      if (event.key === ('a' || 'A')) {
        const currentTimeIndex = TimeIndex.getCurrentTimeIndex();
        const clampedTimeIndex = clampTimeIndex(currentTimeIndex - 1);
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: clampedTimeIndex }));
        console.log('scrubber A 키 입력, containers/Panels/TimelinePanel/TimelineEditor/Scrubber/index.tsx');
      } else if (event.key === ('s' || 'S')) {
        const currentTimeIndex = TimeIndex.getCurrentTimeIndex();
        const clampedTimeIndex = clampTimeIndex(currentTimeIndex + 1);
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: clampedTimeIndex }));
        console.log('scrubber S 키 입력, containers/Panels/TimelinePanel/TimelineEditor/Scrubber/index.tsx');
      }
    };
    document.addEventListener('keydown', keydownListener);
    return () => {
      document.removeEventListener('keydown', keydownListener);
    };
  }, [dispatch]);

  return (
    <g id="scrubber" className={cx('scrubber')} ref={scrubberRef}>
      <line x1="15" y1="12" x2="15" y2="2000" />
      <foreignObject width="32" height="12">
        <BaseInput arrow={false} maxLength={4} onBlur={handleInputBlur} onChange={handleInputChange} onKeyDown={handleInputKeyDown} type="number" value={inputValue} />
      </foreignObject>
    </g>
  );
};

export default Scrubber;
