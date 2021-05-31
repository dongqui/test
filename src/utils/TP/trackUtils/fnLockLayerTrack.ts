import { TPTrackList, TPLastBone } from 'types/TP';
import { fnGetBinarySearch } from './index';

interface FnLockBoneTrack {
  dopeSheetList: TPTrackList[];
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

/**
 * layer 트랙과 하위 트랙에 잠금, 잠금 해제를 설정하는 함수입니다.
 * @param dopeSheetList - dope sheet의 status를 저장하는 배열
 * @param lastBoneList - layer 별 마지막 bone track을 저장하는 배열
 * @param trackIndex - 잠금 버튼을 클릭 한 트랙 index
 * @returns updatedList - isLocked를 변경시킬 dope sheet status list
 */
const fnLockLayerTrack = ({ dopeSheetList, lastBoneList, trackIndex }: FnLockBoneTrack) => {
  const updatedList: Partial<TPTrackList>[] = [];

  const targetIndex = fnGetBinarySearch({
    collection: dopeSheetList,
    index: trackIndex,
    key: 'trackIndex',
  });
  const targetLastBoneIndex = fnGetBinarySearch({
    collection: lastBoneList,
    index: trackIndex,
    key: 'layerIndex',
  });
  const targetTrack = dopeSheetList[targetIndex];
  const { layerIndex, lastBoneIndex } = lastBoneList[targetLastBoneIndex];
  let curBoneIndex = layerIndex + 1;

  if (!targetTrack.isLocked) {
    updatedList.push({
      trackIndex,
      isLocked: true,
    });
    while (curBoneIndex <= lastBoneIndex + 3) {
      updatedList.push({
        trackIndex: curBoneIndex,
        isLocked: true,
      });
      curBoneIndex += 1;
      if ((curBoneIndex - 1) % 10 === 0) curBoneIndex += 2;
    }
  } else {
    updatedList.push({
      trackIndex,
      isLocked: false,
    });
    while (curBoneIndex <= lastBoneIndex + 3) {
      updatedList.push({
        trackIndex: curBoneIndex,
        isLocked: false,
      });
      curBoneIndex += 1;
      if ((curBoneIndex - 1) % 10 === 0) curBoneIndex += 2;
    }
  }

  return updatedList;
};

export default fnLockLayerTrack;
