import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animatingControlsActions from 'actions/animatingControls';
import { PlayDirection_New } from 'types/RP';

const Rewind = () => {
  const dispatch = useDispatch();

  const handleRewind = useCallback(() => {
    // ToDo. visualized 된 데이터가 있는 경우에만 rewind 버튼이 동작되도록 조건절을 추가해야 됨
    dispatch(
      animatingControlsActions.clickPlayStateButton({
        playState: 'play',
        playDirection: PlayDirection_New.backward,
      }),
    );
  }, [dispatch]);

  return <IconWrapper onClick={handleRewind} icon={SvgPath.RewindArrow} hasFrame={false} />;
};

export default Rewind;
