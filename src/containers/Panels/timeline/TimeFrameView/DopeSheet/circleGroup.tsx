import React, { useEffect, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import * as d3 from 'd3';
import Circles from './circles';
import { storeTPCurrnetClickedTrack } from 'lib/store';
import { TP_TRACK_INDEX } from 'utils/const';
import { TPDopeSheet } from 'types/TP';

interface Props {
  dopeSheetData: TPDopeSheet;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const SELECTED_COLOR = 'rgba(55, 133, 247, 10%)';

const CircleGroup: React.FC<Props> = ({ dopeSheetData, prevXScale }) => {
  const [isDisplayed, setIsDisplayed] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const circleGroupRef = useRef<SVGSVGElement>(null);
  const currentClickedTrack = useReactiveVar(storeTPCurrnetClickedTrack);

  useEffect(() => {
    setIsSelected(dopeSheetData.isSelected);
  }, [dopeSheetData]);

  useEffect(() => {
    if (currentClickedTrack) {
      const trackIndex = dopeSheetData.trackIndex;
      const remainder = trackIndex % 10;
      switch (remainder) {
        case TP_TRACK_INDEX.BONE_A:
        case TP_TRACK_INDEX.BONE_B: {
          if (currentClickedTrack.trackIndex % 10 === 1) {
            setIsDisplayed(currentClickedTrack.isClickedArrow);
          }
          break;
        }
        case TP_TRACK_INDEX.POSITION_A:
        case TP_TRACK_INDEX.POSITION_B:
        case TP_TRACK_INDEX.ROTATION_A:
        case TP_TRACK_INDEX.ROTATION_B:
        case TP_TRACK_INDEX.SCALE_A:
        case TP_TRACK_INDEX.SCALE_B: {
          if (
            currentClickedTrack.trackIndex % 10 === 1 ||
            currentClickedTrack.trackIndex % 10 === 2
          ) {
            setIsDisplayed(currentClickedTrack.isClickedArrow);
          }
          break;
        }
        default: {
          break;
        }
      }
    }
  }, [currentClickedTrack, dopeSheetData.trackIndex]);

  return (
    <svg
      className="circle-group"
      width="100%"
      height={TRACK_HEIGHT}
      ref={circleGroupRef}
      style={{ display: isDisplayed ? 'block' : 'none' }}
    >
      {/* <title style={{ display: 'none' }}>{dopeSheetData.trackIndex}</title> */}
      <rect
        width="100%"
        height={TRACK_HEIGHT}
        fill={isSelected ? SELECTED_COLOR : 'transparent'}
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
