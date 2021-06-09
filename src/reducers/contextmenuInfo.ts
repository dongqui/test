import { ContextMenuInfoAction } from 'actions/contextmenuInfo';
import { ContextmenuType } from 'types';

type ContextmenuInfoState = ContextmenuType;

const defaultState: ContextmenuInfoState = {
  isShow: false,
  top: 0,
  left: 0,
  data: [],
  onClick: () => {},
};

export const contextmenuInfo = (state = defaultState, action: ContextMenuInfoAction) => {
  switch (action.type) {
    case 'contextmenuInfo/SET_CONTEXTMENU_INFO': {
      return Object.assign({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
