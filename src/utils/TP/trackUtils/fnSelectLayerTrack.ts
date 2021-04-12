import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { TPDopeSheet, TPLastBone } from 'types/TP';
interface FnSelectLayerTrack {
  isSelected: boolean;
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

type Return = [Partial<TPDopeSheet>[], number[]];

/**
 * 선택 한 트랙이 Layer인 경우, 클릭 한 Layer와 하위 트랙들에 선택 효과를 적용시키는 함수입니다.
 *
 * @param isSelected - 선택 효과를 줄 경우 true. 선택 효과를 해제 할 경우 false
 * @param lastBoneList - layer의 마지막 bone을 저장하는 리스트
 * @param trackIndex - 클릭 한 트랙 index
 *
 * @returns updatedTrackList - dope sheet list에서 상태값을 update시킬 트랙 리스트
 * @returns newClickedTrackList - 새로 선택 효과를 적용시킬 트랙 리스트(number[])
 */

const fnSelectLayerTrack = ({
  isSelected,
  lastBoneList,
  trackIndex,
}: FnSelectLayerTrack): Return => {
  const updatedTrackList: Partial<TPDopeSheet>[] = [];
  const newClickedTrackList = [];

  const targetIndex = fnGetBinarySearch({
    collection: lastBoneList,
    index: trackIndex,
    key: 'layerIndex',
  });
  const lastBone = lastBoneList[targetIndex];
  let currentIndex = lastBone.layerIndex + 1;

  // 클릭한 layer에 선택 효과 적용
  if (trackIndex) newClickedTrackList.push(trackIndex);
  updatedTrackList.push({
    trackIndex,
    isSelected,
  });

  // layer 하위 트랙에 선택 효과 적용
  while (currentIndex <= lastBone.lastBoneIndex + 3) {
    updatedTrackList.push({
      trackIndex: currentIndex,
      isSelected,
    });
    if (trackIndex) newClickedTrackList.push(currentIndex);
    currentIndex += 1;
    if ((currentIndex - 1) % 10 === 0) currentIndex += 2;
  }

  return [updatedTrackList, newClickedTrackList];
};

export default fnSelectLayerTrack;
