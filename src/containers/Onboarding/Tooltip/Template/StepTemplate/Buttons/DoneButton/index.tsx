import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import { FilledButton } from 'components/Button';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const DoneButton = () => {
  const dispatch = useDispatch();

  // 온보딩 로컬 스토리지 삽입
  const setOnboardingLocalStorage = () => {
    const localStorage = window.localStorage;
    localStorage.setItem('onboarding_1', 'onboarding_1');
  };

  const handleDoneButtonClick = () => {
    setOnboardingLocalStorage();
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: 999 }));
  };

  return (
    <FilledButton onClick={handleDoneButtonClick} className={cx('done')}>
      Done
    </FilledButton>
  );
};

export default DoneButton;
