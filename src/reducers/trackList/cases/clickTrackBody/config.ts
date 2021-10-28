import { TrackListState } from 'reducers/trackList';
import {
  ClickLayerTrackBody,
  ClickBoneTrackBody,
  ClickTransformTrackBody,
} from 'actions/trackList';

import { Service } from './service';

import LayerTrackService from './service/LayerTrack';
import LayerTrackRepository from './repository/LayerTrack';

import BoneTrackService from './service/BoneTrack';
import BoneTrackRepository from './repository/BoneTrack';

import TransformTrackService from './service/TransformTrack';
import TransformTrackRepository from './repository/TransformTrack';

const updateLogic = (service: Service) => {
  const selectedTrackList = service.selectClickType();
  const trakcList = service.updateTrackList(selectedTrackList);
  const nextState = service.updateReducerState({ ...selectedTrackList, ...trakcList });
  return nextState;
};

export const layerTrackConfig = (state: TrackListState, payload: ClickLayerTrackBody) => {
  const repository = new LayerTrackRepository(state);
  const service = new LayerTrackService(state, payload, repository);
  return updateLogic(service);
};

export const boneTrackConfig = (state: TrackListState, payload: ClickBoneTrackBody) => {
  const boneRepository = new BoneTrackRepository(state);
  const transformRepository = new TransformTrackRepository(state);
  const service = new BoneTrackService(state, payload, boneRepository, transformRepository);
  return updateLogic(service);
};

export const transformTrackConfig = (state: TrackListState, payload: ClickTransformTrackBody) => {
  const boneRepository = new BoneTrackRepository(state);
  const transformRepository = new TransformTrackRepository(state);
  const service = new TransformTrackService(state, payload, boneRepository, transformRepository);
  return updateLogic(service);
};
