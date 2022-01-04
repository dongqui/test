import { put, select, takeLatest } from 'redux-saga/effects';
import * as trackListActions from 'actions/trackList';
import * as animationDataActions from 'actions/animationDataAction';
import { RootState } from 'reducers';

function getAnimationIngredientId(state: RootState) {
  return state.trackList.animationIngredientId;
}

function* worker({ payload }: ReturnType<typeof trackListActions.clickLayerTrackMuteButton>) {
  const animationIngredientId = getAnimationIngredientId(yield select());
  yield put(trackListActions.muteLayerTrack(payload));

  // RP Mute Track 액션 호출 시 인자값 : { animationIngredientId, ...payload }
  // 여기서부터 RP Mute Track 액션 호출
  yield put(animationDataActions.toggleLayerMuteness({ animationIngredientId, layerId: payload.id }));
}

function* watchMuteLayerTrack() {
  yield takeLatest(trackListActions.CLICK_LAYER_TRACK_MUTE_BUTTON, worker);
}

export default watchMuteLayerTrack;
