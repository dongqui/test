import { LPPageAction, LPPageOldAction } from 'actions/lpPage';
import { LPPageListOldType, LPPageType, ROOT_FOLDER_NAME, ROOT_KEY } from 'types/LP';

type LPPageState = LPPageType;
type LPPageOldState = LPPageListOldType;

const defaultState: LPPageState = {
  key: ROOT_KEY,
};

export const lpPage = (state = defaultState, action: LPPageAction) => {
  switch (action.type) {
    case 'lppage/SET_LPPAGE': {
      return Object.assign({}, state, {
        key: action.payload.key,
      });
    }
    default: {
      return state;
    }
  }
};

const defaultStateOld: LPPageOldState = [
  {
    key: ROOT_FOLDER_NAME,
    name: ROOT_FOLDER_NAME,
    type: 'Folder',
  },
];

export const lpPageOld = (state = defaultStateOld, action: LPPageOldAction) => {
  switch (action.type) {
    case 'lppage/SET_LPPAGE_OLD': {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};
