import { FunctionComponent } from 'react';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const LPBody: FunctionComponent<Props> = () => {
  return <div className={cx('wrapper')}></div>;
};

export default LPBody;
