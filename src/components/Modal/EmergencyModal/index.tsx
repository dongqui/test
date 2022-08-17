import Image from 'next/image';

import { BaseModal } from 'components/Modal';
import { SvgPath } from 'components/Icon';
import { OutlineButton, IconButton } from 'components/Button';
import { Html } from 'components/Typography';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  closeCallback?: () => void;
  message: string;
  title: string;
}

// TODO: make body more flexible
export default function NotificationModal({ onClose, title, message, closeCallback }: Props) {
  function handleClose() {
    closeCallback && closeCallback();
    onClose();
  }
  return (
    <BaseModal hasPadding={false}>
      <div className={cx('container')}>
        <header className={cx('header')}>
          <h3>{title}</h3>
          <IconButton onClick={handleClose} type="ghost" icon={SvgPath['ModalClose']} />
        </header>
        <div className={cx('body')}>
          <Image src="/images/megaPhone.svg" alt="notification" width={160} height={160} />
          <Html content={message} />
        </div>
        <footer className={cx('footer')}>
          <OutlineButton onClick={handleClose}>Okay</OutlineButton>
        </footer>
      </div>
    </BaseModal>
  );
}
