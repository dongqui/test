import * as Modals from 'components/Modal';
import React, { useState, useCallback, createContext, ReactNode, useContext, useEffect } from 'react';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import * as globalUIActions from 'actions/Common/globalUI';
export interface Modal {
  name: keyof typeof Modals;
  props?: Record<string, any>;
}

export interface ModalDefaultProps {
  onClose: () => void;
}

export interface ModalRendererProps extends ModalDefaultProps {
  modal: Modal;
}

export interface OpenModaFn<ReturnType> {
  <T extends Modal['name']>(name: T, props: Omit<React.ComponentProps<typeof Modals[T]>, keyof ModalDefaultProps>): ReturnType;
}

export interface ModalContextValue {
  onModalOpen: OpenModaFn<void>;
  onModalClose: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  onModalOpen: () => {},
  onModalClose: () => {},
});

const ModalRenderer = ({ onClose, modal }: ModalRendererProps) => {
  const Modal = Modals[modal.name];
  return <Modal onClose={onClose} {...(modal.props as any)} />;
};

export function ModalContextProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<Modal | null>(null);
  const { openModalName, openModalProps } = useSelector((state) => state.globalUI);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!openModalName) {
      setModal(null);
    } else {
      setModal({ name: openModalName, props: openModalProps });
    }
  }, [openModalName, openModalProps]);

  const onModalOpen: ModalContextValue['onModalOpen'] = (name, props) => {
    dispatch(globalUIActions.openModal(name, props));
  };

  const onModalClose = () => {
    dispatch(globalUIActions.closeModal());
  };

  return (
    <ModalContext.Provider value={{ onModalOpen, onModalClose }}>
      {children}
      {modal && <ModalRenderer onClose={onModalClose} modal={modal} />}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
