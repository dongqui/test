import { useDispatch } from 'react-redux';
import cookie from 'react-cookies';

import * as globalUIActions from 'actions/Common/globalUI';
import { FilledButton } from 'components/Button';

const DoneButton = () => {
  const dispatch = useDispatch();

  // 온보딩 쿠키 삽입
  const saveOnboardingCookie = () => {
    const expires = new Date();
    expires.setFullYear(new Date().getFullYear() + 2);
    cookie.save('onboarding_1', 'onboarding_1', { path: '/', expires });
  };

  const handleDoneButtonClick = () => {
    saveOnboardingCookie();
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: 999 }));
  };

  return <FilledButton onClick={handleDoneButtonClick}>Done</FilledButton>;
};

export default DoneButton;
