import { FunctionComponent, Fragment, memo } from 'react';
import { BaseModal } from 'components/Modal';
import { FilledButton } from 'components/Button';
import classnames from 'classnames/bind';
import styles from './AlertModal.module.scss';
import { Html } from '../Typography';

const cx = classnames.bind(styles);

interface Props {
  closeModal: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText: string;
}

const AlertModal: FunctionComponent<Props> = ({ closeModal, title, onConfirm, message, confirmText = 'Confirm' }) => {
  const onClickButton = () => {
    onConfirm && onConfirm();
    closeModal();
  };
  return (
    <Fragment>
      <BaseModal>
        <div className={cx('title')}>{title}</div>
        <div className={cx('content')}>
          <Html content={message} />
        </div>
        <FilledButton onClick={onClickButton} fullSize>
          {confirmText}
        </FilledButton>
      </BaseModal>
    </Fragment>
  );
};

export default memo(AlertModal);
