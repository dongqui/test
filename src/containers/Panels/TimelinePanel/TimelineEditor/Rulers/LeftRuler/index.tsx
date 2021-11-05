import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const LeftRuler = () => {
  return <g className={cx('left-ruler')}></g>;
};

export default LeftRuler;
