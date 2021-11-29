import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import * as animatingControlsActions from 'actions/animatingControlsAction';

import AnimationButtons from './AnimationButtons';
import FasterDropdown from './FasterDropdown';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TransportControls = () => {
  const dispatch = useDispatch();
  const playState = useSelector((state) => state.animatingControls.playState);
  const playDirection = useSelector((state) => state.animatingControls.playDirection);

  // space bar 입력 시, 재생/정시 toggle
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        if (playState === 'play') {
          dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause' }));
        } else if (playState === 'pause' || playState === 'stop') {
          dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'play', playDirection: playDirection }));
        }
      }
    };
    document.addEventListener('keydown', keydownListener);
    return () => {
      document.removeEventListener('keydown', keydownListener);
    };
  }, [dispatch, playDirection, playState]);

  return (
    <div className={cx('transport-controls')}>
      <AnimationButtons />
      <FasterDropdown />
    </div>
  );
};

export default TransportControls;
