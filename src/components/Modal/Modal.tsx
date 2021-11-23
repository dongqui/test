import * as Modals from 'components/Modal';
import React, { useState, useCallback, createContext, ReactNode, useContext } from 'react';

interface Modal {
  name: keyof typeof Modals;
  props: {
    [key in string]: any;
  };
}

interface ModalProps {
  closeModal: () => void;
}

interface ModalContextValues {
  open: <T extends Modal["name"]>(name: T, props: Omit<React.ComponentProps<typeof Modals[T]>, keyof ModalProps | "children">) => void;
}

interface ModalRendererProps extends ModalProps {
  modal: Modal;
}

const ModalContext = createContext<ModalContextValues | null>(null);

export const useModal = () => useContext(ModalContext);

export function ModalContextProvider({ children }: { children: ReactNode }) {
  const [openedModal, setOpenedModal] = useState<Modal | null>(null);

  const open: ModalContextValues['open'] = useCallback((name, props) => {
    setOpenedModal({ name, props });
  }, []);

  const closeModal = useCallback(() => {
    setOpenedModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ open }}>
      {children}
      {openedModal && <ModalRenderer closeModal={closeModal} modal={openedModal}/>}
    </ModalContext.Provider>
  );
}

const ModalRenderer = ({ closeModal, modal }: ModalRendererProps) => {
  const Modal = Modals[modal.name];
  return <Modal closeModal={closeModal} {...(modal.props as any)} />;
};
