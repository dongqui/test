import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { PlayDirection } from 'types/RP';

const Rewind = () => {
  const dispatch = useDispatch();
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  const handleRewind = useCallback(() => {
    if (_visualizedAssetIds.length !== 0) {
      dispatch(
        animatingControlsActions.clickPlayStateButton({
          playState: 'play',
          playDirection: PlayDirection.backward,
        }),
      );
    }
  }, [_visualizedAssetIds.length, dispatch]);

  return <IconWrapper onClick={handleRewind} icon={SvgPath.RewindArrow} hasFrame={false} />;
};

export default Rewind;
