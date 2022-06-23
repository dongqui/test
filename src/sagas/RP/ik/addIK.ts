import { PlaskEntity } from '3d/entities/PlaskEntity';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import plaskEngine from '3d/PlaskEngine';
import { addIKAction, ADD_IK } from 'actions/addIKAction';
import { editAnimationIngredient } from 'actions/animationDataAction';
import { addEntity, addSelectableObjects } from 'actions/selectingDataAction';
import { RootState } from 'reducers';
import { put, select, takeLatest } from 'redux-saga/effects';

export function* addIK(action: ReturnType<typeof addIKAction>) {
  const state: RootState = yield select();
  const { assetId, animationIngredient } = action.payload;

  const plaskTransformNodes = plaskEngine.ikModule.addIK(assetId, animationIngredient);
  // If no plaskTransformNodes are returned, it means the controllers were already added
  if (plaskTransformNodes) {
    yield put(addEntity({ targets: plaskTransformNodes }));
    yield put(addSelectableObjects({ objects: plaskTransformNodes }));
  }
  yield put(editAnimationIngredient({ animationIngredient: animationIngredient || plaskEngine.animationModule.getCurrentAnimationIngredient(assetId)! }));
}

function* watchAddIK() {
  yield takeLatest(ADD_IK, addIK);
}

export default watchAddIK;
