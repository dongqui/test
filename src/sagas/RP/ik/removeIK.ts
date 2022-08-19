import plaskEngine from '3d/PlaskEngine';
import { removeIKAction, REMOVE_IK } from 'actions/iKAction';
import { editAnimationIngredient } from 'actions/animationDataAction';
import { removeEntity, removeSelectableObjects } from 'actions/selectingDataAction';
import { RootState } from 'reducers';
import { put, select, takeLatest } from 'redux-saga/effects';

export function* removeIK(action: ReturnType<typeof removeIKAction>) {
  const state: RootState = yield select();
  const { assetId } = action.payload;

  // TODO NEED TO "REFACTOR" API
  // let animationIngredient = plaskEngine.animationModule.getCurrentAnimationIngredient(assetId);
  // if (animationIngredient) {
  //   animationIngredient = plaskEngine.ikModule.removeIkAnimationData(plaskEngine.animationModule.getCurrentAnimationIngredient(assetId)!);
  //   yield put(editAnimationIngredient({ animationIngredient }));
  // }

  const plaskTransformNodes = plaskEngine.ikModule.removeIK();
  // If no plaskTransformNodes are returned, it means the controllers were already added
  if (plaskTransformNodes) {
    yield put(removeEntity({ targets: plaskTransformNodes }));
    yield put(removeSelectableObjects({ objects: plaskTransformNodes }));
  }
}

function* watchRemoveIK() {
  yield takeLatest(REMOVE_IK, removeIK);
}

export default watchRemoveIK;
