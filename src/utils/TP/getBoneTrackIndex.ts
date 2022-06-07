import { TrackIdentifier } from 'types/TP';

/**
 * transform track의 bone track index을 찾는 함수입니다.
 *
 * @param trackIndex
 * @returns
 */

const fnGetBoneTrackIndex = (track: TrackIdentifier): number => {
  if (track.trackType !== 'property' || typeof track.parentTrackNumber === 'undefined') {
    throw new Error('This is not a property track, no bone associated');
  }

  return track.parentTrackNumber;
};

export default fnGetBoneTrackIndex;
