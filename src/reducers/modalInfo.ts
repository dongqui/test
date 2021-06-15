import { ModalInfoAction } from 'actions/modalInfo';
import { ModalType } from 'types';

type ModalInfoState = ModalType;

const defaultState: ModalInfoState = {
  msg: '',
  isShow: false,
};

export const modalInfo = (state = defaultState, action: ModalInfoAction) => {
  switch (action.type) {
    case 'modalInfo/SET_MODALINFO': {
      return Object.assign({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
