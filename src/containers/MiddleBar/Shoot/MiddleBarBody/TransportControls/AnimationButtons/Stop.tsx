import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { ScaleLinear } from 'utils/TP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Stop: FunctionComponent<Props> = () => {
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);

  const dispatch = useDispatch();

  const handleStop = useCallback(() => {
    if (_currentAnimationGroup && _currentAnimationGroup.isStarted) {
      _currentAnimationGroup.goToFrame(_startTimeIndex).stop();
    }

    const scrubber = document.getElementById('scrubber')!;
    const scrubberInput = scrubber?.querySelector('input')!;

    const translateScrubber = (frame: number) => {
      const scaleX = ScaleLinear.getScaleX();
      const nextFrame = Math.floor(frame);
      if (scaleX) {
        scrubber.setAttribute('transform', `translate(${scaleX(nextFrame)}, 0)`);
        scrubberInput.value = `${nextFrame}`;
      }
    };
    translateScrubber(_startTimeIndex);

    // ToDo. visualized 된 데이터가 있는 경우에만 stop 버튼이 동작되도록 조건절을 추가해야 됨
    if (_playState !== 'stop') {
      dispatch(
        animatingControlsActions.clickPlayStateButton({
          playState: 'stop',
          currentTimeIndex: _startTimeIndex,
        }),
      );
    }
  }, [_currentAnimationGroup, _playState, _startTimeIndex, dispatch]);

  return <IconWrapper onClick={handleStop} icon={SvgPath.Stop} hasFrame={false} />;
};

export default Stop;
