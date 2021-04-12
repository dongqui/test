import { FunctionComponent, ReactNode } from 'react';
import classNames from 'classnames/bind';
import styles from './Tab.module.scss';

const cx = classNames.bind(styles);

interface Props {
  title: string;
  children: ReactNode;
}

const Tab: FunctionComponent<Props> = ({ children }) => {
  return <div className={cx('tab-wrap')}>{children}</div>;
};

export default Tab;
