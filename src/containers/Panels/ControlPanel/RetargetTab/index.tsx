import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const RetargetTab: FunctionComponent = () => {
  return <div className={cx('panel-wrap')}></div>;
};

export default memo(RetargetTab);
