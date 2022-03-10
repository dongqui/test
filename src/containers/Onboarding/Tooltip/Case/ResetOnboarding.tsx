import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import * as commonActions from 'actions/Common/globalUI';
import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { IconWrapper, SvgPath } from 'components/Icon';
import { getTargetCoordinates } from 'utils/common';

import BaseTemplate from '../Template/BaseTemplate';
import Arrow from '../Arrow';

import classNames from 'classnames/bind';
import styles from './ResetOnboarding.module.scss';

const cx = classNames.bind(styles);

const ResetOnboarding = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const closeResetOnboarding = () => {
    dispatch(commonActions.progressOnboarding({ onboardingStep: null }));
  };

  useEffect(() => {
    const helpButton = document.getElementById(ONBOARDING_ID.HELP_BUTTON);
    const targetCoordinates = getTargetCoordinates(helpButton);
    helpButton?.click();
    if (tooltipRef.current && targetCoordinates) {
      const { rightBottom } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${rightBottom.y}px; left:${rightBottom.x + 100}px;`;
    }
  }, [tooltipRef]);

  return (
    <BaseTemplate ref={tooltipRef}>
      <div>
        <h3>Reset Onboarding</h3>
        <p>You can watch onboarding again at any time here.</p>
        <Arrow placement="left-start" />
        <IconWrapper className={cx('close')} icon={SvgPath.Close} onClick={closeResetOnboarding} />
      </div>
    </BaseTemplate>
  );
};

export default ResetOnboarding;
