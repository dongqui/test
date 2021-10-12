import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedLayer, SelectedTransforms } from 'reducers/trackList/types';

interface Parmas {
  state?: TrackListState;
  payload?: ClickTrackBody;
}

export interface LeftClick {
  clickLeft(parmas: Parmas): SelectedLayer | (SelectedBones & SelectedTransforms);
}

export { default as LayerTrackLeftClick } from './LayerTrack';
export { default as BoneTrackLeftClick } from './BoneTrack';
export { default as TransformTrackLeftClick } from './TransformTrack';
