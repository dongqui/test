import { FunctionComponent, Fragment, memo } from 'react';
import { BaseModal } from 'components/Modal';
import { FilledButton } from 'components/Button';
import { Html } from 'components/Typography';
import classnames from 'classnames/bind';
import styles from './AlertModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
}

const AlertModal: FunctionComponent<Props> = ({ onClose, title, onConfirm, message, confirmText = 'Confirm' }) => {
  const onClickButton = () => {
    onConfirm && onConfirm();
    onClose();
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
