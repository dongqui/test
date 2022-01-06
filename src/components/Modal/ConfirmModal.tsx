import { FunctionComponent } from 'react';
import { BaseModal } from 'components/Modal';
import { FilledButton } from 'components/Button';
import { Html } from 'components/Typography';
import classnames from 'classnames/bind';
import styles from './ConfirmModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

const ConfirmModal: FunctionComponent<Props> = ({ onClose, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
  const onClickConfirm = () => {
    onConfirm();
    onClose();
  };

  const onClickCancel = () => {
    onCancel && onCancel();
    onClose();
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
