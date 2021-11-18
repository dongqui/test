import { Fragment } from 'react';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const GridLine = () => {
  return (
    <Fragment>
      <g id="top-grid" className={cx('top-grid')} />
    </Fragment>
  );
};

export default GridLine;
