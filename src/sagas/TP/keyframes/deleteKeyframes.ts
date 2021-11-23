import { call, put, select, takeLatest } from 'redux-saga/effects';

import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import * as keyframesAction from 'actions/keyframes';
import { RootState } from 'reducers';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';

function getSelectedPropertyKeyframes(state: RootState) {
  return state.keyframes.selectedPropertyKeyframes;
}

// 키프레임 삭제 비즈니스 로직
function* worker() {
  const selectedPropertyKeyframes = getSelectedPropertyKeyframes(yield select());
  const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, selectedPropertyKeyframes, 0);
  yield put(keyframesAction.deleteKeyframes());

  // 이후부터 RP쪽 액션 호출 부분
  // yield put(RP액션.키프레임삭제(updatedPropertyKeyframes));
}

// 키프레임 드래그 드랍 입력 감지
function* watchDeleteframes() {
  yield takeLatest(keyframesAction.ENTER_KEYFRAME_DELETE_KEY, worker);
}

export default watchDeleteframes;
