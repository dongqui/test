import { TrackListState } from 'reducers/trackList';
import { LayerTrackService, BoneTrackService, TransformTrackService } from './service';
import { LayerTrackRepository, BoneTrackRepository, TransformTrackRepository } from './repository';

export const layerTrackConfig = (state: TrackListState, payload: any) => {
  const repository = new LayerTrackRepository(state);
  const service = new LayerTrackService(state, payload, repository);
  return service.updateState();
};

export const boneTrackConfig = (state: TrackListState, payload: any) => {
  const repository = new BoneTrackRepository(state);
  const service = new BoneTrackService(state, payload, repository);
  return service.updateState();
};

export const transformTrackConfig = (state: TrackListState, payload: any) => {
  const repository = new TransformTrackRepository(state);
  const service = new TransformTrackService(state, payload, repository);
  return service.updateState();
};
