import React, { forwardRef, Fragment, FunctionComponent } from 'react';

import { OnboardingStep } from 'containers/Onboarding';

import BaseTemplate from '../BaseTemplate';
import { CancelButton, DoneButton, NextButton } from './Buttons';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  step: Exclude<OnboardingStep, 999 | null>;
}

const LAST_STEP = 6;

const StartTemplate = () => {
  return (
    <div className={cx('start-template')}>
      <div className={cx('buttons')}>
        <Fragment>
          <CancelButton text="No thanks" />
          <NextButton step={0} text="Show me around" />
        </Fragment>
      </div>
    </div>
  );
};

const ProgressTemplate: FunctionComponent<Props> = (props) => {
  const { step } = props;

  return (
    <div className={cx('progress-template')}>
      <span className={cx('step')}>
        {step} of {LAST_STEP}
      </span>
      <div className={cx('buttons')}>
        {step !== LAST_STEP ? (
          <Fragment>
            <CancelButton text="Cancel" />
            <NextButton step={step} text="Next" />
          </Fragment>
        ) : (
          <DoneButton />
        )}
      </div>
    </div>
  );
};

const StepTemplate = forwardRef<HTMLDivElement, Props & { children: React.ReactNode }>((props, ref) => {
  const { children, step } = props;

  return (
    <BaseTemplate ref={ref}>
      {children}
      {step === 0 ? <StartTemplate /> : <ProgressTemplate step={step} />}
    </BaseTemplate>
  );
});

StepTemplate.displayName = 'StepTemplate';

export default StepTemplate;
