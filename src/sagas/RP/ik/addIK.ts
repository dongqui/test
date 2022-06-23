import { PlaskEntity } from '3d/entities/PlaskEntity';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import plaskEngine from '3d/PlaskEngine';
import { addIKAction, ADD_IK } from 'actions/addIKAction';
import { addEntity, addSelectableObjects } from 'actions/selectingDataAction';
import { RootState } from 'reducers';
import { put, select, takeLatest } from 'redux-saga/effects';

function isIKAlreadyAdded(entities: { [key: string]: PlaskEntity }) {
  // We assume that we always add 4 IK at the same time, so testing for left foot is just as good as testing for 4 IKs
  for (const key in entities) {
    const entity = entities[key];
    if (entity.className === 'PlaskTransformNode' && (entity as PlaskTransformNode).type === 'ik_controller') {
      return true;
    }
  }

  return false;
}

export function* addIK(action: ReturnType<typeof addIKAction>) {
  const state: RootState = yield select();
  const { assetId, animationIngredient } = action.payload;
  // Check if IK is already added
  if (isIKAlreadyAdded(state.selectingData.present.allEntitiesMap)) {
    console.log('Ik already added');
    return;
  }

  const plaskTransformNodes = plaskEngine.ikModule.addIK(assetId, animationIngredient);
  yield put(addEntity({ targets: plaskTransformNodes }));
  yield put(addSelectableObjects({ objects: plaskTransformNodes }));
}

function* watchAddIK() {
  yield takeLatest(ADD_IK, addIK);
}

export default watchAddIK;
