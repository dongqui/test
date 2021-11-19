import { put, select, takeLatest } from 'redux-saga/effects';

import { ClusteredKeyframe, ModifiedPropertyKeyframe } from 'types/TP/keyframe';
import * as keyframesAction from 'actions/keyframes';
import { RootState } from 'reducers';
import { findElementIndex } from 'utils/TP';

function getCurrentTimeIndex(state: RootState) {
  return state.animatingControls.currentTimeIndex;
}

function getCopiedPropertyKeyframes(state: RootState) {
  return state.keyframes.copiedPropertyKeyframes;
}

function setModifiedPropertyKeyframes(collection: ClusteredKeyframe[], currentTimeIndex: number) {
  const modifiedPropertyKeyframes: ModifiedPropertyKeyframe[] = [];
  collection.forEach((group) => {
    const { keyframes, trackId, trackNumber } = group;
    keyframes.forEach((transformKey, count) => {
      const targetFrame = currentTimeIndex + count;
      const timeIndex = findElementIndex(modifiedPropertyKeyframes, targetFrame, 'targetFrame');
      if (timeIndex === -1) {
        modifiedPropertyKeyframes.push({ targetFrame, propertyTracks: [{ trackId, trackNumber, transformKey }] });
      } else {
        modifiedPropertyKeyframes[timeIndex].propertyTracks.push({ trackId, trackNumber, transformKey });
      }
    });
  });
  return modifiedPropertyKeyframes;
}

function* worker() {
  const currentTimeIndex = getCurrentTimeIndex(yield select());
  const copiedPropertyKeyframes = getCopiedPropertyKeyframes(yield select());
  const modifiedKeyframes = setModifiedPropertyKeyframes(copiedPropertyKeyframes, currentTimeIndex);
  yield put(keyframesAction.paste({ currentTimeIndex }));

  // 이후부터 RP쪽 액션 호출
  // yield put(RP액션.키프레임추가(modifiedKeyframes));
}

// 키프레임 드래그 드랍 입력 감지
function* watchPasteKeyframes() {
  yield takeLatest(keyframesAction.ENTER_PASTE_KEY, worker);
}

export default watchPasteKeyframes;
