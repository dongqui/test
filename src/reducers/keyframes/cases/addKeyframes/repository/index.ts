import { TimeEditorTrack, UpdatedPropertyKeyframes } from 'types/TP/keyframe';

export interface Repository {
  addKeyframes(updatedKeyframes: UpdatedPropertyKeyframes): TimeEditorTrack | TimeEditorTrack[];
}
