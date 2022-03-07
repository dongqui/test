import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import { FilledButton } from 'components/Button';

const DoneButton = () => {
  const dispatch = useDispatch();

  // 온보딩 쿠키 삽입
  const setOnboardingLocalStorage = () => {
    const localStorage = window.localStorage;
    localStorage.setItem('onboarding_1', 'onboarding_1');
  };

  const handleDoneButtonClick = () => {
    setOnboardingLocalStorage();
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: 999 }));
  };

  return <FilledButton onClick={handleDoneButtonClick}>Done</FilledButton>;
};

export default DoneButton;
