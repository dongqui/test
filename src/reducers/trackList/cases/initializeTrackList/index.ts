import { ShootLayer, ShootTrack } from 'types/common';
import { TrackListState } from 'reducers/trackList';
import { StateUpdate } from 'reducers/trackList/classes';
import { InitializeTrackList } from 'actions/trackList';

import TrackService from './service/Track';

import LayerTrackRepository from './repository/LayerTrack';
import BoneTrackRepository from './repository/BoneTrack';
import PropertyTrackRepository from './repository/PropertyTrack';

const isShootTrack = (list: ShootLayer[] | ShootTrack[]): list is ShootTrack[] => {
  return (list as ShootTrack[])[0].transformKeys !== undefined;
};

const initializeTrackList = (state: TrackListState, payload: InitializeTrackList) => {
  const layerTrackRepo = new LayerTrackRepository();
  const boneTrackRepo = new BoneTrackRepository();
  const propertyTrackRepo = new PropertyTrackRepository();
  const service = new TrackService(layerTrackRepo, boneTrackRepo, propertyTrackRepo);
  const stateUpdate = new StateUpdate(state);
  if (isShootTrack(payload.list)) {
    const newValues = service.changeSelectedTargets(payload.list);
    return stateUpdate.updateState(newValues);
  } else {
    const newValues = service.visualizeAnimation(payload.list);
    return stateUpdate.updateState(newValues);
  }
};

export default initializeTrackList;
