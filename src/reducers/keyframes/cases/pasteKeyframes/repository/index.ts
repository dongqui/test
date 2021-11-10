import { ClusteredKeyframe, TimeEditorTrack } from 'types/TP/keyframe';

export interface Repository {
  updateTimeEditorTrack(
    scrubberTime: number,
    updatedPropertyTrackList?: TimeEditorTrack[],
    selectedTimes?: Map<number, number[]> | number[],
  ): TimeEditorTrack[];

  updateSelectedKeyframes(scrubberTime: number): ClusteredKeyframe[];
}
