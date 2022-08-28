import { FunctionComponent } from 'react';

import { IconButton, FilledButton, OutlineButton, BaseModal, Html, SvgPath } from 'components';
import { ButtonColor } from 'types/common';

import classnames from 'classnames/bind';
import styles from './ConfirmModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: ButtonColor;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

const ConfirmModal: FunctionComponent<Props> = ({
  onClose,
  title,
  message,
  confirmButtonColor = 'primary',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const handleClickConfirm = () => {
    onConfirm();
    onClose();
  };

  const handelCancel = () => {
    onCancel && onCancel();
    onClose();
  };

  return (
    <BaseModal>
      <div className={cx('inner')}>
        <header>
          <h3 className={cx('title')}>{title}</h3>
          <IconButton onClick={onClose} type="ghost" icon={SvgPath['ModalClose']} />
        </header>
        <div className={cx('content')}>
          <Html content={message} />
        </div>
        <div className={cx('buttons')}>
          <OutlineButton onClick={handelCancel}>{cancelText}</OutlineButton>
          <FilledButton onClick={handleClickConfirm} buttonType={confirmButtonColor} dataCy="modal-confirm">
            {confirmText}
          </FilledButton>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;
