import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Background = () => {
  return <div className={cx('background')} />;
};

export default Background;
