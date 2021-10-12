import { ClickTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import {
  LayerTrackList,
  BoneTrackList,
  TrnasformTrackList,
  SelectedLayer,
  SelectedBones,
  SelectedTransforms,
  InterpolationTypeState,
} from 'reducers/trackList/types';

export interface Constructor {
  new (state: TrackListState, payload: ClickTrackBody): Repository;
}

export interface Repository {
  updateInterpolationType?(index: SelectedTransforms): InterpolationTypeState;
  updateTrackList(
    index: SelectedLayer | (SelectedBones & SelectedTransforms),
  ): LayerTrackList | (BoneTrackList & TrnasformTrackList);
  updateTrackListState(params: Partial<TrackListState>): TrackListState;
}

export { default as LayerTrackRepository } from './LayerTrack';
export { default as BoneTrackRepository } from './BoneTrack';
export { default as TransformTrackRepository } from './TransformTrack';
