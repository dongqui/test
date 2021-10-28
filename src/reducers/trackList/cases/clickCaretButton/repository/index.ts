import { Track } from 'types/TP_New/track';

export interface Repository {
  toggleIsPointedDownCaret(trackIndex: number, isPointedDownCaret: boolean): Track[];
}
