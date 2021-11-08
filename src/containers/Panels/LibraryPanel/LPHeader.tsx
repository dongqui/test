import { FunctionComponent } from 'react';

import classNames from 'classnames/bind';
import styles from './LPHeader.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const LPHeader: FunctionComponent<Props> = () => {
  return (
    <div className={cx('wrapper')}>
      <div className={cx('title')}>library</div>
    </div>
  );
};

export default LPHeader;
