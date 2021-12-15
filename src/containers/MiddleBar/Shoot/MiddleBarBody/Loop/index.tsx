import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';

import { useSelector } from 'reducers';
import * as animatingControlsActions from 'actions/animatingControlsAction';

import LoopInput from './LoopInput';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Loop = () => {
  const dispatch = useDispatch();

  const startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);
  const currentTimeIndex = useSelector((state) => state.animatingControls.currentTimeIndex);

  // start input에 debounce 적용
  const handleStartInputChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.blur();
  }, 1500);

  // end input에 debounce 적용
  const handleEndInputChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.blur();
  }, 1500);

  // start input에 blur 이벤트 발생
  const handleStartInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const nextStartValue = parseInt(event.target.value);
      const isMinusZero = Object.is(-0, nextStartValue);
      if (isNaN(nextStartValue) || nextStartValue < 0 || endTimeIndex <= nextStartValue) {
        event.target.value = startTimeIndex.toString();
      } else if (isMinusZero) {
        dispatch(animatingControlsActions.blurStartInput({ startTimeIndex: 0, currentTimeIndex: currentTimeIndex }));
        event.target.value = '0';
      } else {
        const payload = {
          startTimeIndex: nextStartValue,
          currentTimeIndex: currentTimeIndex < nextStartValue ? nextStartValue : currentTimeIndex,
        };
        dispatch(animatingControlsActions.blurStartInput(payload));
      }
      handleStartInputChange.cancel(); // 현재 change event에 걸린 debounce 취소
    },
    [currentTimeIndex, dispatch, endTimeIndex, handleStartInputChange, startTimeIndex],
  );

  // end input에 blur 이벤트 발생
  const handleEndInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const nextEndValue = parseInt(event.target.value);
      if (isNaN(nextEndValue) || nextEndValue <= startTimeIndex || 9999 < nextEndValue) {
        event.target.value = endTimeIndex.toString();
      } else {
        const payload = {
          endTimeIndex: nextEndValue,
          currentTimeIndex: nextEndValue < currentTimeIndex ? nextEndValue : currentTimeIndex,
        };
        dispatch(animatingControlsActions.blurEndInput(payload));
      }
      handleEndInputChange.cancel();
    },
    [currentTimeIndex, dispatch, endTimeIndex, handleEndInputChange, startTimeIndex],
  );

  return (
    <div className={cx('loop')}>
      <p>Loop</p>
      <LoopInput defaultValue={0} onBlurInput={handleStartInputBlur} onChangeInput={handleStartInputChange} prefix="Start" />
      <LoopInput defaultValue={100} onBlurInput={handleEndInputBlur} onChangeInput={handleEndInputChange} prefix="End" />
    </div>
  );
};

export default Loop;
