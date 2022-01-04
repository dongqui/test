import { call, put, select, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { isUndefined } from 'lodash';
import * as BABYLON from '@babylonjs/core';
import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesAction from 'actions/keyframes';
import { PlaskTrack } from 'types/common';
import { UpdatedPropertyKeyframes, ClusteredKeyframe } from 'types/TP/keyframe';
import { RootState } from 'reducers';
import { getValueInsertedTransformKeys } from 'utils/RP';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';

function getCurrentTimeIndex(state: RootState) {
  return state.animatingControls.currentTimeIndex;
}

function getCopiedPropertyKeyframes(state: RootState) {
  return state.keyframes.copiedPropertyKeyframes;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
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

  if (copiedPropertyKeyframes.length !== 0) {
    const smallestFrame = findSmallestTime(copiedPropertyKeyframes);
    const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, copiedPropertyKeyframes, scrubberTime - smallestFrame);

    yield put(keyframesAction.paste({ currentTimeIndex: scrubberTime }));

    // 이후부터 RP쪽 액션 호출
    const { animationIngredientId: targetAnimationIngredientId, layerId: targetLayerId, transformKeys: targetTransformKeys } = updatedPropertyKeyframes;
    const animationIngredients = getAnimationIngredients(yield select());
    const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === targetAnimationIngredientId);
    if (targetAnimationIngredient) {
      const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
        let targetTrack: WritableDraft<PlaskTrack> | undefined;
        targetTransformKeys.forEach((targetTransformKey) => {
          const { from, to, trackId, value } = targetTransformKey;
          // 첫 track이거나 track 변경시 targetTrack
          if (isUndefined(targetTrack) || (targetTrack && targetTrack.id !== trackId)) {
            targetTrack = draft.tracks.find((track) => track.id === trackId); // targetTrack 업데이트
          }
          if (targetTrack) {
            // to key에 value 추가
            targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, to, new BABYLON.Vector3(value.x, value.y, value.z));

            // rotation track의 경우 rotationQuaternion track도 함께 변경
            if (targetTrack.property === 'rotation') {
              const peerTrack = draft.tracks.find((track) => track.id === trackId.replace('//rotation', '//rotationQuaternion'));
              if (peerTrack) {
                // to key에 value 추가
                peerTrack.transformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, to, new BABYLON.Vector3(value.x, value.y, value.z).toQuaternion());
              }
            }
          }
        });
      });
      yield put(animationDataActions.editAnimationIngredient({ animationIngredient: newAnimationIngredient }));
    }
  }
}

// 키프레임 복사 감지
function* watchPasteKeyframes() {
  yield takeLatest(keyframesAction.ENTER_PASTE_KEY, worker);
}

export default watchPasteKeyframes;
