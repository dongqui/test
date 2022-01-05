import { useCallback, useEffect, useRef, useState, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import { PlayDirection } from 'types/RP';
import { useSelector } from 'reducers';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { BaseInput } from 'components/Input';
import { ScaleLinear, TimeIndex } from 'utils/TP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isFocusedTimelineEditor: boolean;
}

const Scrubber: FunctionComponent<Props> = (props) => {
  const { isFocusedTimelineEditor } = props;
  const dispatch = useDispatch();

  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);
  const _currentTimeIndex = useSelector((state) => state.animatingControls.currentTimeIndex);
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const _playDirection = useSelector((state) => state.animatingControls.playDirection);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);

  const [inputValue, setInputValue] = useState<number | string>(0);
  const [disableScrubber, setDisableScrubber] = useState(false);
  const [focusScrubber, setFocusScrubber] = useState(false);

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
    setInputValue(value);
  }, []);

  // 조건에 맞지 않은 문자열을 입력할 경우 blur
  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && isNaN(parseInt(event.key, 10))) {
      event.currentTarget.blur();
      document.getElementById('timeline-editor-svg')?.focus();
    }
  }, []);

  // scrubber input 클릭
  const handleInputClick = useCallback(() => {
    setFocusScrubber(true);
    setDisableScrubber(false);
  }, []);

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
        if (_currentAnimationGroup) {
          if (_currentAnimationGroup.isStarted) {
            _currentAnimationGroup.goToFrame(nextValue);
          } else {
            _currentAnimationGroup.start(true, _playSpeed, _startTimeIndex, _endTimeIndex).pause().goToFrame(nextValue);
          }
        }
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: nextValue }));
      }
      setFocusScrubber(false);
    },
    [_currentAnimationGroup, _endTimeIndex, _playSpeed, _startTimeIndex, dispatch],
  );

  // currentTimeIndex 변경 시, now value와 scrubber 위치 변경
  useEffect(() => {
    const scaleX = ScaleLinear.getScaleX();
    const scrubber = scrubberRef.current;
    if (scrubber && scaleX) {
      const digitedNextFrame = _playDirection === PlayDirection.forward ? Math.floor(_currentTimeIndex) : Math.ceil(_currentTimeIndex);
      scrubber.setAttribute('transform', `translate(${scaleX(digitedNextFrame) - 3}, 0)`);
      setInputValue(digitedNextFrame || '0');
    }
  }, [_currentTimeIndex, _playDirection]);

  // 드래그 이벤트 적용
  useEffect(() => {
    if (!scrubberRef.current) return;
    const setDragBehavior = () => {
      const throttledThing = _.throttle((event) => {
        const scaleX = ScaleLinear.getScaleX();
        const subValue = 15; // now input 가로 절반 길이
        const cursorTimeIndex = _.floor(scaleX.invert(event.x - subValue));
        const clampedTimeIndex = clampTimeIndex(cursorTimeIndex);

        if (_currentAnimationGroup) {
          if (_currentAnimationGroup.isStarted) {
            _currentAnimationGroup.goToFrame(clampedTimeIndex);
          } else {
            _currentAnimationGroup.start(true, _playSpeed, _startTimeIndex, _endTimeIndex).pause().goToFrame(clampedTimeIndex);
          }
        }
        setDisableScrubber(true);
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: clampedTimeIndex }));
      }, 75);

      const dragBehavior = d3
        .drag()
        .on('start', () => {
          setFocusScrubber(false);
        })
        .on('drag', throttledThing)
        .on('end', (event) => {
          throttledThing.cancel();
          setDisableScrubber(false);
          if (event.subject.x !== event.x && event.subject.y !== event.y) {
            document.getElementById('timeline-editor-svg')?.focus();
          }
        });
      return dragBehavior;
    };

    const scrubber = d3.select(scrubberRef.current);
    const dragBehavior = setDragBehavior();
    scrubber.call(dragBehavior as any);
  }, [_currentAnimationGroup, _endTimeIndex, _playSpeed, _startTimeIndex, dispatch]);

  // A 키 입력 시, 오른쪽으로 scrubber 1frame 이동
  const pressAKey = useCallback(() => {
    const currentTimeIndex = TimeIndex.getCurrentTimeIndex();
    const clampedTimeIndex = clampTimeIndex(currentTimeIndex - 1);
    dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: clampedTimeIndex }));
    if (_currentAnimationGroup) {
      if (_currentAnimationGroup.isStarted) {
        _currentAnimationGroup.goToFrame(clampedTimeIndex);
      } else {
        _currentAnimationGroup.start(true, _playSpeed, _startTimeIndex, _endTimeIndex).pause().goToFrame(clampedTimeIndex);
      }
    }
  }, [_currentAnimationGroup, _endTimeIndex, _playSpeed, _startTimeIndex, dispatch]);

  // S 키 입력 시, 왼쪽으로 scrubber 1frame 이동
  const pressSKey = useCallback(() => {
    const currentTimeIndex = TimeIndex.getCurrentTimeIndex();
    const clampedTimeIndex = clampTimeIndex(currentTimeIndex + 1);
    dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: clampedTimeIndex }));
    if (_currentAnimationGroup) {
      if (_currentAnimationGroup.isStarted) {
        _currentAnimationGroup.goToFrame(clampedTimeIndex);
      } else {
        _currentAnimationGroup.start(true, _playSpeed, _startTimeIndex, _endTimeIndex).pause().goToFrame(clampedTimeIndex);
      }
    }
  }, [_currentAnimationGroup, _endTimeIndex, _playSpeed, _startTimeIndex, dispatch]);

  // scrubber 키 입력 이벤트
  const keydownListener = useCallback(
    (event: KeyboardEvent) => {
      const isPressedAKey = event.key === 'a' || event.key === 'A' || event.key === 'ㅁ';
      const isPressedSKey = event.key === 's' || event.key === 'S' || event.key === 'ㄴ';
      if (isPressedAKey) {
        pressAKey();
      } else if (isPressedSKey) {
        pressSKey();
      }
    },
    [pressAKey, pressSKey],
  );

  // 부모 컴포넌트 focus 시, focus에 keydown 이벤트 등록
  useEffect(() => {
    const currentRef = scrubberRef.current;
    if (isFocusedTimelineEditor && currentRef) {
      document.addEventListener('keydown', keydownListener);
    }
    return () => {
      document.removeEventListener('keydown', keydownListener);
    };
  }, [isFocusedTimelineEditor, keydownListener]);

  return (
    <g id="scrubber" className={cx('scrubber')} ref={scrubberRef}>
      <line x1="23" y1="12" x2="23" y2="2000" />
      <path d="M9.27203 0H9.18118C8.51416 0 7.88043 0.291572 7.44634 0.798191L2.55008 6.51248C1.81664 7.36845 1.81664 8.63155 2.55008 9.48752L7.44634 15.2018C7.88043 15.7084 8.51416 16 9.18118 16H34.8188C35.4858 16 36.1196 15.7084 36.5537 15.2018L41.4499 9.48752C42.1834 8.63155 42.1834 7.36845 41.4499 6.51248L36.5537 0.798191C36.1196 0.291572 35.4858 0 34.8188 0H34.728H9.27203Z" />
      <foreignObject className={cx('input-wrapper')} width="28" height="14">
        <div>
          <BaseInput
            className={cx({ focused: focusScrubber })}
            arrow={false}
            maxLength={4}
            onClick={handleInputClick}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onWheel={(e) => e.preventDefault()}
            type="number"
            value={inputValue}
            disabled={disableScrubber}
          />
        </div>
      </foreignObject>
    </g>
  );
};

export default Scrubber;
