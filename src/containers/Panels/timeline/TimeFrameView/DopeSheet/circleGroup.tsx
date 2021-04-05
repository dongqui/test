import React, { memo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Circles from './circles';
import { TPDopeSheet } from 'types/TP';

interface Props {
  dopeSheetData: TPDopeSheet;
  layerDopeSheetData: TPDopeSheet;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const CIRCLE_RADIUS = 4; // 원 반지름 크기

const CircleGroup: React.FC<Props> = ({ dopeSheetData, layerDopeSheetData, prevXScale }) => {
  const circleGroupRef = useRef<SVGSVGElement>(null);

  // useEffect(() => {
  //   const trackIndex = dopeSheetData.trackIndex;
  //   const layerIndex = layerDopeSheetData.trackIndex;
  //   const remainder = trackIndex % 10;

  //   if() {

  //   }
  // }, [dopeSheetData, layerDopeSheetData]);

  return (
    <svg className="circle-group" width="100%" height={TRACK_HEIGHT} ref={circleGroupRef}>
      <title style={{ display: 'none' }}>{dopeSheetData.trackIndex}</title>
      <rect width="100%" height={TRACK_HEIGHT} fill="#151515" strokeDasharray="100, 50" />
      <Circles
        circleGroupRef={circleGroupRef}
        dopeSheetData={dopeSheetData}
        prevXScale={prevXScale}
      />
    </svg>
  );
};

export default CircleGroup;
