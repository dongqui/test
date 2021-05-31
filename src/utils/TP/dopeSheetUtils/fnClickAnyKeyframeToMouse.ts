import { TPTrackList, TPLastBone, KeyframeData } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnClickBoneKeyframe, fnClickLayerKeyframe } from './index';

interface FnClickAnyKeyframeToMouse {
  dopeSheetList: TPTrackList[];
  lastBoneList: TPLastBone[];
  layerKey: string;
  time: number;
  trackName: string;
  trackIndex: number;
  isLocked: boolean;
}

const fnClickAnyKeyframeToMouse = ({
  dopeSheetList,
  lastBoneList,
  layerKey,
  time,
  trackIndex,
  trackName,
  isLocked,
}: FnClickAnyKeyframeToMouse) => {
  const clickedKeyframes: KeyframeData[] = [];
  const remainder = trackIndex % 10;

  switch (remainder) {
    // Layer 트랙인 경우
    case TP_TRACK_INDEX.LAYER: {
      const keyframes = fnClickLayerKeyframe({
        dopeSheetList,
        lastBoneList,
        layerKey,
        time,
        trackIndex,
        trackName,
      });
      clickedKeyframes.push(...keyframes);
      break;
    }

    // Bone 트랙인 경우
    case TP_TRACK_INDEX.BONE_A:
    case TP_TRACK_INDEX.BONE_B: {
      const keyframes = fnClickBoneKeyframe({
        dopeSheetList,
        layerKey,
        time,
        trackIndex,
      });
      clickedKeyframes.push(...keyframes);
      break;
    }

    // Transform 트랙인 경우
    default: {
      clickedKeyframes.push({
        isTransformTrack: true,
        isLocked,
        key: `${layerKey}&&${trackName}&&${time}`,
        trackIndex,
        trackName,
        layerKey,
        time,
      });
      break;
    }
  }

  return clickedKeyframes;
};

export default fnClickAnyKeyframeToMouse;
