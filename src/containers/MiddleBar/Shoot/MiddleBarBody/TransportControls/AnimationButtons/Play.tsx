import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { PlayDirection } from 'types/RP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Play: FunctionComponent<Props> = () => {
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);

  const dispatch = useDispatch();

  const handlePlay = useCallback(() => {
    if (_currentAnimationGroup) {
      if (_currentAnimationGroup.isPlaying && _currentAnimationGroup.speedRatio < 0) {
        // (역)재생 중인 상태
        _currentAnimationGroup.speedRatio = _playSpeed;
      } else if (_currentAnimationGroup.isStarted) {
        // 재생 중은 아니지만 시작은 한 상태
        _currentAnimationGroup.speedRatio = _playSpeed;
        _currentAnimationGroup.play();
      } else {
        // 정지 혹은 막 생성된 상태
        _currentAnimationGroup.start(true, _playSpeed, _startTimeIndex, _endTimeIndex);
      }
    }

    // ToDo. visualized 된 데이터가 있는 경우에만 play 버튼이 동작되도록 조건절을 추가해야 됨
    dispatch(
      animatingControlsActions.clickPlayStateButton({
        playState: 'play',
        playDirection: PlayDirection.forward,
      }),
    );
  }, [_currentAnimationGroup, _endTimeIndex, _playSpeed, _startTimeIndex, dispatch]);

  return <IconWrapper onClick={handlePlay} icon={SvgPath.PlayArrow} hasFrame={false} />;
};

export default Play;
