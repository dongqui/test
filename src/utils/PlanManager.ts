import { Dispatch } from 'redux';

import { RootState } from 'reducers';
import * as globalUIActions from 'actions/Common/globalUI';
import { dateFormat } from 'utils/common';

type User = RootState['user'];

class PlanManager {
  dispatch: Dispatch | null;

  constructor() {
    this.dispatch = null;
  }

  init(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  isStorageExceeded(user: User, addSize: number = 0) {
    return (user.storage?.limitSize || 0) <= (user.storage?.usageSize || 0) + addSize;
  }

  calculateCreditFromVideoFrames(frames: number) {
    // ----------------------------------------- TODO: calculate credit -----------------------------------------

    return frames / 30;
  }

  remainingCredits(user: User, frames: number) {
    return (user.credits?.remaining || 0) - this.calculateCreditFromVideoFrames(frames);
  }

  isCreditExceeded(user: User, frames: number) {
    const neededCredts = this.calculateCreditFromVideoFrames(frames);

    return (user.credits?.remaining || 0) < neededCredts;
  }

  openStorageExceededModal(user: User) {
    if (!this.dispatch) {
      return;
    }

    if (user.planType === 'freemium') {
      this.dispatch(
        globalUIActions.openModal(
          'ConfirmModal',
          {
            title: 'Need more storage?',
            message: 'Your 1 GB of free storage is full. You won’t be able to upload new files. To keep using Plask, you can get more storage with a Mocap Pro plan.',
            confirmText: 'Upgrade',
            onConfirm: () => {
              this.dispatch && this.dispatch(globalUIActions.openModal('UpgradePlanModal', { hadFreeTrial: user.hadFreeTrial }));
            },
            confirmButtonColor: 'negative',
            cancelText: 'Learn more',
            onCancel: () => {
              window.open('https://www.naver.com', '_blank', 'noopener');
            },
          },
          'upgrade',
          false,
        ),
      );
    } else {
      this.dispatch(
        globalUIActions.openModal(
          'AlertModal',
          {
            title: 'Out of storage',
            message: 'Your storage is full. You won’t be able to upload new files. You can clear space in your library and free up storage space by removing your assets.',
            confirmText: 'Okay',
          },
          'upgrade',
          false,
        ),
      );
    }
  }

  openCreditExceededModal(user: User, videoFrames: number) {
    if (!this.dispatch) {
      return;
    }

    const neededCredit = this.calculateCreditFromVideoFrames(videoFrames);

    if (user.planType === 'freemium') {
      this.dispatch(
        globalUIActions.openModal('ConfirmModal', {
          title: 'Need more credits?',
          message: `You have <strong>${user.credits?.remaining} credits</strong> left. <strong>${neededCredit} credits</strong> are required on this. Upgrade to MoCap Pro to get more credits.`,
          onConfirm: () => {
            this.dispatch && this.dispatch(globalUIActions.openModal('UpgradePlanModal', { hadFreeTrial: user.hadFreeTrial }));
          },
          confirmText: 'Upgrade',
        }),
      );
    } else {
      this.dispatch(
        globalUIActions.openModal('AlertModal', {
          title: 'Out of credits',
          message: `${neededCredit} credits will be required on this. Mocap Pro plan will be renewed with ${user.credits?.nextChargeCredit.toLocaleString()} credits on ${dateFormat(
            user.credits?.nextChargeDate || '',
          )}.`,
          confirmText: 'Okay',
        }),
      );
    }
  }

  openProFeaturesNotAllowedModal(user: User) {
    if (this.dispatch) {
      this.dispatch(
        globalUIActions.openModal('ProFeaturesModal', {
          hadFreeTrial: user.hadFreeTrial,
        }),
      );
    }
  }
}

export default new PlanManager();
