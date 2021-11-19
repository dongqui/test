import { ShootLayer, ShootTrack } from 'types/common';
import { Track } from 'types/TP/track';

export interface Repository {
  initializeTrackList(list?: ShootLayer[] | ShootTrack[]): Track[];

  initializeSelectedTracks(list?: ShootLayer[]): string | number[];
}
