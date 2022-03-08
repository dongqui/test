import { Modal } from 'containers/Common/Modal/Modal';
import { ContextMenu } from 'containers/Common/ContextMenu/ContextMenu';
import * as globalUIActions from 'actions/Common/globalUI';
import { OnboardingStep } from 'containers/Onboarding';

interface State {
  modals: Modal[];
  contextMenu: ContextMenu | null;
  onboardingStep: OnboardingStep;
}

const defaultState: State = {
  modals: [],
  contextMenu: null,
  onboardingStep: null,
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
    case globalUIActions.PROGRESS_ONBOARDING:
      return Object.assign(state, {
        onboardingStep: action.payload.onboardingStep,
      });
    default:
      return state;
  }
};
