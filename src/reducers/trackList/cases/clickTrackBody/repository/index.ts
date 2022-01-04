import { Track } from 'types/TP/track';

export interface Repository {
  updateIsSelected(selectedTrack: string | number[]): Track[];
}
