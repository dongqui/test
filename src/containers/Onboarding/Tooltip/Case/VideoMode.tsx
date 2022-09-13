import { useEffect, useRef, Fragment } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

import StepTemplate from '../Template/StepTemplate';
import Arrow from 'components/TooltipArrow';

const VideoMode = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = document.getElementById(ONBOARDING_ID.VIDEO_MODE);
    const targetCoordinates = getTargetCoordinates(targetElement);
    if (tooltipRef.current && targetCoordinates) {
      const { leftBottom } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${leftBottom.y + 12}px; left:${leftBottom.x}px; transform: translateX(calc(-50% + 64px + 24px))`;
    }
  }, [tooltipRef]);

  return (
    <Fragment>
      <StepTemplate step={2} ref={tooltipRef}>
        <h3>Shift to the video mode</h3>
        <p>
          Directly record a video with your webcam to <span>extract</span> <br />
          <span>the MoCap data.</span>
        </p>
        <Arrow placement="top-middle" />
      </StepTemplate>
    </Fragment>
  );
};

export default VideoMode;
