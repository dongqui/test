import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animatingControlsActions from 'actions/animatingControls';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Pause = () => {
  const dispatch = useDispatch();

  const handlePause = useCallback(() => {
    // ToDo. visualized 된 데이터가 있는 경우에만 pause 버튼이 동작되도록 조건절을 추가해야 됨
    dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause' }));
  }, [dispatch]);

  return (
    <IconWrapper
      className={cx('pause')}
      onClick={handlePause}
      icon={SvgPath.Pause}
      hasFrame={false}
    />
  );
};

export default Pause;
