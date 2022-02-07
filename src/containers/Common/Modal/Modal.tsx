import React from 'react';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import * as Modals from './modals';
import * as globalUIActions from 'actions/Common/globalUI';
export interface Modal {
  name: keyof typeof Modals;
  props?: Record<string, any>;
}
export interface ModalDefaultProps {
  onClose: () => void;
}
export interface OpenModalFn<ReturnType> {
  <T extends Modal['name']>(name: T, props: Omit<React.ComponentProps<typeof Modals[T]>, keyof ModalDefaultProps>): ReturnType;
}

export default function Modal() {
  const modal = useSelector((state) => state.globalUI.modal);
  const dispatch = useDispatch();

  if (!modal) {
    return null;
  }

  const handleClose = () => {
    dispatch(globalUIActions.closeModal());
  };

  const OpenedModal = Modals[modal.name];
  return <OpenedModal onClose={handleClose} {...(modal.props as any)} />;
}
