import React, { FunctionComponent, MutableRefObject, RefObject } from 'react';
import { d3ScaleLinear } from 'types/TP';
import DopeSheet from './DopeSheet';

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentPlayBarTime: MutableRefObject<number>;
  dopeSheetScale: MutableRefObject<d3ScaleLinear | null>;
}

const TimeEditor: FunctionComponent<Props> = (props) => {
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
