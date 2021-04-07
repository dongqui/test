import { TP_TRACK_INDEX } from 'utils/const';
import { TPLastBone } from 'types/TP';
import { fnSelectBoneTrack, fnSelectLayerTrack, fnSelectTransformTrack } from './index';

interface Params {
  isSelected: boolean;
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

/**
 * 선택한 트랙 index를 기준으로 Layer, Bone, Transform 트랙인지 구분하는 함수입니다.
 *
 * @param isSelected - 선택 효과를 줄 경우 true. 선택 효과를 해제 할 경우 false
 * @param lastBoneList - layer의 마지막 bone을 저장하는 리스트
 * @param trackIndex - 클릭 한 트랙 index
 */

// Base, Bone, Transform 트랙 선택
const fnSelectTrackList = ({ isSelected, lastBoneList, trackIndex }: Params) => {
  const remainder = trackIndex % 10;
  switch (remainder) {
    case TP_TRACK_INDEX.LAYER: {
      return fnSelectLayerTrack({
        lastBoneList,
        trackIndex,
        isSelected,
      });
    }
    case TP_TRACK_INDEX.BONE_A:
    case TP_TRACK_INDEX.BONE_B: {
      return fnSelectBoneTrack({ trackIndex, isSelected });
    }
    default: {
      return fnSelectTransformTrack({
        trackIndex,
        isSelected,
      });
    }
  }
};

export default fnSelectTrackList;
