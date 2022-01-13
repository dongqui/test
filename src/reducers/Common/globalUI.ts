import { Modal } from 'components/Modal/Modal';
import * as globalUIActions from 'actions/Common/globalUI';
interface State {
  modal: Modal | null;
}

const defaultState: State = {
  modal: null,
};

export const globalUI = (state = defaultState, action: globalUIActions.GlobalUIActions) => {
  switch (action.type) {
    case globalUIActions.OPEN_MODAL:
      return Object.assign(state, {
        modal: {
          name: action.payload.modalName,
          props: action.payload.modalProps,
        },
      });
    case globalUIActions.CLOSE_MODAL:
      return Object.assign(state, {
        modal: null,
      });
    default:
      return state;
  }
};
