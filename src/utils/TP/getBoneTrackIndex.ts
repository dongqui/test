import { TrackNumber } from 'types/TP';

/**
 * transform track의 bone track index을 찾는 함수입니다.
 *
 * @param trackIndex
 * @returns
 */

const fnGetBoneTrackIndex = (trackIndex: number) => {
  switch (trackIndex % 10) {
    case TrackNumber.POSITION: {
      return trackIndex - TrackNumber.POSITION;
    }
    case TrackNumber.ROTATION: {
      return trackIndex - TrackNumber.ROTATION;
    }
    case TrackNumber.SCALE: {
      return trackIndex - TrackNumber.SCALE;
    }
    default: {
      return -1;
    }
  }
};

export default fnGetBoneTrackIndex;
