import React, { MutableRefObject, RefObject } from 'react';
import dynamic from 'next/dynamic';
import { d3ScaleLinear } from 'types/TP';
import DopeSheet from './DopeSheet';

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentPlayBarTime: MutableRefObject<number>;
  dopeSheetScale: MutableRefObject<d3ScaleLinear | null>;
}

const TimeEditor: React.FC<Props> = (props) => {
  const { currentTimeIndexRef, currentTimeRef, currentPlayBarTime, dopeSheetScale } = props;
  return (
    <DopeSheet
      currentTimeIndexRef={currentTimeIndexRef}
      currentTimeRef={currentTimeRef}
      currentPlayBarTime={currentPlayBarTime}
      dopeSheetScale={dopeSheetScale}
    />
  );
};

export default TimeEditor;
