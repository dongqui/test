import { Dispatch } from 'redux';

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
    setTimeout(() => {
      if (this.dispatch) {
        this.dispatch(commonActions.progressOnboarding({ onboardingStep: 0 }));
      }
    }, 2000);
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
          },
        }),
      );
    }
  }

  showVmOnboarding() {
    if (this.dispatch) {
      const isExpierencedUser = this.isOnboardingDone;
    }
  }
}

export default new PopupManager();
