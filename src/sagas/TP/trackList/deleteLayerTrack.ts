import { put, select, takeLatest } from 'redux-saga/effects';
import * as trackListActions from 'actions/trackList';
import * as animationDataActions from 'actions/animationDataAction';
import { RootState } from 'reducers';

function getAnimationIngredientId(state: RootState) {
  return state.trackList.animationIngredientId;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function* worker({ payload }: ReturnType<typeof trackListActions.clickDeleteLayerTrackButton>) {
  const animationIngredientId = getAnimationIngredientId(yield select());
  yield put(trackListActions.deleteLayerTrack(payload));

  // RP Delete Track 액션 호출 시 인자값 : { animationIngredientId, ...payload }
  // 여기서부터 RP Delete Track 액션 호출
  const animationIngredients = getAnimationIngredients(yield select());
  const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === animationIngredientId);
  if (targetAnimationIngredient) {
    // track들 삭제한 후 animationIngredient 업데이트
    yield put(
      animationDataActions.editAnimationIngredient({
        animationIngredient: {
          ...targetAnimationIngredient,
          layers: targetAnimationIngredient.layers.filter((layer) => layer.id !== payload.id),
        },
      }),
    );
  }
}

function* watchDeleteLayerTrack() {
  yield takeLatest(trackListActions.CLICK_DELETE_LAYER_TRACK_BUTTON, worker);
}

export default watchDeleteLayerTrack;
