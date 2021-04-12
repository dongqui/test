import { TPDopeSheet } from 'types/TP';
import { fnGetBinarySearch } from './index';

interface FnLockBoneTrack {
  dopeSheetList: TPDopeSheet[];
  trackIndex: number;
}

/**
 * bone 트랙과 하위 트랙에 잠금, 잠금 해제를 설정하는 함수입니다.
 * @param dopeSheetList - dope sheet의 status를 저장하는 배열
 * @param lastBoneList - layer 별 마지막 bone track을 저장하는 배열
 * @param trackIndex - 잠금 버튼을 클릭 한 트랙 index
 * @returns updatedList - isLocked를 변경시킬 dope sheet status list
 */
const fnLockBoneTrack = ({ dopeSheetList, trackIndex }: FnLockBoneTrack) => {
  const updatedList: Partial<TPDopeSheet>[] = [];

  const targetIndex = fnGetBinarySearch({
    collection: dopeSheetList,
    index: trackIndex,
    key: 'trackIndex',
  });
  const targetTrack = dopeSheetList[targetIndex];

  if (!targetTrack.isLocked) {
    updatedList.push({
      trackIndex,
      isLocked: true,
    });
    updatedList.push({
      trackIndex: trackIndex + 1,
      isLocked: true,
    });
    updatedList.push({
      trackIndex: trackIndex + 2,
      isLocked: true,
    });
    updatedList.push({
      trackIndex: trackIndex + 3,
      isLocked: true,
    });
  } else {
    const layerIndex = Math.floor(trackIndex / 10000) * 100000 + 2;
    updatedList.push({
      trackIndex: layerIndex,
      isLocked: false,
    });
    updatedList.push({
      trackIndex,
      isLocked: false,
    });
    updatedList.push({
      trackIndex: trackIndex + 1,
      isLocked: false,
    });
    updatedList.push({
      trackIndex: trackIndex + 2,
      isLocked: false,
    });
    updatedList.push({
      trackIndex: trackIndex + 3,
      isLocked: false,
    });
  }

  return updatedList;
};

export default fnLockBoneTrack;
