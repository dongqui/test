import { useEffect, useRef } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

import StepTemplate from '../Template/StepTemplate';
import Arrow from '../Arrow';

const PropertySet = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = document.getElementById(ONBOARDING_ID.PROPERTY_SET);
    const targetCoordinates = getTargetCoordinates(targetElement);
    if (tooltipRef.current && targetCoordinates) {
      const { leftTop } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${leftTop.y - 16}px; right:${window.innerWidth - leftTop.x + 32}px;`;
    }
  }, [tooltipRef]);

  return (
    <StepTemplate step={4} ref={tooltipRef}>
      <h3>Animation and retarget set</h3>
      <p>
        You can edit the detailed <span>settings of the model.</span>
      </p>
      <Arrow placement="right-start" />
    </StepTemplate>
  );
};

export default PropertySet;
