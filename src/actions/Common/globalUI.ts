import { OpenModaFn, Modal } from 'components/Modal/Modal';

export const OPEN_MODAL = 'globalUI/OPEN_MODAL' as const;
export const CLOSE_MODAL = 'globalUI/CLOSE_MODAL' as const;

interface OpenModalReturnyType {
  type: 'globalUI/OPEN_MODAL';
  payload: {
    modalName: Modal['name'];
    modalProps?: Record<string, any>;
  };
}

export const openModal: OpenModaFn<OpenModalReturnyType> = (name, props) => ({
  type: OPEN_MODAL,
  payload: {
    modalName: name,
    modalProps: props,
  },
});

export const closeModal = () => ({
  type: CLOSE_MODAL,
  payload: {},
});

export type GlobalUIActions = ReturnType<typeof openModal> | ReturnType<typeof closeModal>;
