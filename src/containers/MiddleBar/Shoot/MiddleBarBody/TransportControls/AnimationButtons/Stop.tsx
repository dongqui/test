import { FunctionComponent, MutableRefObject, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { ScaleLinear } from 'utils/TP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  requestAnimationFrameId: MutableRefObject<number>;
}

const Stop: FunctionComponent<Props> = (props) => {
  const { requestAnimationFrameId } = props;
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);

  const dispatch = useDispatch();

  const translateScrubber = useCallback(() => {
    const scrubber = document.getElementById('scrubber')!;
    const scrubberInput = scrubber?.querySelector('input')!;
    const scaleX = ScaleLinear.getScaleX();
    scrubber.setAttribute('transform', `translate(${scaleX(_startTimeIndex)}, 0)`);
    scrubberInput.value = `${_startTimeIndex}`;
  }, [_startTimeIndex]);

  const handleStop = useCallback(() => {
    if (_playState !== 'stop') {
      if (_currentAnimationGroup && _currentAnimationGroup.isStarted) {
        _currentAnimationGroup.goToFrame(_startTimeIndex).stop();
      }
      translateScrubber();
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'stop', currentTimeIndex: _startTimeIndex }));
      window.cancelAnimationFrame(requestAnimationFrameId.current);
    }
  }, [_currentAnimationGroup, _playState, _startTimeIndex, requestAnimationFrameId, dispatch, translateScrubber]);

  return <IconWrapper onClick={handleStop} icon={SvgPath.Stop} hasFrame={false} />;
};

export default Stop;
