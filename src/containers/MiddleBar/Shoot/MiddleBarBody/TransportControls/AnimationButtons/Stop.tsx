import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animatingControlsActions from 'actions/animatingControlsAction';

const Stop = () => {
  const dispatch = useDispatch();
  const playState = useSelector((state) => state.animatingControls.playState);
  const startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  const handleStop = useCallback(() => {
    if (_visualizedAssetIds.length !== 0 && playState !== 'stop') {
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'stop', currentTimeIndex: startTimeIndex }));
    }
  }, [dispatch, _visualizedAssetIds.length, playState, startTimeIndex]);

  return <IconWrapper onClick={handleStop} icon={SvgPath.Stop} hasFrame={false} />;
};

export default Stop;
