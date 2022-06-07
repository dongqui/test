import { PlaskLayer, PlaskTrack } from 'types/common';
import { Track } from 'types/TP/track';

export interface Repository {
  initializeTrackList(list: PlaskLayer[] | PlaskTrack[], context: { trackUid: number }): Track[];

  initializeSelectedTracks(list?: PlaskLayer[]): string | number[];
}
