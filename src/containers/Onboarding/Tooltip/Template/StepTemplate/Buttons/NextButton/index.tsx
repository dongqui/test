import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import { FilledButton } from 'components/Button';
import { OnboardingStep } from 'containers/Onboarding';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  step: Extract<OnboardingStep, 0 | 1 | 2 | 3 | 4 | 5>;

  text: string;
}

const NextButton: FunctionComponent<Props> = (props) => {
  const { step, text } = props;

  const dispatch = useDispatch();

  const handleNextButtonClick = () => {
    const nextStep = (step + 1) as OnboardingStep;
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: nextStep }));
  };

  return (
    <FilledButton onClick={handleNextButtonClick} className={cx('next')}>
      {text}
    </FilledButton>
  );
};

export default NextButton;
