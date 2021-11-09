import { ChangeMode, ModeSelectionAction } from 'actions/modeSelection';

const defaultState: ChangeMode = {
  mode: 'animationMode',
  // videoURL: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
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
