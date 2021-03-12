import React from 'react';
import classNames from 'classnames/bind';
import TrackList from './TrackList';
import TimeFrameView from './TimeFrameView';
import styles from './TimeLineWrapper.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const TimelineWrapper: React.FC<Props> = () => {
  return (
    <>
      <div className={cx('timeline-wrapper')}>
        <TrackList />
        <TimeFrameView />
      </div>
    </>
  );
};

export default TimelineWrapper;
