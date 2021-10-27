import { TrackIndex } from 'types/TP_New/track';

/**
 * transform track의 bone track index을 찾는 함수입니다.
 *
 * @param trackIndex
 * @returns
 */

const fnGetBoneTrackIndex = (trackIndex: number) => {
  switch (trackIndex % 10) {
    case TrackIndex.POSITION: {
      return trackIndex - TrackIndex.POSITION;
    }
    case TrackIndex.ROTATION: {
      return trackIndex - TrackIndex.ROTATION;
    }
    case TrackIndex.SCALE: {
      return trackIndex - TrackIndex.SCALE;
    }
    default: {
      return -1;
    }
  }
};

export default fnGetBoneTrackIndex;
