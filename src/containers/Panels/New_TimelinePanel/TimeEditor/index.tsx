import React from 'react';
import dynamic from 'next/dynamic';

// const DynamicDopeSheet = dynamic(() => import('./DopeSheet'));
const DynamicDopeSheet = dynamic(() => import('./New_DopeSheet'));

interface Props {}

const TimeEditor: React.FC<Props> = () => {
  return <DynamicDopeSheet />;
};

export default TimeEditor;
