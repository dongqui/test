import { PlaskHistoryAction } from 'actions/plaskHistoryAction';
import { PlaskHistory } from 'types/common';

import { getRandomStringKey } from 'utils/common';

type State = PlaskHistory;

const defaultState: State = {
  id: getRandomStringKey(),
  history: [],
  pointer: -1,
  previousPointer: -1,
};

export const plaskHistory = (state = defaultState, action: PlaskHistoryAction) => {
  switch (action.type) {
    case 'plaskHistory/ADD_HISTORY': {
      if (state.history.length && state.history.length - 1 > state.pointer) {
        return Object.assign({}, state, {
          previousPointer: state.pointer,
          pointer: state.pointer + 1,
          history: [...state.history.slice(0, state.pointer + 1), action.payload.command],
        });
      } else {
        return Object.assign({}, state, {
          previousPointer: state.pointer,
          pointer: state.pointer + 1,
          history: [...state.history, action.payload.command],
        });
      }
    }
    case 'plaskHistory/CLEAR_HISTORY': {
      return Object.assign({}, state, {
        pointer: -1,
        previousPointer: -1,
        history: [],
      });
    }

    case 'plaskHistory/REDO': {
      if (state.history.length - 1 > state.pointer) {
        return Object.assign({}, state, {
          previousPointer: state.pointer,
          pointer: state.pointer + 1,
        });
      } else {
        return state;
      }
    }

    case 'plaskHistory/UNDO': {
      if (state.pointer > -1) {
        return Object.assign({}, state, {
          previousPointer: state.pointer,
          pointer: state.pointer - 1,
        });
      } else {
        return state;
      }
    }

    case 'plaskHistory/UPDATED': {
      return state;
    }
    case 'plaskHistory/UPDATE_SERVER': {
      return state;
    }

    default: {
      return state;
    }
  }
};
