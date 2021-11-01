import { KeyframesState } from 'reducers/keyframes';
import { SelectKeyframes } from 'actions/keyframes';

import { Service, ServiceConstructor } from './service';

import LayerKeyframeService from './service/LayerKeyframe';
import BoneKeyframeService from './service/BoneKeyframe';
import PropertyKeyframeService from './service/PropertyKeyframe';

import LayerKeyframesRepository from './repository/LayerKeyframes';
import BoneKeyframesRepository from './repository/BoneKeyframes';
import PropertyKeyframesRepository from './repository/PropertyKeyframe';

const createService = (
  Constructor: ServiceConstructor,
  state: KeyframesState,
  payload: SelectKeyframes,
) => {
  const layerRepo = new LayerKeyframesRepository(state);
  const boneRepo = new BoneKeyframesRepository(state);
  const propertyRepo = new PropertyKeyframesRepository(state);
  return new Constructor(state, payload, layerRepo, boneRepo, propertyRepo);
};

const run = (service: Service) => {
  const selectedKeyframes = service.selectEventType();
  const keyframes = service.updateKeyframes(selectedKeyframes);
  const nextState = service.updateReducerState({ ...selectedKeyframes, ...keyframes });
  return nextState;
};

export const layerKeyframeConfig = (state: KeyframesState, payload: SelectKeyframes) => {
  const service = createService(LayerKeyframeService, state, payload);
  return run(service);
};

export const boneKeyframeConfig = (state: KeyframesState, payload: SelectKeyframes) => {
  const service = createService(BoneKeyframeService, state, payload);
  return run(service);
};

export const propertyKeyframeConfig = (state: KeyframesState, payload: SelectKeyframes) => {
  const service = createService(PropertyKeyframeService, state, payload);
  return run(service);
};
