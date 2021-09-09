import { FunctionComponent } from 'react';
import ChangeModes from './ChangeModes';
import LoopRange from './LoopRange';
import PlayAnimations from './PlayAnimations';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const MiddleBarBody: FunctionComponent<Props> = () => {
  return (
    <div className={cx('body')}>
      <LoopRange />
      <PlayAnimations />
      <ChangeModes />
    </div>
  );
};

export default MiddleBarBody;
