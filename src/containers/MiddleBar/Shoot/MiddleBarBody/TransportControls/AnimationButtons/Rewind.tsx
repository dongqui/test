import { useCallback, FunctionComponent, MutableRefObject } from 'react';
import { useDispatch } from 'react-redux';

import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { PlayDirection } from 'types/RP';
import { ScaleLinear, TimeIndex } from 'utils/TP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  requestAnimationFrameId: MutableRefObject<number>;
}

const Rewind: FunctionComponent<Props> = (props) => {
  const { requestAnimationFrameId } = props;
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);

  const dispatch = useDispatch();

  const clampNextFrame = useCallback(() => {
    const nextFrame = TimeIndex.getCurrentTimeIndex() + PlayDirection.backward * _playSpeed;
    return nextFrame < _startTimeIndex ? _endTimeIndex : nextFrame;
  }, [_endTimeIndex, _playSpeed, _startTimeIndex]);

  const translateScrubber = useCallback(() => {
    const scrubber = document.getElementById('scrubber');
    const scrubberInput = scrubber?.querySelector('input');
    const scaleX = ScaleLinear.getScaleX();
    if (scrubber && scrubberInput && _currentAnimationGroup) {
      const nextFrame = _currentAnimationGroup.animatables.length !== 0 ? _currentAnimationGroup.animatables[0].masterFrame : clampNextFrame();
      const digitedNextFrame = Math.ceil(nextFrame);
      scrubber.setAttribute('transform', `translate(${scaleX(digitedNextFrame)}, 0)`);
      scrubberInput.value = `${digitedNextFrame}`;
      TimeIndex.setCurrentTimeIndex(nextFrame);
      requestAnimationFrameId.current = window.requestAnimationFrame(translateScrubber);
    }
  }, [_currentAnimationGroup, requestAnimationFrameId, clampNextFrame]);

  const handleRewind = useCallback(() => {
    if (_currentAnimationGroup) {
      if (_currentAnimationGroup.isPlaying && _currentAnimationGroup.speedRatio >= 0) {
        // 재생 중인 상태
        _currentAnimationGroup.speedRatio = -1 * _playSpeed;
      } else if (_currentAnimationGroup.isStarted) {
        // 재생 중은 아니지만 시작은 한 상태
        _currentAnimationGroup.speedRatio = -1 * _playSpeed;
        _currentAnimationGroup.play();
      } else {
        // 정지 혹은 막 생성된 상태
        _currentAnimationGroup.start(true, -1 * _playSpeed, _startTimeIndex, _endTimeIndex);
      }
      window.cancelAnimationFrame(requestAnimationFrameId.current);
      requestAnimationFrameId.current = window.requestAnimationFrame(translateScrubber);
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'play', playDirection: PlayDirection.backward }));
    }
  }, [_currentAnimationGroup, _endTimeIndex, _playSpeed, _startTimeIndex, requestAnimationFrameId, dispatch, translateScrubber]);

  return <IconWrapper onClick={handleRewind} icon={SvgPath.RewindArrow} hasFrame={false} />;
};

export default Rewind;
