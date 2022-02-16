import { useEffect, useState } from 'react';

import { useSelector } from 'reducers';

import LowerBanner from './LowerBanner';

import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Onboarding = () => {
  const isShowedOnboarding = useSelector((state) => state.globalUI.isShowedOnboarding);
  const [isShowedLowerBanner, setIsShowedLowerBanner] = useState(false);

  // 3초 뒤에 하단 배너 출력
  useEffect(() => {
    if (isShowedOnboarding) {
      setTimeout(() => {
        setIsShowedLowerBanner(true);
      }, 1000);
    } else {
      setIsShowedLowerBanner(false);
    }
  }, [isShowedOnboarding]);

  if (!isShowedOnboarding) {
    return null;
  }

  return (
    <div className={cx('onboarding')}>
      {isShowedLowerBanner && <LowerBanner />}
      <div id="onboarding-tooltip-portal" />
    </div>
  );
};

export default Onboarding;
