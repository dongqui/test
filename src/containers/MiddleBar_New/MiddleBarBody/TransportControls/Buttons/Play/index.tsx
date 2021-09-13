import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animatingControlsActions from 'actions/animatingControls';
import { PlayDirection_New } from 'types/RP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Play = () => {
  const dispatch = useDispatch();

  const handlePlay = useCallback(() => {
    // ToDo. visualized 된 데이터가 있는 경우에만 play 버튼이 동작되도록 조건절을 추가해야 됨
    dispatch(
      animatingControlsActions.clickPlayStateButton({
        playState: 'play',
        playDirection: PlayDirection_New.forward,
      }),
    );
  }, [dispatch]);

  return (
    <IconWrapper
      className={cx('play')}
      onClick={handlePlay}
      icon={SvgPath.PlayArrow}
      hasFrame={false}
    />
  );
};

export default Play;
