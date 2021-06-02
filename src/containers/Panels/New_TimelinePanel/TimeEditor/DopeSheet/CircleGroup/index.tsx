import React, { memo, useEffect, useMemo, useRef } from 'react';
import _ from 'lodash';
import { useSelector } from 'reducers';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetLayerTrackIndex } from 'utils/TP/New';
import { d3ScaleLinear } from 'types/TP';
import Circles from './Circles';

interface Props {
  dopeSheetScale: d3ScaleLinear;
  isLocked: boolean;
  isSelected: boolean;
  layerKey: string;
  times: number[];
  trackIndex: number;
  trackName: string;
}

const SELECTED_COLOR = {
  layer: '#4e452b',
  bone: '#373226',
  transform: '#2b2823',
};
const TRACK_HEIGHT = 32;

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
  const trackColor = useMemo(() => {
    if (isSelected && trackIndex % 10 !== TP_TRACK_INDEX.SUMMARY) {
      switch (trackIndex % 10) {
        case TP_TRACK_INDEX.LAYER:
          return SELECTED_COLOR.layer;
        case TP_TRACK_INDEX.BONE_A:
        case TP_TRACK_INDEX.BONE_B:
          return SELECTED_COLOR.bone;
        default:
          return SELECTED_COLOR.transform;
      }
    }
    return 'transparent';
  }, [isSelected, trackIndex]);

  if (currentClickedTrack.trackIndex !== 0) {
    const remainder = trackIndex % 10;
    const isSummaryTrack = currentClickedTrack.trackIndex === TP_TRACK_INDEX.SUMMARY;
    const isClosedTrack = !currentClickedTrack.isPointedDownArrow;
    switch (remainder) {
      case TP_TRACK_INDEX.SUMMARY:
      case TP_TRACK_INDEX.LAYER: {
        break;
      }
      case TP_TRACK_INDEX.BONE_A:
      case TP_TRACK_INDEX.BONE_B: {
        if (isClosedTrack && isSummaryTrack) return null;
        break;
      }
      default: {
        const layerIndex = fnGetLayerTrackIndex({ trackIndex });
        const isLayerTrack = layerIndex === currentClickedTrack.trackIndex;
        if (isClosedTrack && (isSummaryTrack || isLayerTrack)) return null;
        break;
      }
    }
  }

  return (
    <svg className="circle-group" width="100%" height={TRACK_HEIGHT} ref={circleGroupRef}>
      <rect width="100%" height={TRACK_HEIGHT} fill={trackColor} strokeDasharray="100, 50" />
      <Circles
        circleGroupRef={circleGroupRef}
        dopeSheetScale={dopeSheetScale}
        isLocked={isLocked}
        layerKey={layerKey}
        times={times}
        trackIndex={trackIndex}
        trackName={trackName}
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
