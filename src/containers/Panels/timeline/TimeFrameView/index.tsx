import React, { FunctionComponent, MutableRefObject, RefObject } from 'react';
import dynamic from 'next/dynamic';
import { d3ScaleLinear } from 'types/TP';

const DynamicDopeSheet = dynamic(() => import('./DopeSheet'));

interface Props {
  timelineWrapperRef: RefObject<HTMLDivElement>;
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimeFrameView: FunctionComponent<Props> = ({
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
