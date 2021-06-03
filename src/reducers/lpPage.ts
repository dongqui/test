import { LPPageAction } from 'actions/lpPage';
import { LPPageType, ROOT_KEY } from 'types/LP';

type LPPageState = LPPageType;

const defaultState: LPPageState = {
  key: ROOT_KEY,
};

export const lpPage = (state = defaultState, action: LPPageAction) => {
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
