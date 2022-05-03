import Box from 'components/Layout/Box';
import DopeSheetHeader from './DopeSheetHeader';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MiddleBarHeader = () => {
  return (
    <Box id="MB-Header" className={cx('header')} noResize>
      <DopeSheetHeader />
    </Box>
  );
};

export default MiddleBarHeader;
