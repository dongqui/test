import { KeyframesState } from 'reducers/keyframes';
import { SelectKeyframes } from 'actions/keyframes';

import { ServiceConstructor } from './service';

import LayerKeyframeService from './service/LayerKeyframe';
import BoneKeyframeService from './service/BoneKeyframe';
import TransformKeyframeService from './service/TransformKeyframe';

import LayerKeyframesRepository from './repository/LayerKeyframes';
import BoneKeyframesRepository from './repository/BoneKeyframes';
import TransformKeyframesRepository from './repository/TransformKeyframes';

const createService = (
  Constructor: ServiceConstructor,
  state: KeyframesState,
  payload: SelectKeyframes,
) => {
  const layerRepo = new LayerKeyframesRepository(state);
  const boneRepo = new BoneKeyframesRepository(state);
  const transformRepo = new TransformKeyframesRepository(state);
  return new Constructor(state, payload, layerRepo, boneRepo, transformRepo);
};

export const layerKeyframeConfig = (state: KeyframesState, payload: SelectKeyframes) => {
  const service = createService(LayerKeyframeService, state, payload);
  const selectedKeyframes = service.selectEventType();
  const nextState = service.updateKeyframesState(selectedKeyframes);
  return nextState;
};

export const boneKeyframeConfig = (state: KeyframesState, payload: SelectKeyframes) => {
  const service = createService(BoneKeyframeService, state, payload);
  const selectedKeyframes = service.selectEventType();
  const nextState = service.updateKeyframesState(selectedKeyframes);
  return nextState;
};

export const transformKeyframeConfig = (state: KeyframesState, payload: SelectKeyframes) => {
  const service = createService(TransformKeyframeService, state, payload);
  const selectedKeyframes = service.selectEventType();
  const nextState = service.updateKeyframesState(selectedKeyframes);
  return nextState;
};
