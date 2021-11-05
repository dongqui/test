import { ChangeMode, ModeSelectionAction } from 'actions/modeSelection';

const defaultState: ChangeMode = {
  mode: 'animationMode',
};

export const modeSelection = (state = defaultState, action: ModeSelectionAction) => {
  switch (action.type) {
    case 'modeSelection/CHANGE_MODE': {
      return Object.assign({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
