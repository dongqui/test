import { FunctionComponent, memo } from 'react';
import { BaseModal } from 'components/New_Modal';
import { FilledButton } from 'components/New_Button';
import classnames from 'classnames/bind';
import styles from './ConfirmModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  onConfirm: () => void;
  onOutsideClose?: () => void;
  title: string;
  text: {
    confirm: string;
    cancel: string;
  };
}

const ConfirmModal: FunctionComponent<Props> = ({
  title,
  text,
  onClose,
  onConfirm,
  onOutsideClose,
}) => {
  return (
    <BaseModal onClose={onClose} onOutsideClose={onOutsideClose} title={title}>
      <div className={cx('inner')}>
        <FilledButton className={cx('button-cancel')} onClick={onClose} color="secondary" fullSize>
          {text.cancel}
        </FilledButton>
        <FilledButton onClick={onConfirm} color="primary" fullSize>
          {text.confirm}
        </FilledButton>
      </div>
    </BaseModal>
  );
};

export default memo(ConfirmModal);
