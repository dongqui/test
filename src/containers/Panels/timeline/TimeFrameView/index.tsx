import React from 'react';
import DopeSheet from './DopeSheet';

interface Props {
  rescaleDopeSheetCircleX: (rescale: () => void) => void;
}

const TimeFrameView: React.FC<Props> = ({ rescaleDopeSheetCircleX }) => {
  return <DopeSheet rescaleDopeSheetCircleX={rescaleDopeSheetCircleX} />;
};

export default TimeFrameView;
