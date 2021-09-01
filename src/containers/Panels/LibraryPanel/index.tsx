import { FunctionComponent } from 'react';
import Box, { BoxProps } from 'components/Layout/Box';
import LPHeader from './LPHeader';
import LPControlbar from './LPControlbar';
import LPBody from './LPBody';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const LibraryPanel: FunctionComponent<Props> = () => {
  return (
    <div className={cx('wrapper')}>
      <Box id="LP-Header" noResize>
        <LPHeader />
      </Box>
      <Box id="LP-Controlbar" noResize>
        <LPControlbar />
      </Box>
      <Box id="LP-Body" className={cx('lp-body')} noResize>
        <LPBody />
      </Box>
    </div>
  );
};

export default LibraryPanel;
