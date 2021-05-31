import { TP_TRACK_INDEX } from 'utils/const';
import { TPTrackList } from 'types/TP';
import { fnGetBinarySearch } from './index';

interface FnLockTransformTrack {
  dopeSheetList: TPTrackList[];
  trackIndex: number;
}

/**
 * transform 트랙에 잠금, 잠금 해제를 설정하는 함수입니다.
 * @param dopeSheetList - dope sheet의 status를 저장하는 배열
 * @param trackIndex - 잠금 버튼을 클릭 한 트랙 index
 * @returns updatedList - isLocked를 변경시킬 dope sheet status list
 */
const fnLockTransformTrack = ({ dopeSheetList, trackIndex }: FnLockTransformTrack) => {
  const remainder = trackIndex % 10;
  const updatedList: Partial<TPTrackList>[] = [];

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
  } else {
    const layerIndex = Math.floor(trackIndex / 10000) * 100000 + 2;
    let boneIndex = 0;
    switch (remainder) {
      case TP_TRACK_INDEX.POSITION_A:
      case TP_TRACK_INDEX.POSITION_B: {
        boneIndex = trackIndex - 1;
        break;
      }
      case TP_TRACK_INDEX.ROTATION_A:
      case TP_TRACK_INDEX.ROTATION_B: {
        boneIndex = trackIndex - 2;
        break;
      }
      case TP_TRACK_INDEX.SCALE_A:
      case TP_TRACK_INDEX.SCALE_B: {
        boneIndex = trackIndex - 3;
        break;
      }
    }
    updatedList.push({
      trackIndex: layerIndex,
      isLocked: false,
    });
    updatedList.push({
      trackIndex: boneIndex,
      isLocked: false,
    });
    updatedList.push({
      trackIndex,
      isLocked: false,
    });
  }

  return updatedList;
};

export default fnLockTransformTrack;
