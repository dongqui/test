import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  children?: React.ReactNode;
  backgroundColor?: 'default' | 'elevated';
  size?: 'small' | 'medium' | 'large';
}

export default function Spinner({ children, backgroundColor = 'default', size = 'large' }: Props) {
  return (
    <div className={cx('spinner-wrapper')}>
      <div className={cx('spinner', backgroundColor, size)}></div>
      <div className={cx('inner')}>{children}</div>
    </div>
  );
}
