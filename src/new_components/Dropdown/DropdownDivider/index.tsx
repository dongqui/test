import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const DropdownDivider = () => {
  return <div className={cx('divider')} />;
};

export default DropdownDivider;
