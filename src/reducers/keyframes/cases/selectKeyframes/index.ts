import { SelectKeyframes, SelectKeyframesByDragBox } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { layerKeyframeConfig, boneKeyframeConfig, propertyKeyframeConfig, dragBoxConfig } from './config';

const isSelectedDragBox = (payload: SelectKeyframes | SelectKeyframesByDragBox[]): payload is SelectKeyframesByDragBox[] => {
  return (payload as SelectKeyframesByDragBox[])[0]?.time !== undefined;
};

const selectKeyframes = (state: KeyframesState, payload: SelectKeyframes | SelectKeyframesByDragBox[]) => {
  if (isSelectedDragBox(payload)) {
    return dragBoxConfig(state, payload);
  } else {
    if (payload.trackType === 'layer') {
      return layerKeyframeConfig(state, payload);
    }
    if (payload.trackType === 'bone') {
      return boneKeyframeConfig(state, payload);
    }
    if (payload.trackType === 'property') {
      return propertyKeyframeConfig(state, payload);
    }
  }
  return state;
};

export default selectKeyframes;
