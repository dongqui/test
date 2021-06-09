import { PageInfoAction } from 'actions/pageInfo';
import { PageInfoType } from 'types';

type PageInfoState = PageInfoType;

const defaultState: PageInfoState = {
  page: 'shoot',
};

export const pageInfo = (state = defaultState, action: PageInfoAction) => {
  switch (action.type) {
    case 'pageInfo/SET_PAGEINFO': {
      return Object.assign({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
