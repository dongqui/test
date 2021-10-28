import { EditorTrack, ClusteredKeyframe } from 'types/TP_New/keyframe';

export interface Repository {
  updateIsSelected(selectedKeyframe: ClusteredKeyframe[]): EditorTrack | EditorTrack[];
}
