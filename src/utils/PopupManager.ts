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
    this.isNewFeatureModalDone = !!localStorage.getItem('notification');
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
          message:
            'You can save your work on Plask as of June 9th, 2022. See a list of savable items <a href="https://knowledge.plask.ai/en/scene_save" target="_blank" rel="noopener noreferrer">here.</a>',
          title: 'New Feature! Auto Save',
          closeCallback: () => {
            this.next();
            localStorage.setItem('notification', 'true');
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
              title: isExpierencedUser ? 'Import a video!' : 'Click to extract motion!',
              message: isExpierencedUser ? 'You can start importing now.' : 'Import or record a video.',
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
