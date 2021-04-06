import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { TPDopeSheet, TPLastBone } from 'types/TP';

/**
 * 선택 한 트랙이 Layer인 경우, 클릭 한 Layer와 하위 트랙들에 선택 효과를 적용시키는 함수입니다.
 *
 * @param lastBoneList - layer의 마지막 bone을 저장하는 리스트
 * @param trackIndex - 클릭 한 트랙 index
 *
 * @returns updatedTrackList - dope sheet list에서 상태값을 update시킬 트랙 리스트
 * @returns newClickedTrackList - 새로 선택 효과를 적용시킬 트랙 리스트(number[])
 */

interface Params {
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

type Return = [Partial<TPDopeSheet>[], number[]];

const fnSelectLayerTrack = ({ lastBoneList, trackIndex }: Params): Return => {
  const updatedTrackList: Partial<TPDopeSheet>[] = [];
  const newClickedTrackList = [];

  // 새로 선택 효과 적용시킬 리스트에 track index 추가
  newClickedTrackList.push(trackIndex);
  updatedTrackList.push({
    trackIndex,
    isSelected: true,
  });

  const targetIndex = fnGetBinarySearch({
    collection: lastBoneList,
    index: trackIndex,
  });
  const lastBone = lastBoneList[targetIndex];
  let currentIndex = lastBone.layerIdnex + 1;
  newClickedTrackList.push(trackIndex);
  updatedTrackList.push({
    trackIndex,
    isSelected: true,
  });

  while (currentIndex <= lastBone.lastBoneIndex + 3) {
    updatedTrackList.push({
      trackIndex: currentIndex,
      isSelected: true,
    });
    newClickedTrackList.push(currentIndex);
    currentIndex += 1;
    if ((currentIndex - 1) % 10 === 0) currentIndex += 2;
  }

  return [updatedTrackList, newClickedTrackList];
};

export default fnSelectLayerTrack;
