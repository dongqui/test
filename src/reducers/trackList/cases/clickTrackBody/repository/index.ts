import { Track } from 'types/TP_New/track';

export interface Repository {
  updateIsSelected(selectedTrack: string | number[]): Track[];
}
