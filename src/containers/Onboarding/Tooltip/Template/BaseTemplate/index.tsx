import { forwardRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import { IconWrapper, SvgPath } from 'components/Icon';
import { OnboardingStep } from 'containers/Onboarding';
import { ONBOARDING_ID } from 'containers/Onboarding/id';
import popupManager from 'utils/PopupManager';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children: React.ReactNode;

  onboardingStep: OnboardingStep;
}

const BaseTemplate = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, onboardingStep } = props;

  const dispatch = useDispatch();

  const handleCloseButtonClick = useCallback(() => {
    localStorage.setItem('onboarding_1', 'onboarding_1');
    if (onboardingStep === 999) {
      dispatch(globalUIActions.progressOnboarding({ onboardingStep: null }));
      document.getElementById(ONBOARDING_ID.HELP_BUTTON)?.click();
      popupManager.next();
    } else {
      dispatch(globalUIActions.progressOnboarding({ onboardingStep: 999 }));
    }
  }, [dispatch, onboardingStep]);

  return (
    <div className={cx('tooltip')} ref={ref}>
      <div className={cx('body')}>{children}</div>
      <IconWrapper className={cx('close')} icon={SvgPath.Close} onClick={handleCloseButtonClick} />
    </div>
  );
});

BaseTemplate.displayName = 'BaseTemplate';

export default BaseTemplate;
