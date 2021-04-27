import { ModeState, ModeAction, CHANGE_MODE } from 'actions/mode';

const defaultState: ModeState = {
  mode: 'shoot',
};

export const mode = (state: ModeState = defaultState, action: ModeAction) => {
  const { type } = action;

  switch (type) {
    case CHANGE_MODE:
      return Object.assign({}, state, {
        mode: action.mode,
      });
    default:
      return state;
  }
};
