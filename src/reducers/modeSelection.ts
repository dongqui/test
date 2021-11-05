import { ModeSelectionType } from 'types';
import { ModeSelectionAction } from 'actions/modeSelection';

const defaultState: ModeSelectionType = {
  mode: 'animationMode',
};

export const modeSelection = (state = defaultState, action: ModeSelectionAction) => {
  switch (action.type) {
    case 'modeSelection/SET_MODE': {
      return { ...state, mode: action.payload };
    }
    default: {
      return state;
    }
  }
};
