import { FunctionComponent } from 'react';
import { BaseModal } from 'components/Modal';
import { FilledButton } from 'components/Button';
import { Html } from '../Typography';
import classnames from 'classnames/bind';
import styles from './ConfirmModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  closeModal: () => void;
}

const ConfirmModal: FunctionComponent<Props> = ({ closeModal, title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  const onClickConfirm = () => {
    onConfirm();
    closeModal();
  };
  const onClickCancel = () => {
    onCancel();
    closeModal();
  };
  return (
    <BaseModal>
      <div className={cx('inner')}>
        <div className={cx('title')}>{title}</div>
        <div className={cx('content')}>
          <Html content={message} />
        </div>
        <div className={cx('buttons')}>
          <FilledButton className={cx('button-cancel')} onClick={onClickCancel} color="secondary" fullSize>
            {cancelText}
          </FilledButton>
          <FilledButton onClick={onClickConfirm} color="primary" fullSize>
            {confirmText}
          </FilledButton>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;
