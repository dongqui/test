import { put, select, takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as trackListActions from 'actions/trackList';
import * as animationDataActions from 'actions/animationDataAction';
import { RootState } from 'reducers';

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function* handleDeleteLayerRequest(action: ReturnType<typeof trackListActions.deleteLayerSocket.request>) {
  console.log(action.payload);
  yield put(
    trackListActions.deleteLayerSocket.send({
      type: 'delete-layer',
      data: {
        layerId: action.payload,
      },
    }),
  );
}

function* handleDeleteLayerReceive(action: ReturnType<typeof trackListActions.deleteLayerSocket.receive>) {
  console.log(action.payload.data);
  const { layerId, animationUid } = action.payload.data;

  const animationIngredients = getAnimationIngredients(yield select());
  const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === animationUid);
  if (targetAnimationIngredient) {
    yield put(
      animationDataActions.editAnimationIngredient({
        animationIngredient: {
          ...targetAnimationIngredient,
          layers: targetAnimationIngredient.layers.filter((layer) => layer.id !== layerId),
        },
      }),
    );
  }
  yield put(trackListActions.deleteLayerTrack({ id: layerId }));
}

function* watchDeleteLayer() {
  yield all([
    takeLatest(getType(trackListActions.deleteLayerSocket.request), handleDeleteLayerRequest),
    takeLatest(getType(trackListActions.deleteLayerSocket.receive), handleDeleteLayerReceive),
  ]);
}

export default watchDeleteLayer;
