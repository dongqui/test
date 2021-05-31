import { KeyframeData, TPTrackList, TPLastBone } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetBinarySearch } from './index';

interface FnUpdateSelectedKeyframes {
  lastBoneOfLayers: TPLastBone[];
  time: number;
  trackIndex: number;
  trackList: TPTrackList[];
}

const fnUpdateSelectedKeyframes = (params: FnUpdateSelectedKeyframes) => {
  const { lastBoneOfLayers, time, trackIndex, trackList } = params;
  const remainder = trackIndex % 10;
  const selectedKeyframes: KeyframeData[] = [];
  switch (remainder) {
    case TP_TRACK_INDEX.LAYER: {
      const targetIndex = fnGetBinarySearch({
        collection: lastBoneOfLayers,
        index: trackIndex,
        key: 'layerIndex',
      });
      const lastTransformIndex = lastBoneOfLayers[targetIndex].lastBoneIndex + 3;
      let currentTrackIndex = trackIndex;
      while (currentTrackIndex <= lastTransformIndex) {
        const targetIndex = fnGetBinarySearch({
          collection: trackList,
          index: currentTrackIndex,
          key: 'trackIndex',
        });
        const targetTrack = trackList[targetIndex];
        selectedKeyframes.push({
          isTransformTrack: targetTrack.isTransformTrack,
          isLocked: targetTrack.isLocked,
          key: `${targetTrack.layerKey}&&${targetTrack.trackName}&&${time}`,
          trackIndex: targetTrack.trackIndex,
          trackName: targetTrack.trackName,
          layerKey: targetTrack.layerKey,
          time,
        });
        if (currentTrackIndex % 10 === 0) currentTrackIndex += 2;
        currentTrackIndex += 1;
      }
      break;
    }
    case TP_TRACK_INDEX.BONE_A:
    case TP_TRACK_INDEX.BONE_B: {
      const targetIndex = fnGetBinarySearch({
        collection: trackList,
        index: trackIndex,
        key: 'trackIndex',
      });
      for (
        let currentTrackIndex = targetIndex;
        currentTrackIndex <= targetIndex + 3;
        currentTrackIndex += 1
      ) {
        const targetTrack = trackList[currentTrackIndex];
        selectedKeyframes.push({
          isTransformTrack: targetTrack.isTransformTrack,
          isLocked: targetTrack.isLocked,
          key: `${targetTrack.layerKey}&&${targetTrack.trackName}&&${time}`,
          trackIndex: targetTrack.trackIndex,
          trackName: targetTrack.trackName,
          layerKey: targetTrack.layerKey,
          time,
        });
      }
      break;
    }
    default: {
      const targetIndex = fnGetBinarySearch({
        collection: trackList,
        index: trackIndex,
        key: 'trackIndex',
      });
      const targetTrack = trackList[targetIndex];
      selectedKeyframes.push({
        isTransformTrack: true,
        isLocked: targetTrack.isLocked,
        key: `${targetTrack.layerKey}&&${targetTrack.trackName}&&${time}`,
        trackIndex: targetTrack.trackIndex,
        trackName: targetTrack.trackName,
        layerKey: targetTrack.layerKey,
        time,
      });
      break;
    }
  }
  return selectedKeyframes;
};

export default fnUpdateSelectedKeyframes;
