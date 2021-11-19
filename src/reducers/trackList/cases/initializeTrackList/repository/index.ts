import { PlaskLayer, PlaskTrack } from 'types/common';
import { Track } from 'types/TP/track';

export interface Repository {
  initializeTrackList(list?: PlaskLayer[] | PlaskTrack[]): Track[];

  initializeSelectedTracks(list?: PlaskLayer[]): string | number[];
}
