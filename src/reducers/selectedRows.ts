import { SelectedRowsAction } from 'actions/selectedRows';
import _ from 'lodash';

interface SelectedRowsState {
  keys: string[];
}

const defaultState: SelectedRowsState = {
  keys: [],
};

export const selectedRows = (state = defaultState, action: SelectedRowsAction) => {
  switch (action.type) {
    case 'selectedRows/SET_SELECTED_ROWS': {
      return Object.assign({}, state, {
        keys: action.payload.keys,
      });
    }
    case 'selectedRows/ADD_SELECTED_ROWS': {
      return Object.assign({}, state, {
        keys: _.uniq(_.concat(state.keys, action.payload.keys)),
      });
    }
    case 'selectedRows/DELETE_SELECTED_ROWS': {
      return Object.assign({}, state, {
        keys: state.keys.filter((key) => !action.payload.keys.includes(key)),
      });
    }
    default: {
      return state;
    }
  }
};
