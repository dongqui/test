import * as Modals from 'components/Modal';
import React, { useState, useCallback, createContext, ReactNode, useContext } from 'react';

interface Modal {
  name: keyof typeof Modals;
  props: Record<string, any>;
}

interface ModalDefaultProps {
  closeModal: () => void;
}

interface ModalRendererProps extends ModalDefaultProps {
  modal: Modal;
}

type openModal = <T extends Modal['name']>(name: T, props: Omit<React.ComponentProps<typeof Modals[T]>, keyof ModalDefaultProps>) => void;

const ModalContext = createContext<openModal>(() => {});

export const useModal = () => useContext(ModalContext);

export function ModalContextProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<Modal | null>(null);

  const openModal: openModal = useCallback((name, props) => {
    setModal({ name, props });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider value={openModal}>
      {children}
      {modal && <ModalRenderer closeModal={closeModal} modal={modal} />}
    </ModalContext.Provider>
  );
}

const ModalRenderer = ({ closeModal, modal }: ModalRendererProps) => {
  const Modal = Modals[modal.name];
  return <Modal closeModal={closeModal} {...(modal.props as any)} />;
};
