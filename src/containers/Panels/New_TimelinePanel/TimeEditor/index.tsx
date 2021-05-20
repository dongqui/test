import React, { MutableRefObject, RefObject } from 'react';
import dynamic from 'next/dynamic';
import { d3ScaleLinear } from 'types/TP';

// const DynamicDopeSheet = dynamic(() => import('./DopeSheet'));
const DynamicDopeSheet = dynamic(() => import('./New_DopeSheet'));

interface Props {
  panelWrapperRef: RefObject<HTMLDivElement>;
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimeEditor: React.FC<Props> = ({
  panelWrapperRef,
  currentTimeRef,
  currentTimeIndexRef,
  currentXAxisPosition,
  prevXScale,
}) => {
  return <DynamicDopeSheet />;
};

export default TimeEditor;
