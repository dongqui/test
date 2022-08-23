import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  children?: React.ReactNode;
}

export default function Spinner({ children }: Props) {
  return (
    <div className={cx('spinner-container')}>
      <div className={cx('spinner')}></div>
      <div className={cx('inner')}>{children}</div>
    </div>
  );
}
