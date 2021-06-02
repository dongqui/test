import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { KeyframeData, TPTrackList, TPLastBone } from 'types/TP';

interface FnUpdateSelectedKeyframes {
  lastBoneOfLayers: TPLastBone[];
  time: number;
  trackIndex: number;
  trackList: TPTrackList[];
}

/**
 * 클릭 된 키프레임과 그 자식들에게 선택 효과를 적용하는 함수입니다.
 *
 * @param lastBoneOfLayers
 * @param time
 * @param trackIndex
 * @param trackList
 * @returns selectedKeyframes
 */

const fnUpdateSelectedKeyframes = (params: FnUpdateSelectedKeyframes) => {
  const { lastBoneOfLayers, time, trackIndex, trackList } = params;
  const remainder = trackIndex % 10;
  const selectedKeyframes: KeyframeData[] = [];
  switch (remainder) {
    case TP_TRACK_INDEX.LAYER: {
      const targetLayerIndex = fnGetBinarySearch({
        collection: lastBoneOfLayers,
        index: trackIndex,
        key: 'layerIndex',
      });
      const lastTransformIndex = lastBoneOfLayers[targetLayerIndex].lastBoneIndex + 3;
      let currentTrackIndex = trackIndex;
      while (currentTrackIndex <= lastTransformIndex) {
        const targetIndex = fnGetBinarySearch({
          collection: trackList,
          index: currentTrackIndex,
          key: 'trackIndex',
        });
        const targetTrack = trackList[targetIndex];
        selectedKeyframes.push({
          isLocked: targetTrack.isLocked,
          isTransformTrack: targetTrack.isTransformTrack,
          layerKey: targetTrack.layerKey,
          key: `${targetTrack.layerKey}&&${targetTrack.trackName}&&${time}`,
          time,
          trackIndex: targetTrack.trackIndex,
          trackName: targetTrack.trackName,
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
          layerKey: targetTrack.layerKey,
          key: `${targetTrack.layerKey}&&${targetTrack.trackName}&&${time}`,
          time,
          trackIndex: targetTrack.trackIndex,
          trackName: targetTrack.trackName,
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
        layerKey: targetTrack.layerKey,
        key: `${targetTrack.layerKey}&&${targetTrack.trackName}&&${time}`,
        time,
        trackIndex: targetTrack.trackIndex,
        trackName: targetTrack.trackName,
      });
      break;
    }
  }
  return selectedKeyframes;
};

export default fnUpdateSelectedKeyframes;
