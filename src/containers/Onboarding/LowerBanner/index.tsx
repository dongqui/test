import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import cookie from 'react-cookies';

import * as commonActions from 'actions/Common/globalUI';
import { TextButton } from 'components/Button';

import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const LowerBanner = () => {
  const dispatch = useDispatch();

  // 온보딩 쿠키 삽입
  const saveOnboardingCookie = useCallback(() => {
    const expires = new Date();
    expires.setFullYear(new Date().getFullYear() + 2);
    cookie.save('onboarding_1', 'onboarding_1', { path: '/', expires });
  }, []);

  // Done 버튼 클릭
  const handleDoneButtonClick = useCallback(() => {
    dispatch(commonActions.closeOnboarding());
    saveOnboardingCookie();
  }, [dispatch, saveOnboardingCookie]);

  return (
    <div className={cx('lower-banner')}>
      <p>Have you done with the quick guide?</p>
      <div className={cx('button-wrapper')}>
        <TextButton className={cx('learn-more')}>
          <a href="https://plasticmask.notion.site/User-guide-ac4bba1b75384c309e7a24e6542454ba" target="_blank" rel="noreferrer">
            Learn More
          </a>
        </TextButton>
        <TextButton className={cx('done')} onClick={handleDoneButtonClick} dataCy="onboarding-done">
          Done
        </TextButton>
      </div>
    </div>
  );
};

export default LowerBanner;
