import React, { forwardRef } from 'react';

import { OnboardingStep } from 'containers/Onboarding';

import BaseTemplate from '../BaseTemplate';
import StartFooter from './StartFooter';
import ProgressFooter from './ProgressFooter';

interface StepTemplateProps {
  step: Exclude<OnboardingStep, 999 | null>; // 0~6

  children: React.ReactNode;
}

const StepTemplate = forwardRef<HTMLDivElement, StepTemplateProps>((props, ref) => {
  const { children, step } = props;

  return (
    <BaseTemplate onboardingStep={step} ref={ref}>
      {children}
      {step === 0 ? <StartFooter /> : <ProgressFooter step={step} />}
    </BaseTemplate>
  );
});

StepTemplate.displayName = 'StepTemplate';

export default StepTemplate;
