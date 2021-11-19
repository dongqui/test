import { ShootTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';

export interface Repository {
  initializeTimeEditorTrack(shootTracks: ShootTrack[]): TimeEditorTrack | TimeEditorTrack[] | null;

  clearSelectedKeyframes(): ClusteredKeyframe[];
}
