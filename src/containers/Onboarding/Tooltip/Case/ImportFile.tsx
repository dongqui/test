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
      const { rightTop } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${rightTop.y - 16}px; left:${rightTop.x + 16}px;`;
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
        <Arrow placement="left-start" />
      </StepTemplate>
    </Fragment>
  );
};

export default ImportFile;
