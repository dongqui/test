import { Dispatch } from 'redux';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { IK_CONTROLLER_EL_ID } from 'constants/';
import { getTargetCoordinates } from 'utils/common';
import * as commonActions from 'actions/Common/globalUI';

// Ref: https://www.figma.com/file/cjE07P97OvCTwOIornDmbK/Plask-Master-Design?node-id=2821%3A18043
class PopupManager {
  isOnboardingDone: boolean;
  isNewFeatureModalDone: boolean;
  isVMOnboardingDone: boolean;
  isIKOnboardingDone: boolean;

  proceedGenerator: Generator<void> | null;
  dispatch: Dispatch | null;

  constructor() {
    this.isOnboardingDone = !!localStorage.getItem('onboarding_1');
    this.isNewFeatureModalDone = localStorage.getItem('notification') === '1';
    this.isVMOnboardingDone = !!localStorage.getItem('onboarding_2');
    this.isIKOnboardingDone = !!localStorage.getItem('onboarding_3');

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
    yield this.showEmergencyNotification();

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
        commonActions.openModal(
          'NotificationModal',
          {
            message: 'Check out the newly updated features.',
            title: 'New Feature!',
            closeCallback: () => {
              this.next();
              // key value change rule: '1' -> '2'
              localStorage.setItem('notification', '1');
            },
          },
          'onboarding',
        ),
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
            'onboarding',
            false,
          ),
        );
      }
    }
  }

  showIKOnboarding() {
    if (this.isIKOnboardingDone) {
      return;
    }

    setTimeout(() => {
      const targetElement = document.getElementById(IK_CONTROLLER_EL_ID);
      const targetCoordinates = getTargetCoordinates(targetElement);
      if (targetCoordinates?.leftTop && this.dispatch) {
        this.dispatch(
          commonActions.openModal(
            'OnBoardingModal',
            {
              title: 'Set up IK',
              message: 'Able to use <b>IK controller</b> For editing your animation.',
              learnMoreLink: 'https://knowledge.plask.ai/how-can-you-set-up-an-ik-controller-on-your-3d-model',
              postion: {
                left: `${targetCoordinates?.leftTop?.x - 412}px`,
                top: `${targetCoordinates?.leftTop?.y}px`,
              },
              tooltipArrowPlacement: 'right-start',
              onCloseCallback: () => {
                this.doneIKOnboarding();
              },
            },
            'onboarding',
            false,
          ),
        );
      }
    }, 1000);
  }

  doneIKOnboarding() {
    localStorage.setItem('onboarding_3', 'onboarding_3');
    this.isIKOnboardingDone = true;
    this.closeOnboarding();
  }

  closeOnboarding() {
    if (this.dispatch) {
      this.dispatch(commonActions.closeModal('onboarding'));
    }
  }

  async showEmergencyNotification() {
    if (this.dispatch) {
      this.dispatch(
        commonActions.openModal('EmergencyModal', {
          message: `<p>
          Our motion capture server is down due to technical difficulties.
          <br />
          You can only use the animation editing feature at the moment. <br />
          Sorry for the inconvenience.
        </p>`,
          title: 'Emergency Notice',
          closeCallback: () => {
            this.next();
          },
        }),
      );
    }
  }
}

export default new PopupManager();
