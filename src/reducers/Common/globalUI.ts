import { OPEN_MODAL } from './../../actions/Common/globalUI';
import * as Modals from 'components/Modal';
import * as globalUIActions from 'actions/Common/globalUI';

interface State {
  openModalName: null | keyof typeof Modals;
  openModalProps: Record<string, any>;
}

const defaultState: State = {
  openModalName: null,
  openModalProps: {},
};

export const globalUI = (state = defaultState, action: globalUIActions.GlobalUIActions) => {
  switch (action.type) {
    case globalUIActions.OPEN_MODAL:
      return Object.assign(state, {
        openModalName: action.payload.modalName,
      });
    case globalUIActions.CLOSE_MODAL:
      return Object.assign(state, {
        openModalName: null,
        openModalProps: {},
      });
    default:
      return state;
  }
};
