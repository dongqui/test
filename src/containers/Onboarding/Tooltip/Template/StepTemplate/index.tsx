import React, { forwardRef, useEffect } from 'react';
import TagManager from 'react-gtm-module';

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
  useEffect(() => {
    if (step >= 1 && step <= 6) {
      let id = '';
      switch (step) {
        case 1:
          id = 'import';
          break;
        case 2:
          id = 'shift_vm';
          break;
        case 3:
          id = 'apply_mocap';
          break;
        case 4:
          id = 'edit_cp';
          break;
        case 5:
          id = 'edit_keyframe';
          break;
        case 6:
          id = 'export';
          break;
      }

      TagManager.dataLayer({
        dataLayer: {
          event: 'unlock_achievement',
          achievement_id: id,
        },
      });
    }
  }, [step]);

  return (
    <BaseTemplate onboardingStep={step} ref={ref}>
      {children}
      {step === 0 ? <StartFooter /> : <ProgressFooter step={step} />}
    </BaseTemplate>
  );
});

StepTemplate.displayName = 'StepTemplate';

export default StepTemplate;
