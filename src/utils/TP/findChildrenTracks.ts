import { TrackIdentifier } from 'types/TP';
import findElementIndex from './findElementIndex';

export const findChildrenTracks = (boneTrackNumber: number, tracks: TrackIdentifier[]): TrackIdentifier[] => {
  const childTracks = [];
  for (const track of tracks) {
    if (track.trackType === 'property' && track.parentTrackNumber === boneTrackNumber) {
      childTracks.push(track);
    }
  }

  return childTracks;
};
