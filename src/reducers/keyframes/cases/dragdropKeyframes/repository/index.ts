import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';

export interface Repository {
  updateTimeEditorTrack(timeDiff: number, updatedPropertyTrackList?: TimeEditorTrack[], selectedTimes?: Map<number, number[]> | number[]): TimeEditorTrack | TimeEditorTrack[];

  updateSelectedKeyframes(timeDiff: number): ClusteredKeyframe[];
}
