import React, { memo, useRef } from 'react';
import _ from 'lodash';
import { useSelector } from 'reducers';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetLayerTrackIndex } from 'utils/TP/New';
import Circles from './Circles';

interface Props {
  isLocked: boolean;
  isSelected: boolean;
  layerKey: string;
  times: number[];
  trackIndex: number;
  trackName: string;
  dopeSheetScale: d3.ScaleLinear<number, number, never>;
}

const TRACK_HEIGHT = 32; // 트랙 높이
const SELECTED_COLOR = {
  layer: '#4e452b',
  bone: '#373226',
  transform: '#2b2823',
};

const CircleGroup: React.FC<Props> = ({
  isLocked,
  isSelected,
  layerKey,
  times,
  trackName,
  trackIndex,
  dopeSheetScale,
}) => {
  const currentClickedTrack = useSelector((state) => state.timeline.currentClickedTrack);
  const circleGroupRef = useRef<SVGSVGElement>(null);

  let fillColor = 'transparent';
  if (isSelected) {
    switch (trackIndex % 10) {
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

  if (currentClickedTrack.trackIndex !== 0) {
    const remainder = trackIndex % 10;
    const isSummaryTrack = currentClickedTrack.trackIndex === TP_TRACK_INDEX.SUMMARY;
    const isClosed = !currentClickedTrack.isPointedDownArrow;
    switch (remainder) {
      case TP_TRACK_INDEX.SUMMARY:
      case TP_TRACK_INDEX.LAYER: {
        break;
      }
      case TP_TRACK_INDEX.BONE_A:
      case TP_TRACK_INDEX.BONE_B: {
        if (isSummaryTrack && isClosed) {
          return null;
        }
        break;
      }
      default: {
        const layerIndex = fnGetLayerTrackIndex({ trackIndex });
        const isLayerTrack = layerIndex === currentClickedTrack.trackIndex;
        if (isClosed && (isSummaryTrack || isLayerTrack)) {
          return null;
        }
        break;
      }
    }
  }

  return (
    <svg className="circle-group" width="100%" height={TRACK_HEIGHT} ref={circleGroupRef}>
      <rect width="100%" height={TRACK_HEIGHT} fill={fillColor} strokeDasharray="100, 50" />
      <Circles
        circleGroupRef={circleGroupRef}
        isLocked={isLocked}
        layerKey={layerKey}
        times={times}
        trackIndex={trackIndex}
        trackName={trackName}
        dopeSheetScale={dopeSheetScale}
      />
    </svg>
  );
};

export default memo(CircleGroup, (prev, next) => {
  const { times: prevTimes, isLocked: prevIsLocked, isSelected: prevIsSelected } = prev;
  const { times: nextTimes, isLocked: nextIsLocked, isSelected: nextIsSelected } = next;
  if (!_.isEqual(prevTimes, nextTimes)) return false;
  if (!_.isEqual(prevIsLocked, nextIsLocked)) return false;
  if (!_.isEqual(prevIsSelected, nextIsSelected)) return false;
  return true;
});
