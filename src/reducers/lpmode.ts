import { LPModeState, LPModeAction } from 'actions/lpmode';

const defaultState: LPModeState = {
  mode: 'listview',
};

export const lpmode = (state: LPModeState = defaultState, action: LPModeAction): LPModeState => {
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
