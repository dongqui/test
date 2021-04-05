import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Circles from './circles';
import { TPDopeSheet } from 'types/TP';

interface Props {
  dopeSheetData: TPDopeSheet;
  layerDopeSheetData: TPDopeSheet;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const SELECTED_COLOR = 'rgba(55, 133, 247, 10%)';

const CircleGroup: React.FC<Props> = ({ dopeSheetData, prevXScale }) => {
  const [isSelected, setIsSelected] = useState(false);
  const circleGroupRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setIsSelected(dopeSheetData.isSelected);
  }, [dopeSheetData]);

  return (
    <svg className="circle-group" width="100%" height={TRACK_HEIGHT} ref={circleGroupRef}>
      <rect
        width="100%"
        height={TRACK_HEIGHT}
        fill={isSelected ? SELECTED_COLOR : '#151515'}
        strokeDasharray="100, 50"
      />
      <Circles
        circleGroupRef={circleGroupRef}
        dopeSheetData={dopeSheetData}
        prevXScale={prevXScale}
      />
    </svg>
  );
};

export default CircleGroup;
