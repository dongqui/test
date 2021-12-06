import ChangeModes from './ChangeModes';
import Loop from './Loop';
import TransportControls from './TransportControls';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MiddleBarBody = () => {
  return (
    <div className={cx('body')}>
      <Loop />
      <TransportControls />
      <ChangeModes />
    </div>
  );
};

export default MiddleBarBody;
