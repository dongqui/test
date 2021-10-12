import { TrackListState } from 'reducers/trackList';
import {
  LayerTrackList,
  BoneTrackList,
  TrnasformTrackList,
  SelectedLayer,
  SelectedBones,
  SelectedTransforms,
} from 'reducers/trackList/types';

export interface Repository {
  createTrackList(trackList: any[]): LayerTrackList | BoneTrackList | TrnasformTrackList;

  createSelectedTracks(trackList: any[]): SelectedLayer | SelectedBones | SelectedTransforms;

  updateTrackListState(params: Partial<TrackListState>): TrackListState;
}

export { default as LayerTrackRepository } from './LayerTrack';
export { default as BoneTrackRepository } from './BoneTrack';
export { default as TransformTrackRepository } from './TransformTrack';
