import { Fragment } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import * as Modals from './modals';
import * as globalUIActions from 'actions/Common/globalUI';
export interface Modal {
  // 모달 이름(Modal Component file 이름)
  name: keyof typeof Modals;

  // Modal Component로 전달한 props
  props?: Record<string, any>;

  // 같은 이름의 모달을 복수로 사용시 alias 사용
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

  if (modals.length === 0) {
    return null;
  }

  const handleClose = (modalAlias: string) => () => {
    dispatch(globalUIActions.closeModal(modalAlias));
  };

  return (
    <Fragment>
      {modals.map((modal, i) => {
        const Modal = Modals[modal.name];
        return <Modal key={modal.name + i} onClose={handleClose(modal.alias || modal.name)} {...(modal.props as any)} />;
      })}
    </Fragment>
  );
}
