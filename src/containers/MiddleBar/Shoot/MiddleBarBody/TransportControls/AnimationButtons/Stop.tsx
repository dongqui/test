import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animatingControlsActions from 'actions/animatingControls';

const Stop = () => {
  const dispatch = useDispatch();
  const playState = useSelector((state) => state.animatingControls.playState);
  const startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);

  const handleStop = useCallback(() => {
    // ToDo. visualized 된 데이터가 있는 경우에만 stop 버튼이 동작되도록 조건절을 추가해야 됨
    if (playState !== 'stop') {
      dispatch(
        animatingControlsActions.clickPlayStateButton({
          playState: 'stop',
          currentTimeIndex: startTimeIndex,
        }),
      );
    }
  }, [dispatch, playState, startTimeIndex]);

  return <IconWrapper onClick={handleStop} icon={SvgPath.Stop} hasFrame={false} />;
};

export default Stop;
