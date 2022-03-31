import { BaseModal } from 'components/Modal';
import { IconWrapper, SvgPath } from 'components/Icon';
import { OutlineButton } from 'components/Button';
import { Html } from 'components/Typography';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  message: string;
  fileName: string;
}

export default function ImportErrorModal({ onClose, message, fileName }: Props) {
  return (
    <BaseModal>
      <div className={cx('container')}>
        <header>
          <h6>Failed to import {fileName}</h6>
          <IconWrapper icon={SvgPath['ErrorWarning']} />
        </header>
        <div className={cx('body')}>
          <Html content={message} />
        </div>
        <footer>
          <OutlineButton onClick={onClose}>OK</OutlineButton>
        </footer>
      </div>
    </BaseModal>
  );
}
