import { FunctionComponent, memo, ReactNode } from 'react';
import { BaseModal } from 'components/New_Modal';
import classnames from 'classnames/bind';
import styles from './ConfirmModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  onOutsideClose?: () => void;
  title: string;
  children?: ReactNode;
}

// 버튼 1개인 경우에는 TextButton, 2개 이상인 경우는 FilledButton, 3개 이상 세로 배치
// Progress 넣을 수 있게
const ConfirmModal: FunctionComponent<Props> = ({ title, onClose, onOutsideClose, children }) => {
  const handleClose = () => {};

  return (
    <BaseModal onClose={onClose} onOutsideClose={onOutsideClose} title={title}>
      <div className={cx('wrapper')}>{children}</div>
    </BaseModal>
  );
};

export default memo(ConfirmModal);
