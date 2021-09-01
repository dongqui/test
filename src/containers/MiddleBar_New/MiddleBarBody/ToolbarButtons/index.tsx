import React, { FunctionComponent } from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const ToolbarButtons: FunctionComponent<Props> = () => {
  return <div className={cx('toolbar-buttons')}></div>;
};

export default ToolbarButtons;
