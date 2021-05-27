import { LPPageState, LPPageAction } from 'actions/lppage';
import { ROOT_KEY } from './lpdata';

const defaultState: LPPageState = {
  key: ROOT_KEY,
};

export const lppage = (state: LPPageState = defaultState, action: LPPageAction): LPPageState => {
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
