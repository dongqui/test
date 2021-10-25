import { TrackIndex } from 'types/TP_New/track';

/**
 * transform track의 bone track index을 찾는 함수입니다.
 *
 * @param trackIndex
 * @returns
 */
const fnGetBoneTrackIndex = (trackIndex: number) => {
  switch (trackIndex % 10) {
    case TrackIndex.POSITION_X:
    case TrackIndex.ROTATION_X:
    case TrackIndex.SCALE_X: {
      return trackIndex;
    }
    case TrackIndex.POSITION_Y:
    case TrackIndex.ROTATION_Y:
    case TrackIndex.SCALE_Y: {
      return trackIndex - 1;
    }
    case TrackIndex.POSITION_Z:
    case TrackIndex.ROTATION_Z:
    case TrackIndex.SCALE_Z: {
      return trackIndex - 2;
    }
    default: {
      return -1;
    }
  }
};

export default fnGetBoneTrackIndex;
