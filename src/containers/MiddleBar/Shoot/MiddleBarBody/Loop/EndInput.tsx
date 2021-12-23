import { useCallback, FunctionComponent } from 'react';
import { debounce } from 'lodash';
import { useDispatch } from 'react-redux';

import * as animatingControlsActions from 'actions/animatingControlsAction';
import { useSelector } from 'reducers';
import { PrefixInput } from 'components/Input';
import { forceAnimationButtonsClick } from 'utils/common';

interface Props {
  startTimeIndex: number;
  endTimeIndex: number;
  currentTimeIndex: number;
  keyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const EndInput: FunctionComponent<Props> = (props) => {
  const { startTimeIndex, endTimeIndex, currentTimeIndex, keyDown } = props;
  const dispatch = useDispatch();

  const _playDirection = useSelector((state) => state.animatingControls.playDirection);
  const _playState = useSelector((state) => state.animatingControls.playState);

  // end input에 debounce 적용
  const handleEndInputChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.blur();
  }, 1500);

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
      forceAnimationButtonsClick(_playState, _playDirection);
    },
    [_playDirection, _playState, currentTimeIndex, dispatch, endTimeIndex, handleEndInputChange, startTimeIndex],
  );

  return (
    <PrefixInput
      defaultValue={100}
      onBlur={handleEndInputBlur}
      onChange={handleEndInputChange}
      onKeyDown={keyDown}
      prefix="End"
      // disabled={!currentVisualizedData}
    />
  );
};

export default EndInput;
