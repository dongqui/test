import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animationDataActions from 'actions/animationDataAction';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const InsertKeyframe = () => {
  const dispatch = useDispatch();

  const _selectedTargets = useSelector((state) => state.selectingData.present.selectingData.selectedTargets);
  const _playState = useSelector((state) => state.animatingControls.playState);

  const handleClickButton = useCallback(() => {
    if (_selectedTargets.length !== 0 && _playState !== 'play') {
      dispatch(animationDataActions.editKeyframes());
    }
  }, [_playState, _selectedTargets.length, dispatch]);

  return (
    <IconWrapper className={cx({ disabled: _selectedTargets.length === 0 || _playState === 'play' })} icon={SvgPath.InsertKeyframe} hasFrame={false} onClick={handleClickButton} />
  );
};

export default InsertKeyframe;
