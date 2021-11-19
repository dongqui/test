import { ShootTrack } from 'types/common';
import { KeyframesState } from 'reducers/keyframes';
import { StateUpdate } from 'reducers/keyframes/classes';
import { InitializeTrackList } from 'actions/trackList';

import KeyframeService from './service/Keyframe';

import LayerKeyframeRepository from './repository/LayerKeyframe';
import BoneKeyframeRepository from './repository/BoneKeyframe';
import PropertyKeyframeRepository from './repository/PropertyKeyframe';

const initializeTrackList = (state: KeyframesState, payload: InitializeTrackList) => {
  const layerKeyframeRepo = new LayerKeyframeRepository();
  const boneKeyframeRepo = new BoneKeyframeRepository();
  const propertyKeyframeRepo = new PropertyKeyframeRepository();
  const service = new KeyframeService(layerKeyframeRepo, boneKeyframeRepo, propertyKeyframeRepo);
  const stateUpdate = new StateUpdate(state);
  if (payload.clearAnimation) {
    const newValues = service.clearAnimation();
    return stateUpdate.updateState(newValues);
  } else {
    const newValues = service.changeSelectedTargets(payload.list as ShootTrack[]);
    return stateUpdate.updateState(newValues);
  }
};

export default initializeTrackList;
