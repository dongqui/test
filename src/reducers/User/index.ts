import { ActionType, getType } from 'typesafe-actions';

import * as userActions from 'actions/User';

interface State {
  name: string;
  hadFreeTrial: boolean;
  planName: string;
  planType: 'freemium' | 'pro_active' | 'pro_trialing';
  credits: {
    remaining: number;
    nextChargeCredit: number;
    nextChargeDate: string;
  } | null;
  storage: {
    usageSize: number;
    limitSize: number;
  } | null;
}

const defaultState: State = {
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

    default: {
      return state;
    }
  }
};
