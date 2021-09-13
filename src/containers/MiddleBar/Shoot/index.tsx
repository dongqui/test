import { FunctionComponent } from 'react';
import MiddleBarBody from './MiddleBarBody';
import MiddleBarHeader from './MiddleBarHeader';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const MiddleBar: FunctionComponent<Props> = () => {
  return (
    <div className={cx('middle-bar')}>
      <MiddleBarHeader />
      <MiddleBarBody />
    </div>
  );
};

export default MiddleBar;
