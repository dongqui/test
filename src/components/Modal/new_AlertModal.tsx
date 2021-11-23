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
  onOutsideClose?: () => void;
  title?: string;
  text?: string;
  message: string;
  buttonText: string;
}

const AlertModal: FunctionComponent<Props> = ({ closeModal, title, onConfirm, message, buttonText = 'Confirm' }) => {
  const onClickButton = () => {
    onConfirm && onConfirm();
    closeModal();
  }
  return (
    <Fragment>
      <BaseModal>
        <div className={cx('inner')}>
          <div className={cx('title')}>{title}</div>
          <div className={cx('content')}>
            <Html content={message} />
          </div>
        </div>
        <FilledButton onClick={onClickButton} fullSize>
          {buttonText}
        </FilledButton>
      </BaseModal>
    </Fragment>
  );
};

export default memo(AlertModal);
