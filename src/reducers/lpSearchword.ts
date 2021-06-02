import { LPSearchwordAction } from 'actions/lpSearchword';
import { LPSearchwordType } from 'types/LP';

type LPSearchwordState = LPSearchwordType;

const defaultState: LPSearchwordState = {
  word: '',
};

export const lpSearchword = (state = defaultState, action: LPSearchwordAction) => {
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
