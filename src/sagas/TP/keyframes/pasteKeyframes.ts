import { call, put, select, takeLatest } from 'redux-saga/effects';

import { UpdatedPropertyKeyframes, ClusteredKeyframe } from 'types/TP/keyframe';
import * as keyframesAction from 'actions/keyframes';
import { RootState } from 'reducers';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';

function getCurrentTimeIndex(state: RootState) {
  return state.animatingControls.currentTimeIndex;
}

function getCopiedPropertyKeyframes(state: RootState) {
  return state.keyframes.copiedPropertyKeyframes;
}

// 복사 된 property keyframes 중, frame이 가장 작은 값 찾기
function findSmallestTime(copiedPropertyKeyframes: ClusteredKeyframe[]) {
  let smallestFrame = Infinity;
  copiedPropertyKeyframes.forEach((group) => {
    const firstFrame = group.keyframes[0].time;
    if (firstFrame < smallestFrame) smallestFrame = firstFrame;
  });
  return smallestFrame;
}

function* worker() {
  const scrubberTime = getCurrentTimeIndex(yield select());
  const copiedPropertyKeyframes = getCopiedPropertyKeyframes(yield select());
  const smallestFrame = findSmallestTime(copiedPropertyKeyframes);
  const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, copiedPropertyKeyframes, scrubberTime - smallestFrame);
  yield put(keyframesAction.paste({ currentTimeIndex: scrubberTime }));

  // 이후부터 RP쪽 액션 호출
  // yield put(RP액션.키프레임복사(updatedPropertyKeyframes));
}

// 키프레임 복사 감지
function* watchPasteKeyframes() {
  yield takeLatest(keyframesAction.ENTER_PASTE_KEY, worker);
}

export default watchPasteKeyframes;
