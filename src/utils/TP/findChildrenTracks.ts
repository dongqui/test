import { TrackIdentifier } from 'types/TP';
import findElementIndex from './findElementIndex';

export const findChildrenTracks = <T extends TrackIdentifier>(boneTrackNumber: number, tracks: T[]): T[] => {
  const childTracks = [];
  for (const track of tracks) {
    if (track.trackType === 'property' && track.parentTrackNumber === boneTrackNumber) {
      childTracks.push(track);
    }
  }

  return childTracks;
};
