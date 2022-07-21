import { useCallback, ChangeEvent, FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';

import * as animatingControlsActions from 'actions/animatingControlsAction';
import { useSelector } from 'reducers';
import { forceClickAnimationPauseAndPlay } from 'utils/common';

import LoopInput from './LoopInput';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Loop = () => {
  const dispatch = useDispatch();

  const _playDirection = useSelector((state) => state.animatingControls.playDirection);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);
  const _currentTimeIndex = useSelector((state) => state.animatingControls.currentTimeIndex);

  // start input에 debounce 적용
  const handleStartInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    event.target.blur();
  }, 1500);

  // end input에 debounce 적용
  const handleEndInputChange = debounce((event: ChangeEvent<HTMLInputElement>) => {
    event.target.blur();
  }, 1500);

  // start input에 blur 이벤트 발생
  const handleStartInputBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const nextStartValue = parseInt(event.target.value);
      const isMinusZero = Object.is(-0, nextStartValue);
      if (isNaN(nextStartValue) || nextStartValue < 0 || _endTimeIndex <= nextStartValue) {
        event.target.value = _startTimeIndex.toString();
      } else if (isMinusZero) {
        dispatch(animatingControlsActions.blurStartInput({ startTimeIndex: 0, currentTimeIndex: _currentTimeIndex }));
        event.target.value = '0';
      } else {
        const payload = {
          startTimeIndex: nextStartValue,
          currentTimeIndex: Math.max(_currentTimeIndex, nextStartValue),
        };
        dispatch(animatingControlsActions.blurStartInput(payload));
      }
      handleStartInputChange.cancel();
      forceClickAnimationPauseAndPlay(_playState, _playDirection);
    },
    [_currentTimeIndex, _endTimeIndex, _playState, _playDirection, _startTimeIndex, handleStartInputChange, dispatch],
  );

  // end input에 blur 이벤트 발생
  const handleEndInputBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const nextEndValue = parseInt(event.target.value);
      if (isNaN(nextEndValue) || nextEndValue <= _startTimeIndex || 9999 < nextEndValue) {
        event.target.value = _endTimeIndex.toString();
      } else {
        const payload = {
          endTimeIndex: nextEndValue,
          currentTimeIndex: Math.min(nextEndValue, _currentTimeIndex),
        };
        dispatch(animatingControlsActions.blurEndInput(payload));
      }
      handleEndInputChange.cancel();
      forceClickAnimationPauseAndPlay(_playState, _playDirection);
    },
    [_startTimeIndex, _playState, _playDirection, _endTimeIndex, _currentTimeIndex, handleEndInputChange, dispatch],
  );

  return (
    <div className={cx('loop')}>
      <p>Loop</p>
      <LoopInput defaultValue={0} onBlurInput={handleStartInputBlur} onChangeInput={handleStartInputChange} prefix="Start" />
      <LoopInput defaultValue={500} onBlurInput={handleEndInputBlur} onChangeInput={handleEndInputChange} prefix="End" />
    </div>
  );
};

export default Loop;
