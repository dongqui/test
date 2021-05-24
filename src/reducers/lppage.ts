import { LPPageState, LPPageAction } from 'actions/lppage';

const defaultState: LPPageState = {
  key: '',
  name: '',
};

export const lppage = (state: LPPageState = defaultState, action: LPPageAction): LPPageState => {
  switch (action.type) {
    case 'lppage/SET_LPPAGE': {
      return Object.assign({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
