import { LPSearchwordState, LPSearchwordAction } from 'actions/lpSearchword';

const defaultState: LPSearchwordState = {
  word: '',
};

export const lpSearchword = (
  state: LPSearchwordState = defaultState,
  action: LPSearchwordAction,
) => {
  switch (action.type) {
    case 'lpSearchword/SET_SEARCHWORD': {
      return Object.assign({}, state, {
        word: action.payload.word,
      });
    }
    default: {
      return state;
    }
  }
};
