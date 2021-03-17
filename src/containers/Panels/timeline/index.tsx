import React from 'react';
import classNames from 'classnames/bind';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import { PlayBar } from 'containers/PlayBar';

const cx = classNames.bind(styles);

interface Props {
  data?: THREE.KeyframeTrack[];
}

const TimelineContainer: React.FC<Props> = ({ data = [] }) => {
  return (
    <>
      <div className={cx('timeline-panel')}>
        <PlayBar />
        <TimelineWrapper />
      </div>
    </>
  );
};

export default TimelineContainer;
