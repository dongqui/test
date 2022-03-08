import { useEffect, useRef } from 'react';
import StepTemplate from '../Template/StepTemplate';

const RunOnboarding = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.cssText = `bottom:24px; right:24px;`;
    }
  }, [tooltipRef]);

  return (
    <StepTemplate step={0} ref={tooltipRef}>
      <h3>Take a quick tour of plask?</h3>
      <p>
        Walk through <span>Plask&apos;s unique </span> editor and animating features.
      </p>
    </StepTemplate>
  );
};

export default RunOnboarding;
