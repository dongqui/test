import { Modal } from 'containers/Common/Modal/Modal';
import { ContextMenu } from 'containers/Common/ContextMenu/ContextMenu';
import * as globalUIActions from 'actions/Common/globalUI';
interface State {
  modals: Modal[];
  contextMenu: ContextMenu | null;
  isShowedOnboarding: boolean;
}

const defaultState: State = {
  modals: [],
  contextMenu: null,
  isShowedOnboarding: false,
};

export const globalUI = (state = defaultState, action: globalUIActions.GlobalUIActions) => {
  switch (action.type) {
    case globalUIActions.OPEN_MODAL:
      return Object.assign(state, {
        modals: [
          ...state.modals,
          {
            name: action.payload.name,
            props: action.payload.props,
            alias: action.payload.alias || action.payload.name,
          },
        ],
      });
    case globalUIActions.CLOSE_MODAL:
      return Object.assign(state, {
        modals: action.payload.alias ? state.modals.filter((modal) => action.payload.alias !== modal.alias) : [],
      });
    case globalUIActions.OPEN_CONTEXT_MENU:
      return Object.assign(state, {
        contextMenu: {
          name: action.payload.name,
          event: action.payload.event,
          props: action.payload.props,
        },
      });
    case globalUIActions.CLOSE_CONTEXT_MENU:
      return Object.assign(state, {
        contextMenu: null,
      });
    case globalUIActions.OPEN_ONBOARDING:
      return Object.assign({}, state, {
        isShowedOnboarding: true,
      });
    case globalUIActions.CLOSE_ONBOARDING:
      return Object.assign({}, state, {
        isShowedOnboarding: false,
      });
    default:
      return state;
  }
};
