import * as Modals from 'components/Modal';
import React, { useState, useCallback, createContext, ReactNode, useContext } from 'react';

interface Modal {
  name: keyof typeof Modals;
  props: Record<string, any>;
}

interface ModalDefaultProps {
  onClose: () => void;
}

interface ModalRendererProps extends ModalDefaultProps {
  modal: Modal;
}

interface ModalContextValue {
  onModalOpen: <T extends Modal['name']>(name: T, props: Omit<React.ComponentProps<typeof Modals[T]>, keyof ModalDefaultProps>) => void;
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

  const onModalOpen: ModalContextValue['onModalOpen'] = useCallback((name, props) => {
    setModal({ name, props });
  }, []);

  const onModalClose = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ onModalOpen, onModalClose }}>
      {children}
      {modal && <ModalRenderer onClose={onModalClose} modal={modal} />}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
