import { Fragment, FunctionComponent } from 'react';

import { OnboardingStep } from 'containers/Onboarding';

import BaseTemplate from '../BaseTemplate';
import CancelButton from './Buttons/CancelButton';
import DoneButton from './Buttons/DoneButton';
import NextButton from './Buttons/NextButton';

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
          <CancelButton text="No Thanks" />
          <NextButton step={0} text="Show Me Around" />
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

const StepTemplate: FunctionComponent<Props> = (props) => {
  const { children, step } = props;

  return (
    <BaseTemplate>
      {children}
      {step === 0 ? <StartTemplate /> : <ProgressTemplate step={step} />}
    </BaseTemplate>
  );
};

export default StepTemplate;
