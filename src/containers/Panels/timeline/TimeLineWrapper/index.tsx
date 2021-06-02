import React, { FunctionComponent, MutableRefObject, RefObject, useEffect, useRef } from 'react';
import _ from 'lodash';
import TrackList from '../TrackList';
import TimeFrameView from '../TimeFrameView';
import { d3ScaleLinear } from 'types/TP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimelineWrapper: FunctionComponent<Props> = ({
  currentTimeRef,
  currentTimeIndexRef,
  currentXAxisPosition,
  prevXScale,
}) => {
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
