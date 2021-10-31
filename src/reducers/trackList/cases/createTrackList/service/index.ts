import { TrackListState } from 'reducers/trackList';
export { default as LayerTrackService } from './LayerTrack';
export { default as BoneTrackService } from './BoneTrack';
export { default as TransformTrackService } from './TransformTrack';

export interface Service {
  updateState(payload: any): TrackListState;
}
