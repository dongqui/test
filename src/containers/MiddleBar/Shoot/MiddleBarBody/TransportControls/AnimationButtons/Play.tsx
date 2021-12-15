import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { PlayDirection } from 'types/RP';

const Play = () => {
  const dispatch = useDispatch();
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  const handlePlay = useCallback(() => {
    if (_visualizedAssetIds.length !== 0) {
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'play', playDirection: PlayDirection.forward }));
    }
  }, [_visualizedAssetIds.length, dispatch]);

  return <IconWrapper onClick={handlePlay} icon={SvgPath.PlayArrow} hasFrame={false} />;
};

export default Play;
