import { TrackListState } from 'reducers/trackList';
import { ClickLayerTrackBody, ClickBoneTrackBody, ClickPropertyTrackBody } from 'actions/trackList';

import { Service } from './service';

import LayerTrackService from './service/LayerTrack';
import LayerTrackRepository from './repository/LayerTrack';

import BoneTrackService from './service/BoneTrack';
import BoneTrackRepository from './repository/BoneTrack';

import PropertyTrackService from './service/PropertyTrack';
import PropertyTrackRepository from './repository/PropertyTrack';

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
  const transformRepository = new PropertyTrackRepository(state);
  const service = new BoneTrackService(state, payload, boneRepository, transformRepository);
  return updateLogic(service);
};

export const propertyTrackConfig = (state: TrackListState, payload: ClickPropertyTrackBody) => {
  const boneRepository = new BoneTrackRepository(state);
  const transformRepository = new PropertyTrackRepository(state);
  const service = new PropertyTrackService(state, payload, boneRepository, transformRepository);
  return updateLogic(service);
};
