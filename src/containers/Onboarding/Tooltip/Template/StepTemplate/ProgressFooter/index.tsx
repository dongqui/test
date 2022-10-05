import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import { OnboardingStep } from 'containers/Onboarding';
import { SubButton, PostiveButton } from '../Buttons';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  step: ProgressStep;
}

type ProgressStep = Exclude<OnboardingStep, 0 | 999 | null>;

type LearnMore = { [key in ProgressStep]: string };

const LEARN_MORE_HREF: LearnMore = {
  1: 'https://knowledge.plask.ai/en/importing-a-video',
  2: 'https://knowledge.plask.ai/en/how-can-you-use-plask-to-record-video',
  3: 'https://knowledge.plask.ai/en/how-do-you-import-your-motion-into-your-preferred-model-in-plask',
  4: 'https://knowledge.plask.ai/en/retargeting',
  5: 'https://knowledge.plask.ai/en/keyframe-editing',
  6: 'https://knowledge.plask.ai/en/export-a-file',
};

const LAST_STEP = 6;

const ProgressFooter: FunctionComponent<React.PropsWithChildren<Props>> = (props) => {
  const { step } = props;

  const dispatch = useDispatch();

  // Next 버튼 클릭
  const handleClickNextButton = () => {
    const nextStep = (step + 1) as ProgressStep;
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: nextStep }));
  };

  // Done 버튼 클릭
  const handleClickDoneButton = () => {
    const localStorage = window.localStorage;
    localStorage.setItem('onboarding_1', 'onboarding_1');
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: 999 }));
  };

  return (
    <div className={cx('progress-footer')}>
      <span className={cx('step')}>
        {step} of {LAST_STEP}
      </span>
      <div className={cx('buttons')}>
        <SubButton>
          <a href={LEARN_MORE_HREF[step]} target="_blank" rel="noreferrer" className={cx('learn-more')}>
            Learn more
          </a>
        </SubButton>
        {step !== LAST_STEP ? <PostiveButton onClick={handleClickNextButton}>Next</PostiveButton> : <PostiveButton onClick={handleClickDoneButton}>Done</PostiveButton>}
      </div>
    </div>
  );
};

export default ProgressFooter;
