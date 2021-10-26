import InsertKeyframe from './InsertKeyframe';
import AutoKey from './AutoKey';
import SimpleMode from './SimpleMode';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const ChangeModes = () => {
  return (
    <div className={cx('change-modes')}>
      <SimpleMode />
      <InsertKeyframe />
      <AutoKey />
    </div>
  );
};

export default ChangeModes;
