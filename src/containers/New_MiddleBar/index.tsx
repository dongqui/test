import { FunctionComponent, memo } from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface Props {}

const MiddleBar: FunctionComponent<Props> = () => {
  return <div className={cx('wrapper')}></div>;
};

export default memo(MiddleBar);
