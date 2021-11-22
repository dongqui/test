import { put, select, takeLatest } from 'redux-saga/effects';

import { RootState } from 'reducers';
import * as trackListActions from 'actions/trackList';

function getAnimationIngredientId(state: RootState) {
  return state.trackList.animationIngredientId;
}

function* worker({ payload }: ReturnType<typeof trackListActions.clickDeleteLayerTrackButton>) {
  const animationIngredientId = getAnimationIngredientId(yield select());
  yield put(trackListActions.deleteLayerTrack(payload));

  // RP Delete Track 액션 호출 시 인자값 : { animationIngredientId, ...payload }
  // 여기서부터 RP Delete Track 액션 호출
  // yield put(RP액션.deleteLayerTrack({ animationIngredientId, ...newLayerTrack }))
}

function* watchDeleteNewLayerTrack() {
  yield takeLatest(trackListActions.CLICK_DELETE_LAYER_TRACK_BUTTON, worker);
}

export default watchDeleteNewLayerTrack;
