import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import TrackList from './TrackList';
import TimeFrameView from './TimeFrameView';
import styles from './TimeLineWrapper.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const TimelineWrapper: React.FC<Props> = () => {
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const trackListRef = useRef<HTMLDivElement>(null);

  // 트랙 리스트에서 세로 스크롤 이벤트 방지
  useEffect(() => {
    if (!timelineWrapperRef.current || !trackListRef.current) return;
    const timelineWrapper = timelineWrapperRef.current;
    const trackList = trackListRef.current;

    const wheelTimeLineWrapper = (event: any) => {
      if (!trackList.contains(event.target)) event.preventDefault();
    };
    timelineWrapper.addEventListener('wheel', wheelTimeLineWrapper);
    return () => {
      timelineWrapper.removeEventListener('wheel', wheelTimeLineWrapper);
    };
  }, []);

  return (
    <>
      <div className={cx('timeline-wrapper')} ref={timelineWrapperRef}>
        <TrackList trackListRef={trackListRef} />
        <TimeFrameView />
      </div>
    </>
  );
};

export default TimelineWrapper;
