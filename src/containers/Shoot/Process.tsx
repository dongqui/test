import { FunctionComponent } from 'react';
import { Video } from 'components/Video';
import classNames from 'classnames/bind';
import styles from './Process.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Process: FunctionComponent<Props> = ({}) => {
  return (
    <div className={cx('wrapper')}>
      <Video src="/video/loadingVideo.mp4" autoPlay loop fullSize />
    </div>
  );
};

export default Process;
