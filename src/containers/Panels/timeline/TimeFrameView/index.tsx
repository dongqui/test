import React from 'react';
import dynamic from 'next/dynamic';

const DynamicDopeSheet = dynamic(() => import('./DopeSheet'));

interface Props {
  timelineWrapperRef: React.RefObject<HTMLDivElement>;
}

const TimeFrameView: React.FC<Props> = ({ timelineWrapperRef }) => {
  return <DynamicDopeSheet timelineWrapperRef={timelineWrapperRef} />;
};

export default TimeFrameView;
