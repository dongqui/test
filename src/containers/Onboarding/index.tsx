import LowerBanner from './LowerBanner';

import { useSelector } from 'reducers';

import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Onboarding = () => {
  const isShowedOnboarding = useSelector((state) => state.globalUI.isShowedOnboarding);

  if (!isShowedOnboarding) return null;

  return (
    <div className={cx('onboarding')}>
      <LowerBanner />
      <div id="onboarding-modal-portal" />
    </div>
  );
};

export default Onboarding;
