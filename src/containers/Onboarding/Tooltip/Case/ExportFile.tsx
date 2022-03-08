import { useEffect, useRef, Fragment } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';

import StepTemplate from '../Template/StepTemplate';
import Arrow from '../Arrow';

const ExportFile = () => {
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
    const targetElement = document.getElementById(ONBOARDING_ID.EXPORT_FILE);
    const targetCoordinates = getTargetCoordinates(targetElement);
    if (tooltipRef.current && targetCoordinates) {
      const { rightTop } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${rightTop.y - 32}px; left:${rightTop.x + 16}px;`;
    }
  }, [tooltipRef]);

  return (
    <Fragment>
      <StepTemplate step={6} ref={tooltipRef}>
        <h3>File export</h3>
        <p>
          After work is done. <br />
          You can <span>extract files</span> by right-clicking on them.
        </p>
        <Arrow placement="left-start" />
      </StepTemplate>
    </Fragment>
  );
};

export default ExportFile;
