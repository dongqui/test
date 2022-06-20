import { SvgPath } from 'components/Icon';
import { IconButton } from 'components/Button';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const MiddleBar = ({}: Props) => {
  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')}>
        <div className={cx('button-group')}>
          <IconButton icon={SvgPath.CameraRecord} type="negative" />
          <IconButton icon={SvgPath.CameraPlay} type="ghost" />
          <IconButton icon={SvgPath.CameraPause} type="ghost" />
        </div>
      </div>
    </div>
  );
};

export default MiddleBar;
