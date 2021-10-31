import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';

interface Parmas {
  state?: TrackListState;
  payload?: ClickTrackBody;
}

export interface RightClick {
  clickRightSelectedTrack(params: Parmas): SelectedBones & SelectedTransforms;
  clickRightNotSelectedTrack(params: Parmas): SelectedBones & SelectedTransforms;
}

export { default as BoneTrackRightClick } from './BoneTrack';
export { default as TransformTrackRightClick } from './TransformTrack';
