import { LPModeAction } from 'actions/lpMode';
import { LPModeType } from 'types/LP';

type LPModeState = LPModeType;

const defaultState: LPModeState = {
  mode: 'listView',
};

export const lpMode = (state = defaultState, action: LPModeAction) => {
  switch (action.type) {
    case 'lpmode/SET_LPMODE': {
      return Object.assign({}, state, {
        mode: action.payload.mode,
      });
    }
    default: {
      return state;
    }
  }
};
