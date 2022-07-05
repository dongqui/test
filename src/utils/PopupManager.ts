import { Dispatch } from 'redux';

import * as commonActions from 'actions/Common/globalUI';

// REF: https://www.figma.com/file/cjE07P97OvCTwOIornDmbK/Plask-Master-Design?node-id=2821%3A18043
class PopupManager {
  isOnboardingDone: boolean;
  isNewFeatureModalDone: boolean;

  constructor() {
    this.isOnboardingDone = !!localStorage.getItem('onboarding_1');
    this.isNewFeatureModalDone = !!localStorage.getItem('notification');
  }

  *proceedAnimationpagePopup(dispatch: Dispatch) {
    yield this.showNewFeatureModal(dispatch);
    yield this.showOnboalding(dispatch);
    yield this.showVmOnboarding(dispatch);
  }

  showOnboalding(dispatch: Dispatch) {
    dispatch(commonActions.progressOnboarding({ onboardingStep: 0 }));
  }

  showNewFeatureModal(dispatch: Dispatch) {
    dispatch(
      commonActions.openModal('NotificationModal', {
        message:
          'You can save your work on Plask as of June 9th, 2022. See a list of savable items <a href="https://knowledge.plask.ai/en/scene_save" target="_blank" rel="noopener noreferrer">here.</a>',
        title: 'New Feature! Auto Save',
        closeCallback: () => {
          if (!localStorage.getItem('onboarding_1')) {
            dispatch(commonActions.progressOnboarding({ onboardingStep: 0 }));
          }
          localStorage.setItem('notification', 'true');
        },
      }),
    );
  }

  showVmOnboarding(dispatch: Dispatch) {}
}

export default new PopupManager();
