import { useEffect, useRef } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';

import StepTemplate from '../Template/StepTemplate';
import Arrow from '../Arrow';

const EditKeyframe = () => {
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
    const targetElement = document.getElementById(ONBOARDING_ID.EDIT_KEYFRAME);
    const targetCoordinates = getTargetCoordinates(targetElement);
    if (tooltipRef.current && targetCoordinates) {
      const { rightTop } = targetCoordinates;
      tooltipRef.current.style.cssText = `bottom:${window.innerHeight - rightTop.y + 32}px; left:${rightTop.x - 16}px;`;
    }
  }, [tooltipRef]);

  return (
    <StepTemplate step={5} ref={tooltipRef}>
      <h3>Edit Keyframe</h3>
      <p>
        Apply the motion extracted from the video to the character <br />
        <span>keyframes in detail.</span>
      </p>
      <Arrow placement="bottom-start" />
    </StepTemplate>
  );
};

export default EditKeyframe;
