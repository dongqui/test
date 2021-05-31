import React, { MutableRefObject, RefObject, useRef } from 'react';
import dynamic from 'next/dynamic';
import { d3ScaleLinear } from 'types/TP';

// const DynamicDopeSheet = dynamic(() => import('./DopeSheet'));
const DynamicDopeSheet = dynamic(() => import('./New_DopeSheet'));

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimeEditor: React.FC<Props> = ({
  currentTimeIndexRef,
  currentTimeRef,
  currentXAxisPosition,
  prevXScale,
}) => {
  return (
    // <DynamicDopeSheet
    //   currentTimeRef={currentTimeRef}
    //   currentTimeIndexRef={currentTimeIndexRef}
    //   currentXAxisPosition={currentXAxisPosition}
    //   prevXScale={prevXScale}
    // />
    <DynamicDopeSheet />
  );
};

export default TimeEditor;
