import { PlaskLayer, PlaskTrack } from 'types/common';
import { TrackListState } from 'reducers/trackList';
import { StateUpdate } from 'reducers/trackList/classes';
import { InitializeTrackList } from 'actions/trackList';

import TrackService from './service/Track';

import LayerTrackRepository from './repository/LayerTrack';
import BoneTrackRepository from './repository/BoneTrack';
import PropertyTrackRepository from './repository/PropertyTrack';

const initializeTrackList = (state: TrackListState, payload: InitializeTrackList) => {
  const layerTrackRepo = new LayerTrackRepository();
  const boneTrackRepo = new BoneTrackRepository();
  const propertyTrackRepo = new PropertyTrackRepository();
  const service = new TrackService(layerTrackRepo, boneTrackRepo, propertyTrackRepo);
  const stateUpdate = new StateUpdate(state);
  if (payload.clearAnimation) {
    const newValues = service.clearAnimation();
    return stateUpdate.updateState(newValues);
  }
  if (!payload.list.length) {
    const newValues = service.changeSelectedTargets([]);
    return stateUpdate.updateState(newValues);
  }
  if (payload.animationIngredientId) {
    const newValues = service.visualizeAnimation(payload.list, payload.animationIngredientId);
    return stateUpdate.updateState(newValues);
  } else {
    const newValues = service.changeSelectedTargets(payload.list as PlaskTrack[]);
    return stateUpdate.updateState(newValues);
  }
};

export default initializeTrackList;
