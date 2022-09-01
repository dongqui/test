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

  remainingCredits(user: User, requiredCredit: number) {
    return (user.credits?.remaining || 0) - requiredCredit;
  }

  isCreditExceeded(user: User, requiredCredit: number) {
    return (user.credits?.remaining || 0) < requiredCredit;
  }

  openStorageExceededModal(user: User) {
    if (!this.dispatch) {
      return;
    }

    if (user?.planType === 'freemium') {
      this.dispatch(
        globalUIActions.openModal(
          'ConfirmModal',
          {
            title: 'Storage limit exceeded',
            message: 'Your 1 GB of free storage is full. You won’t be able to upload new files. To keep using Plask, you can get more storage with a MoCap Pro plan.',
            confirmText: 'Upgrade',
            onConfirm: () => {
              this.dispatch && this.dispatch(globalUIActions.openModal('UpgradePlanModal', { hadFreeTrial: user.hadFreeTrial }));
            },
            confirmButtonColor: 'negative',
            cancelText: 'Learn more',
            onCancel: () => {
              window.open('https://knowledge.plask.ai/pricing-plan-faqs', '_blank', 'noopener');
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
            message: 'Your storage is full. You won’t be able to upload new files. You can clear space in your library and free up storage by removing your assets.',
            confirmText: 'Learn more',
            onConfirm: () => {
              window.open('https://knowledge.plask.ai/pricing-plan-faqs', '_blank', 'noopener');
            },
          },
          'upgrade',
          false,
        ),
      );
    }
  }

  openCreditExceededModal(user: User, requiredCredit: number) {
    if (!this.dispatch) {
      return;
    }

    if (user.planType === 'freemium') {
      this.dispatch(
        globalUIActions.openModal('ConfirmModal', {
          title: 'Need more credits?',
          message: `You have <strong>${user.credits?.remaining.toLocaleString()} credits</strong> left. <strong>${requiredCredit.toLocaleString()} credits</strong> are required on this. Upgrade to MoCap Pro to get more credits.`,
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
          message: `${requiredCredit.toLocaleString()} credits will be required on this. MoCap Pro plan will be renewed with ${user.credits?.nextChargeCredit.toLocaleString()} credits on ${dateFormat(
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
