import { KeyframesState } from 'reducers/keyframes';

import KeyframeService from './service/Keyframe';

import LayerKeyframeRepo from './repository/LayerKeyframe';
import BoneKeyframeRepo from './repository/BoneKeyframe';
import TransformKeyframeRepo from './repository/TransformKeyframe';

const deleteKeyframes = (state: KeyframesState) => {
  const layerRepo = new LayerKeyframeRepo(state);
  const boneRepo = new BoneKeyframeRepo(state);
  const transformRepo = new TransformKeyframeRepo(state);
  const service = new KeyframeService(layerRepo, boneRepo, transformRepo);
  const deletedKeyframes = service.deleteKeyframes();
  return service.updateKeyframesState(deletedKeyframes);
};

export default deleteKeyframes;
