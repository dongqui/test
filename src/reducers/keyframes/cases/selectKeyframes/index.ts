import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { layerKeyframeConfig, boneKeyframeConfig, propertyKeyframeConfig } from './config';

const selectKeyframes = (state: KeyframesState, payload: SelectKeyframes) => {
  if (payload.trackType === 'layer') {
    return layerKeyframeConfig(state, payload);
  }
  if (payload.trackType === 'bone') {
    return boneKeyframeConfig(state, payload);
  }
  if (payload.trackType === 'property') {
    return propertyKeyframeConfig(state, payload);
  }
  return state;
};

export default selectKeyframes;
