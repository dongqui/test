import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Pause: FunctionComponent<Props> = () => {
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);

  const dispatch = useDispatch();

  const handlePause = useCallback(() => {
    if (_currentAnimationGroup && _currentAnimationGroup.isPlaying) {
      _currentAnimationGroup.pause();
    }

    // ToDo. visualized 된 데이터가 있는 경우에만 pause 버튼이 동작되도록 조건절을 추가해야 됨
    dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause' }));
  }, [_currentAnimationGroup, dispatch]);

  return <IconWrapper className={cx('pause')} onClick={handlePause} icon={SvgPath.Pause} hasFrame={false} />;
};

export default Pause;
