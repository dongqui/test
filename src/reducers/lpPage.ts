import { LPPageState, LPPageAction } from 'actions/lpPage';
import { ROOT_KEY } from './lpData';

const defaultState: LPPageState = {
  key: ROOT_KEY,
};

export const lpPage = (state: LPPageState = defaultState, action: LPPageAction) => {
  switch (action.type) {
    case 'lppage/SET_LPPAGE': {
      return Object.assign({}, state, {
        key: action.payload.key,
      });
    }
    default: {
      return state;
    }
  }
};
