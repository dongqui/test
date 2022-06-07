import { PlaskTrack } from 'types/common';
import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';

export interface Repository {
  initializeTimeEditorTrack(plaskTracks: PlaskTrack[], context: { trackUid: number }): TimeEditorTrack | TimeEditorTrack[] | null;

  clearSelectedKeyframes(): ClusteredKeyframe[];
}
