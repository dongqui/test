import { useEffect, useRef, Fragment } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

import StepTemplate from '../Template/StepTemplate';
import Arrow from '../Arrow';

const VideoMode = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = document.getElementById(ONBOARDING_ID.VIDEO_MODE);
    const targetCoordinates = getTargetCoordinates(targetElement);
    if (tooltipRef.current && targetCoordinates) {
      const { leftBottom } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${leftBottom.y + 16}px; right:${8}px;`;
    }
  }, [tooltipRef]);

  return (
    <Fragment>
      <StepTemplate step={2} ref={tooltipRef}>
        <h3>Shift to the video mode.</h3>
        <p>
          Directly records a video with your webcam to <br />
          <span>extract the motion data.</span>
        </p>
        <Arrow placement="top-end" />
      </StepTemplate>
    </Fragment>
  );
};

export default VideoMode;
