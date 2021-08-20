import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

const UpperBar: React.FC = () => {
  return (
    <header className={cx('wrap')}>
      <div className={cx('left-upper')}></div>
      <div className={cx('middle-upper')}></div>
      <div className={cx('right-upper')}></div>
    </header>
  );
};

export default UpperBar;
