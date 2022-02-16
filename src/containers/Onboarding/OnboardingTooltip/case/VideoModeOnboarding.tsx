import { Fragment } from 'react';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const VideoModeOnboarding = () => {
  return (
    <Fragment>
      <h3 className={cx('title')}>Shift to the video mode</h3>
      <p className={cx('body')}>
        Directly record a video with your webcam to <br />
        <span className={cx('highlight')}>extract the motion data.</span>
      </p>
    </Fragment>
  );
};

export default VideoModeOnboarding;
