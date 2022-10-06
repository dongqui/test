import { useDispatch } from 'react-redux';
import TagManager from 'react-gtm-module';

import * as globalUIActions from 'actions/Common/globalUI';
import { SubButton, PostiveButton } from '../Buttons';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const StartFooter = () => {
  const dispatch = useDispatch();

  // 온보딩 로컬 스토리지 삽입
  const setOnboardingLocalStorage = () => {
    const localStorage = window.localStorage;
    localStorage.setItem('onboarding_1', 'onboarding_1');
  };

  // No thanks 버튼 클릭
  const handleNoThanksButtonClick = () => {
    setOnboardingLocalStorage();
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: 999 }));
  };

  // Show me around 버튼 클릭
  const handleShowMeAroundButtonClick = () => {
    TagManager.dataLayer({
      dataLayer: {
        event: 'tutorial_begin',
      },
    });
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: 1 }));
  };

  return (
    <div className={cx('start-footer')}>
      <div className={cx('buttons')}>
        <SubButton onClick={handleNoThanksButtonClick}>No thanks</SubButton>
        <PostiveButton onClick={handleShowMeAroundButtonClick}>Show me around</PostiveButton>
      </div>
    </div>
  );
};

export default StartFooter;
