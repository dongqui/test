import { TrackListState } from 'reducers/trackList';
import {
  ClickTrackBody,
  ClickLayerTrackBody,
  ClickBoneTrackBody,
  ClickTransformTrackBody,
} from 'actions/trackList';

import { LayerTrackService, BoneTrackService, TransformTrackService } from './service';
import { LayerTrackRepository, BoneTrackRepository, TransformTrackRepository } from './repository';

export const layerTrackConfig = (state: TrackListState, payload: ClickTrackBody) => {
  const repository = new LayerTrackRepository(state);
  const service = new LayerTrackService(state, payload as ClickLayerTrackBody, repository);
  const selectedLayer = service.selectClickType();
  const nextState = service.updateState(selectedLayer);
  return nextState;
};

export const boneTrackConfig = (state: TrackListState, payload: ClickTrackBody) => {
  const repository = new BoneTrackRepository(state);
  const service = new BoneTrackService(state, payload as ClickBoneTrackBody, repository);
  const selectedTracks = service.selectClickType();
  const nextState = service.updateState(selectedTracks);
  return nextState;
};

export const transformTrackConfig = (state: TrackListState, payload: ClickTrackBody) => {
  const repository = new TransformTrackRepository(state);
  const service = new TransformTrackService(state, payload as ClickTransformTrackBody, repository);
  const selectedTracks = service.selectClickType();
  const nextState = service.updateState(selectedTracks);
  return nextState;
};
