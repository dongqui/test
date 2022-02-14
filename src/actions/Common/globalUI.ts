import { OpenModalFn, Modal } from 'containers/Common/Modal/Modal';
import { OpenContextMenuFn, ContextMenu } from 'containers/Common/ContextMenu/ContextMenu';

export const OPEN_MODAL = 'globalUI/OPEN_MODAL' as const;
export const CLOSE_MODAL = 'globalUI/CLOSE_MODAL' as const;
export const OPEN_CONTEXT_MENU = 'globalUI/OPEN_CONTEXT_MENU' as const;
export const CLOSE_CONTEXT_MENU = 'globalUI/CLOSE_CONTEXT_MENU' as const;
export const OPEN_ONBOARDING = 'globalUI/OPEN_ONBOARDING' as const;
export const CLOSE_ONBOARDING = 'globalUI/CLOSE_ONBOARDING' as const;

interface OpenModalReturnyType {
  type: 'globalUI/OPEN_MODAL';
  payload: {
    name: Modal['name'];
    props?: unknown;
  };
}

interface OpenContextMenuReturnyType {
  type: 'globalUI/OPEN_CONTEXT_MENU';
  payload: {
    name: ContextMenu['name'];
    event: React.MouseEvent;
    props?: unknown;
  };
}

export const openModal: OpenModalFn<OpenModalReturnyType> = (name, props) => ({
  type: OPEN_MODAL,
  payload: {
    name,
    props,
  },
});

export const closeModal = () => ({
  type: CLOSE_MODAL,
  payload: {},
});

export const openContextMenu: OpenContextMenuFn<OpenContextMenuReturnyType> = (name, event, props) => ({
  type: OPEN_CONTEXT_MENU,
  payload: {
    name,
    event,
    props,
  },
});

export const closeContextMenu = () => ({
  type: CLOSE_CONTEXT_MENU,
  payload: {},
});

export const openOnboarding = () => ({
  type: OPEN_ONBOARDING,
});
export const closeOnboarding = () => ({
  type: CLOSE_ONBOARDING,
});

export type GlobalUIActions =
  | ReturnType<typeof openModal>
  | ReturnType<typeof closeModal>
  | ReturnType<typeof openContextMenu>
  | ReturnType<typeof closeContextMenu>
  | ReturnType<typeof openOnboarding>
  | ReturnType<typeof closeOnboarding>;
