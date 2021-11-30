import { call, put, select, takeLatest } from 'redux-saga/effects';

import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import * as keyframesAction from 'actions/keyframes';
import { RootState } from 'reducers';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';

function getCurrentTimeIndex(state: RootState) {
  return state.animatingControls.currentTimeIndex;
}

function getCopiedPropertyKeyframes(state: RootState) {
  return state.keyframes.copiedPropertyKeyframes;
}

function* worker() {
  const currentTimeIndex = getCurrentTimeIndex(yield select());
  const copiedPropertyKeyframes = getCopiedPropertyKeyframes(yield select());
  const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, copiedPropertyKeyframes, currentTimeIndex);
  yield put(keyframesAction.paste({ currentTimeIndex }));

  // 이후부터 RP쪽 액션 호출
  // yield put(RP액션.키프레임복사(updatedPropertyKeyframes));
}

// 키프레임 복사 감지
function* watchPasteKeyframes() {
  yield takeLatest(keyframesAction.ENTER_PASTE_KEY, worker);
}

export default watchPasteKeyframes;
