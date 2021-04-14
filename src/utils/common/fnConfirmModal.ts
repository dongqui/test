import { useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeConfirmModalData } from 'lib/store';

interface Props {
  showsModal: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onOutsideClose: () => void;
  title: string;
  text: {
    confirm: string;
    cancel: string;
  };
}

const fnConfirmModal = (props: Props) => {
  const { showsModal, onClose, onConfirm, onOutsideClose, text, title } = props;
  // const currentConfirmModalData = useReactiveVar(storeConfirmModalData);
  // // console.log(currentConfirmModalData);

  const handleClose = () => {
    onClose();
    storeConfirmModalData({
      ...props,
      showsModal: false,
    });
  };

  const handleConfirm = () => {
    onConfirm();
    storeConfirmModalData({
      ...props,
      showsModal: false,
    });
  };

  storeConfirmModalData({
    ...props,
    onClose: handleClose,
    onConfirm: handleConfirm,
    onOutsideClose: handleClose,
    showsModal,
  });
};

export default fnConfirmModal;
