import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';

interface Parmas {
  state?: TrackListState;
  payload?: ClickTrackBody;
}

export interface MultipleClick {
  clickMultipleSelectedTrack(params: Parmas): SelectedBones & SelectedTransforms;
  clickMultipleNotSelectedTrack(params: Parmas): SelectedBones & SelectedTransforms;
}

export { default as BoneTrackMultipleClick } from './BoneTrack';
export { default as TransformTrackMultipleClick } from './TransformTrack';
