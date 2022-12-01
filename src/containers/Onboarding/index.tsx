import { useEffect, useRef, Fragment } from 'react';
import { useDispatch } from 'react-redux';

import * as commonActions from 'actions/Common/globalUI';
import { useSelector } from 'reducers';

import { ApplyMotion, ExportFile, ImportFile, EditKeyframe, PropertySet, ResetOnboarding, RunOnboarding, VideoMode } from './Tooltip';
import { ONBOARDING_ID } from './id';
import Background from './Background';

/**
 * 0: 온보딩 시작 단계
 * 1~n: 온보딩 각 단계
 * 999: 온보딩 마지막 단계(n+1값으로 하게 되면 온보딩 단계가 늘어날 때 마다 값을 변경해야 됨. 그래서 static하게 999으로 지정)
 * null: 온보딩 미출력
 * @default null null인 경우 온보딩 미출력 함
 */
export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 999 | null;

const Onboarding = () => {
  const dispatch = useDispatch();
  const onboardingStep = useSelector((state) => state.globalUI.onboardingStep);
  const timeoutId = useRef(0);

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
        return <EditKeyframe />;
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

  useEffect(() => {
    if (onboardingStep === 999) {
      timeoutId.current = window.setTimeout(() => {
        document.getElementById(ONBOARDING_ID.HELP_BUTTON)?.click();
        setTimeout(() => dispatch(commonActions.progressOnboarding({ onboardingStep: null })), 4000);
      }, 10);

      return () => {
        clearTimeout(timeoutId.current);
      };
    } else {
      clearTimeout(timeoutId.current);
    }
  }, [onboardingStep, dispatch]);

  return (
    <Fragment>
      <TooltipCase />
      {onboardingStep !== 999 && <Background />}
    </Fragment>
  );
};

export default Onboarding;
