import { useEffect, useRef, Fragment } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';

import StepTemplate from '../Template/StepTemplate';
import Arrow from '../Arrow';

const VideoMode = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getTargetCoordinates = (targetElement: HTMLElement | null) => {
    if (targetElement) {
      const { x, y, width, height } = targetElement.getBoundingClientRect();
      const leftTop = { x, y };
      const rightTop = { x: x + width, y };
      const leftBottom = { x, y: y + height };
      const rightBottom = { x: x + width, y: y + height };
      return { leftTop, rightTop, leftBottom, rightBottom };
    }
  };

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
