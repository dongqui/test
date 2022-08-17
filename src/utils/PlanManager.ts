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

  _calculateCreditFromVideoDuration(videoDuration: number) {
    // ----------------------------------------- TODO: calculate credit -----------------------------------------
  }

  isCreditExceeded(user: User, videoDuration: number) {
    // ----------------------------------------- TODO: calculate credit -----------------------------------------

    const neededCredts = this._calculateCreditFromVideoDuration(videoDuration);

    return !user.credits?.remaining;
  }

  openStorageExceededModal(user: User) {
    if (!this.dispatch) {
      return;
    }

    if (user.planType !== 'freemium') {
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

  openCreditExceededModal(user: User, videoDuration: number) {
    if (!this.dispatch) {
      return;
    }

    const neededCredit = this._calculateCreditFromVideoDuration(videoDuration);

    if (user.planType === 'freemium') {
      this.dispatch(
        globalUIActions.openModal('ConfirmModal', {
          title: 'Need more credits?',
          message: `${neededCredit} credits will be required on this. To resume, get more credits with a Mocap Pro plan.`,
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
}

export default new PlanManager();
