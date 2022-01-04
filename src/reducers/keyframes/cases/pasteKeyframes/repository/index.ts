import { ClusteredKeyframe, TimeEditorTrack } from 'types/TP/keyframe';

type SelectedChildren = Map<number, number[]> | number[];

export interface Repository {
  updateTimeEditorTrack(scrubberTime: number, selectedChildren?: SelectedChildren): TimeEditorTrack | TimeEditorTrack[];

  updateSelectedKeyframes(scrubberTime: number, selectedChildren?: SelectedChildren): ClusteredKeyframe[];
}
