import { BaseModal } from 'components/Modal';
import { IconWrapper, SvgPath } from 'components/Icon';
import { OutlineButton } from 'components/Button';
import { Html } from 'components/Typography';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

interface Props {
  onClose: () => void;
  fileName: string;
  message: string;
}

const _message = 'There is <b>no skeleton in the file</b>, so it cannot be added.<br>Should the problem recur, let us know via the chat window on our website.';
export default function ImportErrorModal({ onClose, fileName, message = _message }: Props) {
  const cx = classnames.bind(styles);
  return (
    <BaseModal>
      <div className={cx('container')}>
        <header>
          <h6>Failed to {fileName}</h6>
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
