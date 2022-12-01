import { useEffect, Fragment, useRef } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

import StepTemplate from '../Template/StepTemplate';
import Arrow from 'components/TooltipArrow';

const ImportFile = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = document.getElementById(ONBOARDING_ID.IMPORT_FILE);
    const targetCoordinates = getTargetCoordinates(targetElement);
    if (tooltipRef.current && targetCoordinates) {
      const { leftBottom } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${leftBottom.y}px; left:${leftBottom.x + 16}px;`;
    }
  }, [tooltipRef]);

  return (
    <Fragment>
      <StepTemplate step={1} ref={tooltipRef}>
        <h3>Import files into the library</h3>
        <p>
          Import your <span>model or video file</span> by clicking the button <br />
          or simply drag and drop them in the library.
        </p>
        <Arrow placement="top-start" />
      </StepTemplate>
    </Fragment>
  );
};

export default ImportFile;
