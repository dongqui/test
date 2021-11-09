import { ClusteredKeyframe, TimeEditorTrack } from 'types/TP/keyframe';

export interface Repository {
  updateTimeEditorTrack(scrubberTime: number): TimeEditorTrack[];

  updateSelectedKeyframes(scrubberTime: number): ClusteredKeyframe[];
}
