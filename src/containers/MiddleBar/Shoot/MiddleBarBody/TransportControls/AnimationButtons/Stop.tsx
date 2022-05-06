import { FunctionComponent, MutableRefObject, useCallback, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { ScaleLinear, TimeIndex } from 'utils/TP';
import plaskEngine from '3d/PlaskEngine';

interface Props {
  requestAnimationFrameId: MutableRefObject<number>;
}

const Stop: FunctionComponent<Props> = (props) => {
  const { requestAnimationFrameId } = props;

  const _playState = useSelector((state) => state.animatingControls.playState);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);

  const dispatch = useDispatch();

  const translateScrubber = useCallback(() => {
    const scrubber = document.getElementById('scrubber');
    const scrubberInput = scrubber?.querySelector('input');
    const scaleX = ScaleLinear.getScaleX();
    if (scrubber && scrubberInput) {
      scrubber.setAttribute('transform', `translate(${scaleX(_startTimeIndex) - 3}, 0)`);
      scrubberInput.value = `${_startTimeIndex}`;
    }
  }, [_startTimeIndex]);

  const handleStopButtonClick = useCallback(() => {
    if (_playState !== 'stop') {
      plaskEngine.animationModule.stopCurrentAnimationGroup();
      translateScrubber();
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'stop', currentTimeIndex: _startTimeIndex }));
      window.cancelAnimationFrame(requestAnimationFrameId.current);
    }
  }, [_playState, translateScrubber, dispatch, _startTimeIndex, requestAnimationFrameId]);

  return <IconWrapper id="animationStopButton" onClick={handleStopButtonClick} icon={SvgPath.Stop} hasFrame={false} />;
};

export default Stop;
