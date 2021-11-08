import { FunctionComponent } from 'react';
import AnimationButtons from './AnimationButtons';
import FasterDropdown from './FasterDropdown';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const TransportControls: FunctionComponent<Props> = () => {
  return (
    <div className={cx('transport-controls')}>
      <AnimationButtons />
      <FasterDropdown />
    </div>
  );
};

export default TransportControls;
