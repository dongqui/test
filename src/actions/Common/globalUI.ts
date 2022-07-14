import { OpenModalFn, Modal } from 'containers/Common/Modal/Modal';
import { OpenContextMenuFn, ContextMenu } from 'containers/Common/ContextMenu/ContextMenu';
import { OnboardingStep } from 'containers/Onboarding';

export const OPEN_MODAL = 'globalUI/OPEN_MODAL' as const;
export const CLOSE_MODAL = 'globalUI/CLOSE_MODAL' as const;
export const OPEN_CONTEXT_MENU = 'globalUI/OPEN_CONTEXT_MENU' as const;
export const CLOSE_CONTEXT_MENU = 'globalUI/CLOSE_CONTEXT_MENU' as const;
export const PROGRESS_ONBOARDING = 'globalUI/PROGRESS_ONBOARDING' as const;

interface OpenModalReturnyType {
  type: 'globalUI/OPEN_MODAL';
  payload: {
    name: Modal['name'];
    props?: unknown;
    alias?: string;
    overlay?: boolean;
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

interface ProgressOnboarding {
  onboardingStep: OnboardingStep;
}

export const openModal: OpenModalFn<OpenModalReturnyType> = (name, props, alias, overlay) => ({
  type: OPEN_MODAL,
  payload: {
    name,
    props,
    alias,
    overlay,
  },
});

export const closeModal = (alias?: Modal['alias'] | Modal['name']) => ({
  type: CLOSE_MODAL,
  payload: {
    alias,
  },
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

/**
 * 온보딩 진행
 * @param onboardingStep - OnboardingStep
 */
export const progressOnboarding = (params: ProgressOnboarding) => ({
  type: PROGRESS_ONBOARDING,
  payload: { ...params },
});

export type GlobalUIActions =
  | ReturnType<typeof openModal>
  | ReturnType<typeof closeModal>
  | ReturnType<typeof openContextMenu>
  | ReturnType<typeof closeContextMenu>
  | ReturnType<typeof progressOnboarding>;
