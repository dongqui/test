import { PlaskTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';

export interface Repository {
  initializeTimeEditorTrack(plaskTracks: PlaskTrack[]): TimeEditorTrack | TimeEditorTrack[] | null;

  clearSelectedKeyframes(): ClusteredKeyframe[];
}
