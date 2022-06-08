import Image from 'next/image';

import { BaseModal } from 'components/Modal';
import { SvgPath } from 'components/Icon';
import { IconButton } from 'components/Button';
import { Html } from 'components/Typography';

import classnames from 'classnames/bind';
import styles from './NotificationModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  message: string;
  title: string;
}

// TODO: naming component
export default function NotificationModal({
  onClose,
  title = 'New Feature - Auto Save',
  message = 'You can save what you have worked on the Plask from now on. Don’t worry anymore. Want to know what can be saved? <a href="https://knowledge.plask.ai/en/scene_save" target="_blank" rel="noopener noreferrer">Learn more</a>',
}: Props) {
  return (
    <BaseModal>
      <div className={cx('container')}>
        <header className={cx('header')}>
          <h3>New Feature - Auto Save</h3>
          <IconButton onClick={onClose} type="ghost" icon={SvgPath['ModalClose']} />
        </header>
        <div className={cx('body')}>{/* <Image
            alt="Notification contents"
            src=""
          /> */}</div>
        <footer className={cx('footer')}>
          <Html content={message} />
        </footer>
      </div>
    </BaseModal>
  );
}
