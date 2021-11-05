import { Track } from 'types/TP/track';

export interface Repository {
  toggleIsPointedDownCaret(trackIndex: number, isPointedDownCaret: boolean): Track[];
}
