import { put, select, takeLatest } from 'redux-saga/effects';

import { ClusteredKeyframe, ModifiedPropertyKeyframe } from 'types/TP/keyframe';
import { ENTER_KEYFRAME_DRAG_DROP_KEY, enterKeyframeDragDropKey, dragDropKeyframes } from 'actions/keyframes';
import { RootState } from 'reducers';
import { findElementIndex } from 'utils/TP';

function getSelectedPropertyKeyframes(state: RootState) {
  return state.keyframes.selectedPropertyKeyframes;
}

function setModifiedPropertyKeyframes(selectedGroups: ClusteredKeyframe[], timeDiff: number) {
  const modifiedPropertyKeyframes: ModifiedPropertyKeyframe[] = [];
  selectedGroups.forEach((selectedGroup) => {
    const { keyframes, trackId, trackNumber } = selectedGroup;
    keyframes.forEach((keyframe) => {
      const { time, value } = keyframe;
      const targetFrame = time + timeDiff;
      const timeIndex = findElementIndex(modifiedPropertyKeyframes, targetFrame, 'targetFrame');
      if (timeIndex === -1) {
        modifiedPropertyKeyframes.push({
          targetFrame,
          propertyTracks: [{ trackId, trackNumber, transformKey: { time, value } }],
        });
      } else {
        modifiedPropertyKeyframes[timeIndex].propertyTracks.push({
          trackId,
          trackNumber,
          transformKey: { time, value },
        });
      }
    });
  });
  return modifiedPropertyKeyframes;
}

// 키프레임 드래그 드랍 입력 비즈니스 로직
function* worker(params: ReturnType<typeof enterKeyframeDragDropKey>) {
  const { timeDiff } = params.payload;
  const selectedPropertyKeyframes = getSelectedPropertyKeyframes(yield select());
  const modifiedPropertyKeyframes = setModifiedPropertyKeyframes(selectedPropertyKeyframes, timeDiff);
  yield put(dragDropKeyframes({ timeDiff: timeDiff }));

  // 이후부터 RP쪽 액션 호출 부분
  // yield put(RP액션.키프레임추가(modifiedKeyframes));
}

// 키프레임 드래그 드랍 입력 감지
function* watchDragDropKeyframes() {
  yield takeLatest(ENTER_KEYFRAME_DRAG_DROP_KEY, worker);
}

export default watchDragDropKeyframes;
