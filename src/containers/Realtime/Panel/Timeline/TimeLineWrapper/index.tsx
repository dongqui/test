import React, { MutableRefObject, RefObject, useEffect, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import TrackList from '../TrackList';
import TimeFrameView from '../TimeFrameView';
import styles from './index.module.scss';
import { d3ScaleLinear } from 'types/TP';

const cx = classNames.bind(styles);

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimelineWrapper: React.FC<Props> = (props) => {
  const { currentTimeRef, currentTimeIndexRef, currentXAxisPosition, prevXScale } = props;

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
      <div id="timeline-wrapper" className={cx('timeline-wrapper')} ref={timelineWrapperRef}>
        <TrackList trackListRef={trackListRef} />
        <TimeFrameView
          timelineWrapperRef={timelineWrapperRef}
          currentTimeRef={currentTimeRef}
          currentTimeIndexRef={currentTimeIndexRef}
          currentXAxisPosition={currentXAxisPosition}
          prevXScale={prevXScale}
        />
      </div>
    </>
  );
};

export default TimelineWrapper;
