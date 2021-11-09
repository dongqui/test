import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';

export interface Repository {
  updateIsSelected(selectedKeyframe: ClusteredKeyframe[]): TimeEditorTrack | TimeEditorTrack[];
}
