import { useEffect, useState, ReactNode } from 'react';
import ReactDom from 'react-dom';

const OnboardingTooltipPortal = ({ children }: { children: ReactNode }) => {
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const portal = document.getElementById('onboarding-tooltip-portal');
    setPortal(portal);
  }, []);

  return portal && ReactDom.createPortal(children, portal);
};

export default OnboardingTooltipPortal;
