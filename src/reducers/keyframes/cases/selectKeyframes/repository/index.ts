import { TrackIdentifier } from 'types/TP_New';
import { TimeEditorTrack, ClusteredKeyframe } from 'types/TP_New/keyframe';

type ClusteredKeyframes = ClusteredKeyframe<TrackIdentifier>[];
type ReturnValues = TimeEditorTrack<TrackIdentifier> | TimeEditorTrack<TrackIdentifier>[];

export interface Repository {
  updateIsSelected(selectedKeyframe: ClusteredKeyframes): ReturnValues;
}
