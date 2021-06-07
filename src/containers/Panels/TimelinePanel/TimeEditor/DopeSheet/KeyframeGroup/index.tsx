import React, { FunctionComponent, memo, useMemo, useRef } from 'react';
import _ from 'lodash';
import { useSelector } from 'reducers';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetLayerTrackIndex } from 'utils/TP/trackUtils';
import { d3ScaleLinear } from 'types/TP';
import Keyframes from './Keyframes';

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

const KeyframeGroup: FunctionComponent<Props> = ({
  dopeSheetScale,
  isLocked,
  isSelected,
  layerKey,
  times,
  trackIndex,
  trackName,
}) => {
  const currentClickedTrack = useSelector((state) => state.timeline.currentClickedTrack);
  const keyframeGroupRef = useRef<SVGSVGElement>(null);
  const trackColor = useMemo(() => {
    if (isSelected && trackIndex % 10 !== TP_TRACK_INDEX.SUMMARY) {
      switch (trackIndex % 10) {
        case TP_TRACK_INDEX.LAYER:
          return SELECTED_COLOR.layer;
        case TP_TRACK_INDEX.BONE:
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
      case TP_TRACK_INDEX.BONE: {
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
    <svg className="keyframe-group" width="100%" height={TRACK_HEIGHT} ref={keyframeGroupRef}>
      <rect width="100%" height={TRACK_HEIGHT} fill={trackColor} strokeDasharray="100, 50" />
      <Keyframes
        dopeSheetScale={dopeSheetScale}
        isLocked={isLocked}
        layerKey={layerKey}
        keyframeGroupRef={keyframeGroupRef}
        times={times}
        trackIndex={trackIndex}
        trackName={trackName}
      />
    </svg>
  );
};

export default memo(KeyframeGroup, (prev, next) => {
  const { times: prevTimes, isLocked: prevIsLocked, isSelected: prevIsSelected } = prev;
  const { times: nextTimes, isLocked: nextIsLocked, isSelected: nextIsSelected } = next;
  if (!_.isEqual(prevTimes, nextTimes)) return false;
  if (!_.isEqual(prevIsLocked, nextIsLocked)) return false;
  if (!_.isEqual(prevIsSelected, nextIsSelected)) return false;
  return true;
});
