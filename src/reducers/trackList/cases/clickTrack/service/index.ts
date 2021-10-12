import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedLayer, SelectedTransforms } from 'reducers/trackList/types';

export interface Service {
  selectClickType(): SelectedLayer | (SelectedBones & SelectedTransforms);
  updateState(selectedTracks: SelectedLayer | (SelectedBones & SelectedTransforms)): TrackListState;
}

export { default as LayerTrackService } from './LayerTrack';
export { default as BoneTrackService } from './BoneTrack';
export { default as TransformTrackService } from './TransformTrack';
