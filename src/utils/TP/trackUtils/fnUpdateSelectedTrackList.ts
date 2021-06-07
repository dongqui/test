import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { TPLastBone, UpdatedTrack } from 'types/TP';

interface FnUpdateSelectedTrackList {
  isSelected: boolean;
  lastBoneOfLayers: TPLastBone[];
  trackIndex: number;
}

type Return = [UpdatedTrack<'isSelected'>[], number[]];

/**
 * 클릭 된 트랙과 그 자식들에게 선택 효과를 적용하는 함수입니다.
 *
 * @param isSelected
 * @param lastBoneOfLayers
 * @param trackIndex
 * @return UpdatedTrack<'isSelected'>[] - isSelected를 변경시킬 track list들
 * @return number[] - 선택 효과가 적용 된 트랙의 index들
 */

const fnUpdateSelectedTrackList = ({
  isSelected,
  lastBoneOfLayers,
  trackIndex,
}: FnUpdateSelectedTrackList): Return => {
  const remainder = trackIndex % 10;
  const selectedTracks: UpdatedTrack<'isSelected'>[] = [];
  const selectedIndexes = [];

  switch (remainder) {
    case TP_TRACK_INDEX.LAYER: {
      const targetLayerIndex = fnGetBinarySearch({
        collection: lastBoneOfLayers,
        index: trackIndex,
        key: 'layerIndex',
      });
      const lastBone = lastBoneOfLayers[targetLayerIndex];
      const lastTransformIndex = lastBone.lastBoneIndex + 3;
      let currentTrackIndex = lastBone.layerIndex + 1;

      selectedIndexes.push(trackIndex);
      selectedTracks.push({
        trackIndex,
        isSelected,
      });
      while (currentTrackIndex <= lastTransformIndex) {
        selectedIndexes.push(currentTrackIndex);
        selectedTracks.push({
          trackIndex: currentTrackIndex,
          isSelected,
        });
        const nextTrackIndex = currentTrackIndex % 10 === TP_TRACK_INDEX.SCALE ? 7 : 1; // 6 -> 13, 16 -> 23
        currentTrackIndex += nextTrackIndex;
      }
      return [selectedTracks, selectedIndexes];
    }
    case TP_TRACK_INDEX.BONE: {
      selectedIndexes.push(trackIndex);
      selectedTracks.push({
        trackIndex,
        isSelected,
      });
      for (
        let transformIndex = trackIndex + 1;
        transformIndex <= trackIndex + 3;
        transformIndex += 1
      ) {
        selectedIndexes.push(transformIndex);
        selectedTracks.push({
          trackIndex: transformIndex,
          isSelected,
        });
      }
      return [selectedTracks, selectedIndexes];
    }
    default: {
      selectedIndexes.push(trackIndex);
      selectedTracks.push({
        trackIndex,
        isSelected,
      });
      return [selectedTracks, selectedIndexes];
    }
  }
};

export default fnUpdateSelectedTrackList;
