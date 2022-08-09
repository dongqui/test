import { ActionType, getType } from 'typesafe-actions';

import * as userActions from 'actions/User';

interface State {
  name: string;
  planName: string;
  credits: {
    remaining: number;
    expiredDate: Date;
  } | null;
  storage: {
    usageSize: number;
    limitSize: number;
  } | null;
}

const defaultState: State = {
  name: '',
  planName: '',
  credits: null,
  storage: null,
};

export const user = (state = defaultState, action: ActionType<typeof userActions>) => {
  switch (action.type) {
    case getType(userActions.getUserAsync.success): {
      return Object.assign({}, state, {
        name: action.payload,
      });
    }
    case getType(userActions.getUserUsagaInfoAsync.success): {
      return Object.assign({}, state, {
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
