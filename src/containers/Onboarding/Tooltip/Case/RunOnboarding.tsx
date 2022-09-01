import { useEffect, useRef } from 'react';
import StepTemplate from '../Template/StepTemplate';
import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

const RunOnboarding = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tooltipRef.current) {
      const helpButton = document.getElementById(ONBOARDING_ID.HELP_BUTTON);
      const targetCoordinates = getTargetCoordinates(helpButton);
      if (targetCoordinates) {
        tooltipRef.current.style.cssText = `top: ${targetCoordinates.rightBottom.y + 10}px; right: calc(100vw - ${targetCoordinates.rightBottom.x + 6}px);`;
      }
    }
  }, [tooltipRef]);

  return (
    <StepTemplate step={0} ref={tooltipRef}>
      <h3>Are you ready for a quick tour of Plask?</h3>
      <p>
        Walk through <span>Plask&apos;s unique </span> editor and animating <br />
        features.
      </p>
    </StepTemplate>
  );
};

export default RunOnboarding;
