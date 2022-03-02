import { Fragment } from 'react';

import { useSelector } from 'reducers';

import { ApplyMotion, ExportFile, ImportFile, Keyframes, PropertySet, ResetOnboarding, RunOnboarding, VideoMode } from './Tooltip';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

/**
 * 0: 온보딩 시작 단계
 * 1~n: 온보딩 각 단계
 * 999: 온보딩 마지막 단계(n+1값으로 하게 되면 온보딩 단계가 늘어날 때 마다 값을 변경해야 됨. 그래서 static하게 999으로 지정)
 * null: 온보딩 미출력
 * @default null null인 경우 온보딩 미출력
 */
export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 999 | null;

const cx = classNames.bind(styles);

const Onboarding = () => {
  const onboardingStep = useSelector((state) => state.globalUI.onboardingStep);

  const TooltipCase = () => {
    switch (onboardingStep) {
      case 0: {
        return <RunOnboarding />;
      }
      case 1: {
        return <ImportFile />;
      }
      case 2: {
        return <VideoMode />;
      }
      case 3: {
        return <ApplyMotion />;
      }
      case 4: {
        return <PropertySet />;
      }
      case 5: {
        return <Keyframes />;
      }
      case 6: {
        return <ExportFile />;
      }
      case 999: {
        return <ResetOnboarding />;
      }
      default: {
        return null;
      }
    }
  };

  if (onboardingStep === null) {
    return null;
  }

  return (
    <Fragment>
      <div className={cx('tooltip')}>
        <TooltipCase />
      </div>
      <div className={cx('background')} />
    </Fragment>
  );
};

export default Onboarding;
