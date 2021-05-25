import { LPDatasState, LPDataAction } from 'actions/lpdata';

export const ROOT_KEY = 'root';
const defaultState: LPDatasState = [];

export const lpdata = (state: LPDatasState = defaultState, action: LPDataAction): LPDatasState => {
  switch (action.type) {
    case 'lpdata/SET_LPDATA': {
      return [...state, ...action.payload];
    }
    case 'lpdata/DELETE_LPDATA': {
      return state.filter((item) => !action.payload.includes(item.key));
    }
    default: {
      return state;
    }
  }
};
