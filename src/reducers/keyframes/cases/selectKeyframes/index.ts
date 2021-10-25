import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { layerKeyframeConfig, boneKeyframeConfig, transformKeyframeConfig } from './config';

const selectKeyframes = (state: KeyframesState, payload: SelectKeyframes) => {
  if (payload.trackType === 'layer') {
    return layerKeyframeConfig(state, payload);
  }
  if (payload.trackType === 'bone') {
    return boneKeyframeConfig(state, payload);
  }
  if (payload.trackType === 'transform') {
    return transformKeyframeConfig(state, payload);
  }
  return state;
};

export default selectKeyframes;
