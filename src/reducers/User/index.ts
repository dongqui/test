import { ActionType, getType } from 'typesafe-actions';

import { UserState } from 'types/common';
import * as userActions from 'actions/User';

const defaultState: UserState = {
  name: '',
  planName: '',
  planType: 'freemium',
  credits: null,
  storage: null,
  hadFreeTrial: false,
};

export const user = (state = defaultState, action: ActionType<typeof userActions>) => {
  switch (action.type) {
    case getType(userActions.getUserAsync.success): {
      return Object.assign({}, state, {
        name: action.payload.name,
        hadFreeTrial: action.payload.hadFreeTrial,
        planType: action.payload.planType,
        planName: action.payload.planName,
        credits: action.payload.credits,
        storage: action.payload.storage,
      });
    }
    case getType(userActions.getUserUsagaInfoAsync.success): {
      return Object.assign({}, state, {
        planType: action.payload.planType,
        planName: action.payload.planName,
        credits: action.payload.credits,
        storage: action.payload.storage,
      });
    }
    case getType(userActions.getUserCreditInfoAsync.success): {
      return Object.assign({}, state, {
        credits: {
          ...state.credits,
          remaining: action.payload.remainingCredit,
        },
      });
    }
    case getType(userActions.getUserStorageInfoAsync.success): {
      return Object.assign({}, state, {
        storage: action.payload,
      });
    }

    default: {
      return state;
    }
  }
};
