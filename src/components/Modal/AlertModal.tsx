import { FunctionComponent, memo } from 'react';

import { IconButton, BaseModal, OutlineButton, Html, SvgPath } from 'components';

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

const AlertModal: FunctionComponent<React.PropsWithChildren<Props>> = ({ onClose, title, onConfirm, message, confirmText = 'Confirm' }) => {
  const onClickButton = () => {
    onConfirm && onConfirm();
    onClose();
  };

  return (
    <BaseModal>
      <div className={cx('container')}>
        <header>
          <h3 className={cx('title')}>{title}</h3>
          <IconButton onClick={onClose} type="ghost" icon={SvgPath['ModalClose']} />
        </header>
        <div className={cx('content')}>
          <Html content={message} />
        </div>

        <footer>
          <OutlineButton onClick={onClickButton}>{confirmText}</OutlineButton>
        </footer>
      </div>
    </BaseModal>
  );
};

export default memo(AlertModal);
