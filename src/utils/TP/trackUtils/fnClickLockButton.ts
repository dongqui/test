import { TP_TRACK_INDEX } from 'utils/const';
import { TPDopeSheet, TPLastBone } from 'types/TP';
import { fnLockBoneTrack, fnLockLayerTrack, fnLockTransformTrack } from './index';

interface FnClickLockButton {
  dopeSheetList: TPDopeSheet[];
  lastBoneList: TPLastBone[];
  trackIndex: number;
}
/**
 * 트랙에서 잠금 버튼 클릭, 컨텍스트 메뉴에서 잠금 선택 시, 잠금 효과를 적용하는 함수입니다.
 * @param dopeSheetList - dope sheet의 status를 저장하는 배열
 * @param lastBoneList - layer 별 마지막 bone track을 저장하는 배열
 * @param trackIndex - 잠금 버튼을 클릭 한 트랙 index
 * @returns updatedList - isLocked를 변경시킬 dope sheet status list
 */
const fnClickLockButton = ({ dopeSheetList, lastBoneList, trackIndex }: FnClickLockButton) => {
  const remainder = trackIndex % 10;
  const updatedList: Partial<TPDopeSheet>[] = [];

  switch (remainder) {
    // Layer 트랙 잠금 버튼 클릭
    case TP_TRACK_INDEX.LAYER: {
      const lockedLayerTrack = fnLockLayerTrack({ dopeSheetList, lastBoneList, trackIndex });
      updatedList.push(...lockedLayerTrack);
      break;
    }
    // Bone 트랙 잠금 버튼 클릭
    case TP_TRACK_INDEX.BONE_A:
    case TP_TRACK_INDEX.BONE_B: {
      const lockedBoneTrack = fnLockBoneTrack({ dopeSheetList, trackIndex });
      updatedList.push(...lockedBoneTrack);
      break;
    }
    // Transform 트랙 잠금 버튼 클릭
    default: {
      const lockedTransformTrack = fnLockTransformTrack({ dopeSheetList, trackIndex });
      updatedList.push(...lockedTransformTrack);
      break;
    }
  }

  return updatedList;
};

export default fnClickLockButton;

/**
 * transform 트랙 잠금 설정 -> 본인 트랙만 잠금 처리
 * transform 트랙 잠금 해제 -> 본인 트랙, bone, base 트랙에 잠금 해제
 *
 * bone 트랙 잠금 설정 -> 본인 트랙, 하위 transform 트랙 잠금 처리
 * bone 트랙 잠금 해제 -> transform 트랙, 본인 트랙, base 트랙 잠금 해제
 *
 * base 트랙 잠금 설정 -> 본인 트랙, 모든 하위 트랙 잠금 처리
 * base 트랙 잠금 해제 -> 본인 트랙, 모든 하위 트랙 잠금 해제
 */
