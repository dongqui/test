import { select } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { UpdatedPropertyKeyframes, UpdatedTransformKey, ClusteredKeyframe } from 'types/TP/keyframe';

function getAnimationIngredientId(state: RootState) {
  return state.trackList.animationIngredientId;
}

function getSelectedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

function* setUpdatedTransformKeys(propertyKeyframes: ClusteredKeyframe[], timeDiff: number) {
  const result: UpdatedTransformKey[] = [];
  propertyKeyframes.forEach((group) => {
    const { trackId, keyframes } = group;
    keyframes.forEach((keyframe) => {
      const { time, value } = keyframe;
      if (value) result.push({ trackId, from: time, to: timeDiff + time, value });
    });
  });
  return result;
}

function* setUpdatedPropertyKeyframes(propertyKeyframes: ClusteredKeyframe[], timeDiff: number) {
  const animationIngredientId = getAnimationIngredientId(yield select());
  const selectedLayer = getSelectedLayer(yield select());
  const transformKeys: UpdatedTransformKey[] = yield setUpdatedTransformKeys(propertyKeyframes, timeDiff);
  const updatePropertyKeyframes: UpdatedPropertyKeyframes = { animationIngredientId, layerId: selectedLayer, transformKeys };
  return updatePropertyKeyframes;
}

export default setUpdatedPropertyKeyframes;
