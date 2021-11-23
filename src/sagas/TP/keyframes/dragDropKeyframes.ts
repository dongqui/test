import { call, put, select, takeLatest } from 'redux-saga/effects';

import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import * as keyframesAction from 'actions/keyframes';
import { RootState } from 'reducers';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';

function getSelectedPropertyKeyframes(state: RootState) {
  return state.keyframes.selectedPropertyKeyframes;
}

// 키프레임 드래그 드랍 입력 비즈니스 로직
function* worker(params: ReturnType<typeof keyframesAction.enterKeyframeDragDropKey>) {
  const { timeDiff } = params.payload;
  const selectedPropertyKeyframes = getSelectedPropertyKeyframes(yield select());
  const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, selectedPropertyKeyframes, timeDiff);
  yield put(keyframesAction.dragDropKeyframes({ timeDiff: timeDiff }));

  // 이후부터 RP쪽 액션 호출 부분
  // yield put(RP액션.키프레임드래그드랍(updatedPropertyKeyframes));
}

// 키프레임 드래그 드랍 입력 감지
function* watchDragDropKeyframes() {
  yield takeLatest(keyframesAction.ENTER_KEYFRAME_DRAG_DROP_KEY, worker);
}

export default watchDragDropKeyframes;
