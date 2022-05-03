import { BaseModal } from 'components/Modal';
import { IconWrapper, SvgPath } from 'components/Icon';
import { IconButton, OutlineButton } from 'components/Button';
import { Html } from 'components/Typography';

import classnames from 'classnames/bind';
import styles from './_AlertModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  message: string;
  title: string;
  onClickFooterButton?: () => void;
  footerButtonText?: string;
}

export default function _AlertModal({ onClose, message, title, onClickFooterButton, footerButtonText }: Props) {
  function handleClickFooterButton() {
    if (onClickFooterButton) {
      onClickFooterButton();
    }
    onClose();
  }
  return (
    <BaseModal>
      <div className={cx('container')}>
        <header>
          <IconWrapper icon={SvgPath['ErrorWarning']} />
          <h6>{title}</h6>
          <IconButton onClick={onClose} variant="ghost" icon={SvgPath['ModalClose']} />
        </header>
        <div className={cx('body')}>
          <Html content={message} />
        </div>
        {footerButtonText && (
          <footer>
            <OutlineButton onClick={handleClickFooterButton}>{footerButtonText}</OutlineButton>
          </footer>
        )}
      </div>
    </BaseModal>
  );
}
