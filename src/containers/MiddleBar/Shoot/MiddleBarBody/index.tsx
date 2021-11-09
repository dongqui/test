import { FunctionComponent } from 'react';
import ChangeModes from './ChangeModes';
import Loop from './Loop';
import TransportControls from './TransportControls';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const MiddleBarBody: FunctionComponent<Props> = () => {
  return (
    <div className={cx('body')}>
      <Loop />
      <TransportControls />
      <ChangeModes />
    </div>
  );
};

export default MiddleBarBody;
