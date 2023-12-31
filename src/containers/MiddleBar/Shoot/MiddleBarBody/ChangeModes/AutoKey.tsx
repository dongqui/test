import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { GhostButton } from 'components/Button';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const AutoKey = () => {
  const dispatch = useDispatch();

  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _isAutokeyOn = useSelector((state) => state.animatingControls.isAutokeyOn);

  // auto key 버튼 클릭
  const handleAutoKeyButton = useCallback(() => {
    if (_playState !== 'play') {
      dispatch(animatingControlsActions.clickAutoKeyButton());
    }
  }, [_playState, dispatch]);

  return <GhostButton text="Autokey" className={cx({ active: _isAutokeyOn, disabled: _visualizedAssetIds.length === 0 || _playState === 'play' })} onClick={handleAutoKeyButton} />;
};

export default AutoKey;
