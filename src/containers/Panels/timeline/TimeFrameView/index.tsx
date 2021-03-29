import React from 'react';
import dynamic from 'next/dynamic';

const DynamicDopeSheet = dynamic(() => import('./DopeSheet'));

interface Props {
  rescaleDopeSheetCircleX: (rescale: () => void) => void;
}

const TimeFrameView: React.FC<Props> = ({ rescaleDopeSheetCircleX }) => {
  return <DynamicDopeSheet rescaleDopeSheetCircleX={rescaleDopeSheetCircleX} />;
};

export default TimeFrameView;
