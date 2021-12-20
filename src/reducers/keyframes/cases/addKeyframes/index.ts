import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { StateUpdate } from 'reducers/keyframes/classes';

import LayerKeyframeRepo from './repository/LayerKeyframe';
import BoneKeyframeRepo from './repository/BoneKeyframe';
import PropertyKeyframeRepo from './repository/PropertyKeyframe';
import KeyframeService from './service/Keyframe';

const addKeyframes = (state: KeyframesState, payload: UpdatedPropertyKeyframes) => {
  const layerKeyframeRepo = new LayerKeyframeRepo(state);
  const boneKeyframeRepo = new BoneKeyframeRepo(state);
  const propertyKeyframeRepo = new PropertyKeyframeRepo(state);
  const service = new KeyframeService(payload, layerKeyframeRepo, boneKeyframeRepo, propertyKeyframeRepo);
  const trackKeyframesList = service.updateTrackKeyframesList();
  return new StateUpdate(state).updateState(trackKeyframesList);
};

export default addKeyframes;
