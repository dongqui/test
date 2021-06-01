import { LPModeState, LPModeAction } from 'actions/lpMode';

const defaultState: LPModeState = {
  mode: 'listView',
};

export const lpMode = (state: LPModeState = defaultState, action: LPModeAction) => {
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
