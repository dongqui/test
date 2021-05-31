import React, { useEffect, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import * as d3 from 'd3';
import _ from 'lodash';
import Circles from './circles';
import { storeTPCurrnetClickedTrack } from 'lib/store';
import { TP_TRACK_INDEX } from 'utils/const';
import { TPTrackList } from 'types/TP';

interface Props {
  dopeSheetData: TPTrackList;
  prevXScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const SELECTED_COLOR = {
  layer: '#4e452b',
  bone: '#373226',
  transform: '#2b2823',
};

const CircleGroup: React.FC<Props> = ({ dopeSheetData, prevXScale }) => {
  const [isDisplayed, setIsDisplayed] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const circleGroupRef = useRef<SVGSVGElement>(null);
  const currentClickedTrack = useReactiveVar(storeTPCurrnetClickedTrack);

  // 선택 효과 적용
  useEffect(() => {
    setIsSelected(dopeSheetData.isSelected);
  }, [dopeSheetData]);

  // 조부모 트랙이 접혔을 때 같이 접히도록 적용
  useEffect(() => {
    if (currentClickedTrack) {
      const trackIndex = dopeSheetData.trackIndex;
      const remainder = trackIndex % 10;
      switch (remainder) {
        case TP_TRACK_INDEX.BONE_A:
        case TP_TRACK_INDEX.BONE_B: {
          if (currentClickedTrack.trackIndex === 1) {
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
          const { trackIndex, isClickedArrow } = currentClickedTrack;
          const layerIndex = _.floor(trackIndex / 10000);
          const targetIndex = _.floor(dopeSheetData.trackIndex / 10000);
          if (trackIndex === 1) {
            setIsDisplayed(isClickedArrow);
          } else if (trackIndex % 10 === 2 && layerIndex === targetIndex) {
            setIsDisplayed(isClickedArrow);
          }
          break;
        }
        default: {
          break;
        }
      }
    }
  }, [currentClickedTrack, dopeSheetData]);

  let fillColor = 'transparent';
  if (isSelected) {
    switch (dopeSheetData.trackIndex % 10) {
      case 2:
        fillColor = SELECTED_COLOR.layer;
        break;
      case 3:
      case 7:
        fillColor = SELECTED_COLOR.bone;
        break;
      case 4:
      case 5:
      case 6:
      case 8:
      case 9:
      case 0:
        fillColor = SELECTED_COLOR.transform;
        break;
      default:
        break;
    }
  }

  return (
    <svg
      className="circle-group"
      width="100%"
      height={TRACK_HEIGHT}
      ref={circleGroupRef}
      style={{ display: isDisplayed ? 'block' : 'none' }}
    >
      {/* <title style={{ display: 'none' }}>{dopeSheetData.trackIndex}</title> */}
      <rect width="100%" height={TRACK_HEIGHT} fill={fillColor} strokeDasharray="100, 50" />
      <Circles
        circleGroupRef={circleGroupRef}
        dopeSheetData={dopeSheetData}
        prevXScale={prevXScale}
      />
    </svg>
  );
};

export default CircleGroup;
