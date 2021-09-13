import { LPNodeAction } from 'actions/LP/lpNodeAction';

interface State {}

const defaultState: State = {
  node: [],
};

export const lpNode = (state = defaultState, action: LPNodeAction) => {
  switch (action.type) {
    case 'mode/CHANGE_NODE': {
      return Object.assign({}, state, {
        node: action.payload,
      });
    }
    default: {
      return state;
    }
  }
};
