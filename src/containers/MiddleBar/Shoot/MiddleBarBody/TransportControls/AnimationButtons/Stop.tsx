import { FunctionComponent, MutableRefObject, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { ScaleLinear, TimeIndex } from 'utils/TP';

interface Props {
  requestAnimationFrameId: MutableRefObject<number>;
}

const Stop: FunctionComponent<Props> = (props) => {
  const { requestAnimationFrameId } = props;

  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);

  const dispatch = useDispatch();

  const translateScrubber = useCallback(() => {
    const scrubber = document.getElementById('scrubber');
    const scrubberInput = scrubber?.querySelector('input');
    const scaleX = ScaleLinear.getScaleX();
    if (scrubber && scrubberInput) {
      scrubber.setAttribute('transform', `translate(${scaleX(_startTimeIndex)}, 0)`);
      scrubberInput.value = `${_startTimeIndex}`;
    }
  }, [_startTimeIndex]);

  const handleStopButtonClick = useCallback(() => {
    if (_playState !== 'stop') {
      if (_currentAnimationGroup && _currentAnimationGroup.isStarted) {
        _currentAnimationGroup.goToFrame(_startTimeIndex).stop();
      }
      translateScrubber();
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'stop', currentTimeIndex: _startTimeIndex }));
      window.cancelAnimationFrame(requestAnimationFrameId.current);
    }
  }, [_currentAnimationGroup, _playState, _startTimeIndex, requestAnimationFrameId, dispatch, translateScrubber]);

  // 재생 도중에 model이 변경되거나 clear 될 경우, button 상태를 stop으로 전환
  useEffect(() => {
    translateScrubber();
    dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'stop', currentTimeIndex: TimeIndex.getStartTimeIndex() }));
    window.cancelAnimationFrame(requestAnimationFrameId.current);
  }, [_visualizedAssetIds, requestAnimationFrameId, dispatch, translateScrubber]);

  return <IconWrapper id="animationStopButton" onClick={handleStopButtonClick} icon={SvgPath.Stop} hasFrame={false} />;
};

export default Stop;
