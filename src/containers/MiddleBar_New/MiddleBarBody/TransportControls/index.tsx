import React, { FunctionComponent } from 'react';
import Buttons from './Buttons';
import FasterDropdown from './FasterDropdown';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const TransportControls: FunctionComponent<Props> = () => {
  return (
    <div className={cx('transport-controls')}>
      <Buttons />
      <FasterDropdown />
    </div>
  );
};

export default TransportControls;
