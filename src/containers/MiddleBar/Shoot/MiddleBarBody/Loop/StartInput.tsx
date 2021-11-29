import { useCallback, FunctionComponent } from 'react';
import { debounce } from 'lodash';
import { useDispatch } from 'react-redux';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { PrefixInput } from 'components/Input';

interface Props {
  startTimeIndex: number;
  endTimeIndex: number;
  currentTimeIndex: number;
  keyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const StartInput: FunctionComponent<Props> = (props) => {
  const { startTimeIndex, endTimeIndex, currentTimeIndex, keyDown } = props;
  const dispatch = useDispatch();

  // start input에 debounce 적용
  const handleStartInputChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <PrefixInput
      defaultValue={0}
      onBlur={handleStartInputBlur}
      onChange={handleStartInputChange}
      onKeyDown={keyDown}
      prefix="Start"
      // disabled={!currentVisualizedData}
    />
  );
};

export default StartInput;
