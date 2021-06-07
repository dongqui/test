import { TP_TRACK_INDEX } from 'utils/const';

interface FnGetBoneTrackIndex {
  trackIndex: number;
}

/**
 * transform track의 bone track index을 찾을 때 사용하는 함수입니다.
 *
 * @param trackIndex
 * @returns
 */

const fnGetBoneTrackIndex = ({ trackIndex }: FnGetBoneTrackIndex) => {
  const remainder = trackIndex % 10;
  switch (remainder) {
    case TP_TRACK_INDEX.POSITION: {
      return trackIndex - 1;
    }
    case TP_TRACK_INDEX.ROTATION: {
      return trackIndex - 2;
    }
    case TP_TRACK_INDEX.SCALE: {
      return trackIndex - 3;
    }
    default: {
      return -1;
    }
  }
};

export default fnGetBoneTrackIndex;
