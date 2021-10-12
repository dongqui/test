import DopeSheetHeader from './DopeSheetHeader';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MiddleBarHeader = () => {
  return (
    <div className={cx('header')}>
      <DopeSheetHeader />
    </div>
  );
};

export default MiddleBarHeader;
