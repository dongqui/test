import { FunctionComponent, MutableRefObject, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { TimeIndex } from 'utils/TP';

const cx = classNames.bind(styles);

interface Props {
  requestAnimationFrameId: MutableRefObject<number>;
}

const Pause: FunctionComponent<Props> = (props) => {
  const { requestAnimationFrameId } = props;
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);

  const dispatch = useDispatch();

  const handlePause = useCallback(() => {
    if (_currentAnimationGroup && _currentAnimationGroup.isPlaying) {
      const masterFrame = Math.floor(_currentAnimationGroup.animatables[0].masterFrame);
      _currentAnimationGroup.pause();
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause', currentTimeIndex: masterFrame }));
    } else {
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause', currentTimeIndex: TimeIndex.getCurrentTimeIndex() }));
    }
    window.cancelAnimationFrame(requestAnimationFrameId.current);
  }, [_currentAnimationGroup, requestAnimationFrameId, dispatch]);

  return <IconWrapper className={cx('pause')} onClick={handlePause} icon={SvgPath.Pause} hasFrame={false} />;
};

export default Pause;
