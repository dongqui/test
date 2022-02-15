import { Fragment } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import * as Modals from './modals';
import * as globalUIActions from 'actions/Common/globalUI';
export interface Modal {
  name: keyof typeof Modals;
  props?: Record<string, any>;
  alias: string;
}
export interface ModalDefaultProps {
  onClose: () => void;
}
export interface OpenModalFn<ReturnType> {
  <T extends Modal['name']>(name: T, props: Omit<React.ComponentProps<typeof Modals[T]>, keyof ModalDefaultProps>, alias?: string): ReturnType;
}

export default function Modal() {
  const modals = useSelector((state) => state.globalUI.modals);
  const dispatch = useDispatch();

  if (!modals.length) {
    return null;
  }

  const handleClose = (modalAlias: string) => () => {
    dispatch(globalUIActions.closeModal(modalAlias));
  };

  return (
    <Fragment>
      {modals.map((modal) => {
        const Modal = Modals[modal.name];
        return <Modal key={modal.alias} onClose={handleClose(modal.alias)} {...(modal.props as any)} />;
      })}
    </Fragment>
  );
}
