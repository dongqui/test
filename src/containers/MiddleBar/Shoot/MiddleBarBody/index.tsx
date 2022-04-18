import Box from 'components/Layout/Box';
import ChangeModes from './ChangeModes';
import Loop from './Loop';
import TransportControls from './TransportControls';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MiddleBarBody = () => {
  return (
    <Box id="MB-Body" className={cx('body')} noResize>
      <div className={cx('inner')}>
        <Loop />
        <TransportControls />
        <ChangeModes />
      </div>
    </Box>
  );
};

export default MiddleBarBody;
