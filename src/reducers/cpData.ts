import { CPDataAction } from 'actions/cpData';

interface CPDataState {
  tabIndex: number;
}

const defaultState: CPDataState = {
  tabIndex: 0,
};

export const cpData = (state = defaultState, action: CPDataAction) => {
  switch (action.type) {
    case 'cpData/SET_CP_TAB': {
      return Object.assign({}, state, {
        tabIndex: action.payload.tabIndex,
      });
    }
    default:
      return state;
  }
};
