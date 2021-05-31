import _ from 'lodash';
import { TPTrackList, TPLastBone } from 'types/TP';
import { fnSelectTrackList, fnGetBinarySearch } from 'utils/TP/trackUtils';
import { TP_TRACK_INDEX } from 'utils/const';

interface FnCheckSelectedTrackList {
  clickedTrackList: number[];
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

type Return = [Partial<TPTrackList>[], number[]] | false;

const fnCheckSelectedTrackList = ({
  clickedTrackList,
  lastBoneList,
  trackIndex,
}: FnCheckSelectedTrackList): Return => {
  const {
    LAYER,
    POSITION_A,
    POSITION_B,
    ROTATION_A,
    ROTATION_B,
    SCALE_A,
    SCALE_B,
  } = TP_TRACK_INDEX;
  const updatedTrackList: Partial<TPTrackList>[] = [];
  const newClickedTrackList: number[] = [];

  const numberBinarySearch = ({ collection, index }: { collection: number[]; index: number }) => {
    const size = collection.length;
    let left = 0;
    let right = size - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (collection[mid] === index) {
        return mid;
      } else if (collection[mid] > index) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return -1;
  };

  for (let index = 0; index < clickedTrackList.length; index += 1) {
    const targetTrackIndex = clickedTrackList[index];

    // 다른 레이어에서 선택 적용 된 트랙이 있는 경우(모달 창 발생)
    if (Math.floor(targetTrackIndex / 10000) !== Math.floor(trackIndex / 10000)) {
      return false;
    }

    // 선택 효과가 적용 된 본인 트랙을 클릭 할 경우(선택 효과 제거)
    if (clickedTrackList[index] === trackIndex) {
      const remiander = trackIndex % 10;
      const [updatedList, newClickedList] = fnSelectTrackList({
        isSelected: false,
        lastBoneList,
        trackIndex,
      });
      const filtered = _.filter(clickedTrackList, (clickedIndex) => {
        const included = numberBinarySearch({ collection: newClickedList, index: clickedIndex });
        return included === -1;
      });
      updatedTrackList.push(...updatedList);
      newClickedTrackList.push(...filtered);

      // 상위 트랙인 Layer에 선택 효과 제거
      if (remiander !== LAYER) {
        const layerIndex = _.floor(trackIndex / 10000) * 10000 + 2;
        const targetIndex = fnGetBinarySearch({
          collection: lastBoneList,
          index: layerIndex,
          key: 'layerIndex',
        });
        const layerTrack = lastBoneList[targetIndex];
        if (layerTrack) {
          updatedTrackList.push({
            trackIndex: layerTrack.layerIndex,
            isSelected: false,
          });
        }

        // Position 트랙을 클릭 한 경우, 상위 트랙인 Bone에 선택 효과 제거
        if (remiander === POSITION_A || remiander === POSITION_B) {
          updatedTrackList.push({
            trackIndex: trackIndex - 1,
            isSelected: false,
          });
        }
        // Rotataion 트랙을 클릭 한 경우, 상위 트랙인 Bone에 선택 효과 제거
        else if (remiander === ROTATION_A || remiander === ROTATION_B) {
          updatedTrackList.push({
            trackIndex: trackIndex - 2,
            isSelected: false,
          });
        }
        // Scale 트랙을 클릭 한 경우, 상위 트랙인 Bone에 선택 효과 제거
        else if (remiander === SCALE_A || remiander === SCALE_B) {
          updatedTrackList.push({
            trackIndex: trackIndex - 3,
            isSelected: false,
          });
        }
      }
      return [updatedTrackList, newClickedTrackList];
    }
  }

  // 중간에 for문이 return되지 않고 끝까지 순회했을 경우, 선택 적용 된 리스트에 클릭한 트랙 리스트 추가
  const [updatedList, newClickedList] = fnSelectTrackList({
    isSelected: true,
    lastBoneList,
    trackIndex,
  });
  updatedTrackList.push(...updatedList);
  newClickedTrackList.push(...clickedTrackList, ...newClickedList);
  return [updatedTrackList, newClickedTrackList];
};

export default fnCheckSelectedTrackList;
