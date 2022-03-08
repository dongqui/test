import { useEffect, Fragment, useRef } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';

import StepTemplate from '../Template/StepTemplate';
import Arrow from '../Arrow';

const ImportFile = () => {
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
          Import your <span>modal or video files</span> by clicking the button or <br />
          simply drag and drop them in the library.
        </p>
        <Arrow placement="left-start" />
      </StepTemplate>
    </Fragment>
  );
};

export default ImportFile;
