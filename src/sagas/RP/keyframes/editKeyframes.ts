import { put, select, takeLatest } from 'redux-saga/effects';
import * as animationDataActions from 'actions/animationDataAction';
import { RootState } from 'reducers';

function getSelectedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function* worker() {
  const selectedLayer = getSelectedLayer(yield select());
  const animationIngredients = getAnimationIngredients(yield select());

  console.log('selectedLayer: ', selectedLayer);
  console.log('animationIngredients: ', animationIngredients);
  // yield put(animationDataActions.editAnimationIngredient({ animationIngredient: newAnimationIngredient })
}

function* watchEditKeyframes() {
  yield takeLatest(animationDataActions.EDIT_KEYFRAMES, worker);
}

export default watchEditKeyframes;
