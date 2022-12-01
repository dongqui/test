import { useEffect, useRef, Fragment } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

import StepTemplate from '../Template/StepTemplate';
import Arrow from 'components/TooltipArrow';

const ExportFile = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = document.getElementById(ONBOARDING_ID.EXPORT_FILE);
    const targetCoordinates = getTargetCoordinates(targetElement);
    if (tooltipRef.current && targetCoordinates) {
      const { leftBottom } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${leftBottom.y}px; left:${leftBottom.x + 16}px;`;
    }
  }, [tooltipRef]);

  return (
    <Fragment>
      <StepTemplate step={6} ref={tooltipRef}>
        <h3>File export</h3>
        <p>
          When you have completed your work, you can <br />
          <span>extract files</span> by clicking this button.
        </p>
        <Arrow placement="top-start" />
      </StepTemplate>
    </Fragment>
  );
};

export default ExportFile;
