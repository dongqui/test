import { useCallback, FunctionComponent } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import * as animatingControlsActions from 'actions/animatingControls';
import { useSelector } from 'reducers';
import { PrefixInput } from 'components/Input';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const LoopRange: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);
  const currentTimeIndex = useSelector((state) => state.animatingControls.currentTimeIndex);
  // const currentVisualizedData = useSelector((state) => state.currentVisualizedData);

  // start input에 debounce 적용
  const handleStartInputChange = _.debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.blur();
  }, 1500);

  // end input에 debounce 적용
  const handleEndInputChange = _.debounce((event: React.ChangeEvent<HTMLInputElement>) => {
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
        const payload = {
          startTimeIndex: 0,
          currentTimeIndex: currentTimeIndex,
        };
        dispatch(animatingControlsActions.blurStartInput(payload));
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

  return (
    <div className={cx('loop-range')}>
      <p>Loop Range</p>
      <PrefixInput
        className={cx('indicator-input')}
        defaultValue={0}
        onBlur={handleStartInputBlur}
        onChange={handleStartInputChange}
        onKeyDown={handleInputKeyDown}
        prefix="Start"
        // disabled={!currentVisualizedData}
      />
      <PrefixInput
        className={cx('indicator-input')}
        defaultValue={100}
        onBlur={handleEndInputBlur}
        onChange={handleEndInputChange}
        onKeyDown={handleInputKeyDown}
        prefix="End"
        // disabled={!currentVisualizedData}
      />
    </div>
  );
};

export default LoopRange;
