import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';

interface Parmas {
  state?: TrackListState;
  payload?: ClickTrackBody;
}

export interface AllClick {
  clickSelectAll(payload: Parmas): SelectedBones & SelectedTransforms;
  clickUnselectAll(payload: Parmas): SelectedBones & SelectedTransforms;
}

export { default as BoneTrackAllClick } from './BoneTrack';
export { default as TransformTrackAllClick } from './TransformTrack';
