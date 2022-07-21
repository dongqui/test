import { Dispatch } from 'redux';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';
import * as commonActions from 'actions/Common/globalUI';

// Ref: https://www.figma.com/file/cjE07P97OvCTwOIornDmbK/Plask-Master-Design?node-id=2821%3A18043
class PopupManager {
  isOnboardingDone: boolean;
  isNewFeatureModalDone: boolean;
  isVMOnboardingDone: boolean;
  proceedGenerator: Generator<void> | null;
  dispatch: Dispatch | null;

  constructor() {
    this.isOnboardingDone = !!localStorage.getItem('onboarding_1');
    this.isNewFeatureModalDone = localStorage.getItem('notification') === '1';
    this.isVMOnboardingDone = !!localStorage.getItem('onboarding_2');

    this.proceedGenerator = null;
    this.dispatch = null;
  }

  init(dispatch: Dispatch) {
    this.proceedGenerator = this.proceedAnimationpagePopup();
    this.dispatch = dispatch;
  }

  next() {
    this.proceedGenerator?.next();
  }

  *proceedAnimationpagePopup() {
    if (!this.isNewFeatureModalDone) {
      yield this.showNewFeatureModal();
    }
    if (!this.isOnboardingDone) {
      yield this.showOnboalding();
    }
    if (!this.isVMOnboardingDone) {
      yield this.showVmOnboarding();
    }
  }

  showOnboalding() {
    if (this.isNewFeatureModalDone) {
      setTimeout(() => {
        if (this.dispatch) {
          this.dispatch(commonActions.progressOnboarding({ onboardingStep: 0 }));
        }
      }, 2000);
    } else {
      if (this.dispatch) {
        this.dispatch(commonActions.progressOnboarding({ onboardingStep: 0 }));
      }
    }
  }

  showNewFeatureModal() {
    if (this.dispatch) {
      this.dispatch(
        commonActions.openModal('NotificationModal', {
          message: 'Check out the newly updated features.',
          title: 'New Feature!',
          closeCallback: () => {
            this.next();
            // key value change rule: '1' -> '2'
            localStorage.setItem('notification', '1');
          },
        }),
      );
    }
  }

  showVmOnboarding() {
    if (this.dispatch) {
      const isExpierencedUser = this.isOnboardingDone;
      const targetElement = document.getElementById(ONBOARDING_ID.VIDEO_MODE);
      const targetCoordinates = getTargetCoordinates(targetElement);
      if (targetCoordinates?.rightBottom) {
        this.dispatch(
          commonActions.openModal(
            'GuideModal',
            {
              title: isExpierencedUser ? 'Try new feature in here!' : 'Click to extract motion!',
              message: isExpierencedUser
                ? 'You can extract <span>more than one person’s</span> motion from the video.'
                : 'Extract <span>one or more than one person’s</span> motion from video that import or record.',
              postion: {
                right: '12px',
                top: `${targetCoordinates?.rightBottom?.y + 8}px`,
              },
              onConfirm: () => {
                localStorage.setItem('onboarding_2', 'onboarding_2');
              },
              tooltipArrowPlacement: 'top-end',
            },
            '',
            false,
          ),
        );
      }
    }
  }
}

export default new PopupManager();
