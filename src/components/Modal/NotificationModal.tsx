import { BaseModal } from 'components/Modal';
import { SvgPath } from 'components/Icon';
import { IconButton } from 'components/Button';
import { Html } from 'components/Typography';

import classnames from 'classnames/bind';
import styles from './NotificationModal.module.scss';

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
          <video autoPlay loop muted width="640" height="360">
            <source src="/video/new_model_Naye.mp4" type="video/mp4" />
          </video>
        </div>
        <footer className={cx('footer')}>
          <Html content={message} />
        </footer>
      </div>
    </BaseModal>
  );
}
