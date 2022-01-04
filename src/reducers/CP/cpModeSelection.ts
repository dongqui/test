import { SwitchCpMode, CpModeSwitchAction } from 'actions/CP/cpModeSelection';

const defaultState: SwitchCpMode = {
  mode: 'Animation',
};

export const cpModeSelection = (state = defaultState, action: CpModeSwitchAction) => {
  switch (action.type) {
    case 'modeSelection/SWITCH_CP_MODE': {
      return Object.assign({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
