import React from 'react';
import classnames from 'classnames/bind';
import styles from './ContextMenuSeparator.module.scss';

const cx = classnames.bind(styles);

const Separator = () => {
  return <div className={cx('separator')} />;
};

export default Separator;
