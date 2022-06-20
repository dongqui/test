import plaskEngine from '3d/PlaskEngine';
import { addIKAction, ADD_IK } from 'actions/addIKAction';
import { addEntity, addSelectableObjects } from 'actions/selectingDataAction';
import { put, takeLatest } from 'redux-saga/effects';
import { AnimationIngredient } from 'types/common';
import { getType } from 'typesafe-actions';

export function* addIK(action: ReturnType<typeof addIKAction>) {
  const { assetId, animationIngredient } = action.payload;
  const plaskTransformNodes = plaskEngine.ikModule.addIK(assetId, animationIngredient);
  yield put(addEntity({ targets: plaskTransformNodes }));
  yield put(addSelectableObjects({ objects: plaskTransformNodes }));
}

function* watchAddIK() {
  yield takeLatest(ADD_IK, addIK);
}

export default watchAddIK;
