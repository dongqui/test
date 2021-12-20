import { ChangeMode, ModeSelectionAction } from 'actions/CP/cpModeSelection';

const defaultState: ChangeMode = {
  mode: 'Animation',
};

export const cpModeSelection = (state = defaultState, action: ModeSelectionAction) => {
  switch (action.type) {
    case 'modeSelection/CHANGE_MODE': {
      return Object.assign({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
