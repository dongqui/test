import { useEffect, useRef } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

import BaseTemplate from '../Template/BaseTemplate';
import Arrow from 'components/TooltipArrow';

const ResetOnboarding = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const helpButton = document.getElementById(ONBOARDING_ID.HELP_BUTTON);
    const targetCoordinates = getTargetCoordinates(helpButton);
    helpButton?.click();

    if (tooltipRef.current && targetCoordinates) {
      const { leftBottom } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${leftBottom.y + 110}px; left:${leftBottom.x - 580}px;`;
    }
  }, [tooltipRef]);

  return (
    <BaseTemplate onboardingStep={999} ref={tooltipRef}>
      <div>
        <h3>Reset Onboarding</h3>
        <p>
          You can watch onboarding <span> again</span> at any time here.
        </p>
        <Arrow placement="right-start" />
      </div>
    </BaseTemplate>
  );
};

export default ResetOnboarding;
