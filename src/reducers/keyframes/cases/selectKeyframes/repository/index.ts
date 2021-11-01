import { TrackIdentifier } from 'types/TP';
import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP/keyframe';

type ClusteredKeyframes = ClusteredKeyframe<TrackIdentifier>[];
type ReturnValues = TimeEditorTrack<TrackIdentifier> | TimeEditorTrack<TrackIdentifier>[];

export interface Repository {
  updateIsSelected(selectedKeyframe: ClusteredKeyframes): ReturnValues;
}
