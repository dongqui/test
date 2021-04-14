import React, { MutableRefObject, RefObject } from 'react';
import dynamic from 'next/dynamic';
import { d3ScaleLinear } from 'types/TP';

const DynamicDopeSheet = dynamic(() => import('./DopeSheet'));

interface Props {
  timelineWrapperRef: RefObject<HTMLDivElement>;
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimeFrameView: React.FC<Props> = ({
  timelineWrapperRef,
  currentTimeRef,
  currentTimeIndexRef,
  currentXAxisPosition,
  prevXScale,
}) => {
  return (
    <DynamicDopeSheet
      timelineWrapperRef={timelineWrapperRef}
      currentXAxisPosition={currentXAxisPosition}
      currentTimeRef={currentTimeRef}
      currentTimeIndexRef={currentTimeIndexRef}
      prevXScale={prevXScale}
    />
  );
};

export default TimeFrameView;
