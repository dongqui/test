import { FunctionComponent, memo } from 'react';
import { BaseModal } from 'components/New_Modal';
import { TextButton } from 'components/New_Button';
import classnames from 'classnames/bind';
import styles from './ConfirmModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  onOutsideClose?: () => void;
  title: string;
}

const ConfirmModal: FunctionComponent<Props> = ({ title, onClose, onOutsideClose }) => {
  return (
    <BaseModal onClose={onClose} onOutsideClose={onOutsideClose} title={title}>
      <div className={cx('inner')}>
        <TextButton onClick={onClose}>확인</TextButton>
      </div>
    </BaseModal>
  );
};

export default memo(ConfirmModal);
