import { FunctionComponent, memo } from 'react';
import { BaseModal } from 'components/Modal';
import { Html } from 'components/Typography';
import classnames from 'classnames/bind';
import styles from './LoadingModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  title: string;
  message: string;
}

const LoadingModal: FunctionComponent<Props> = ({ title, message }) => {
  return (
    <BaseModal dataCy="loading-modal">
      <div className={cx('title')}>{title}</div>
      <div className={cx('content')}>
        <Html content={message} />
      </div>
    </BaseModal>
  );
};

export default memo(LoadingModal);
