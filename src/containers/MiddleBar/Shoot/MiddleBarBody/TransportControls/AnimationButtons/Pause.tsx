import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animatingControlsActions from 'actions/animatingControlsAction';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Pause = () => {
  const dispatch = useDispatch();
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  const handlePause = useCallback(() => {
    if (_visualizedAssetIds.length !== 0) {
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause' }));
    }
  }, [_visualizedAssetIds.length, dispatch]);

  return <IconWrapper className={cx('pause')} onClick={handlePause} icon={SvgPath.Pause} hasFrame={false} />;
};

export default Pause;
