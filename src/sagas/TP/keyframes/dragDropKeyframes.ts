import * as BABYLON from '@babylonjs/core';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { isUndefined, reverse } from 'lodash';
import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesAction from 'actions/keyframes';
import { PlaskTrack } from 'types/common';
import { UpdatedPropertyKeyframes, UpdatedTransformKey } from 'types/TP/keyframe';
import { RootState } from 'reducers';
import { getValueInsertedTransformKeys } from 'utils/RP';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';

function getSelectedPropertyKeyframes(state: RootState) {
  return state.keyframes.selectedPropertyKeyframes;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

// 키프레임 드래그 드랍 입력 비즈니스 로직
function* worker(params: ReturnType<typeof keyframesAction.enterKeyframeDragDropKey>) {
  const { timeDiff } = params.payload;
  if (timeDiff) {
    const selectedPropertyKeyframes = getSelectedPropertyKeyframes(yield select());
    const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, selectedPropertyKeyframes, timeDiff);
    yield put(keyframesAction.dragDropKeyframes({ timeDiff: timeDiff }));

    // 이후부터 RP쪽 액션 호출 부분
    // from 역순으로 재정렬
    const newUpdatedPropertyKeyframes: UpdatedPropertyKeyframes = { ...updatedPropertyKeyframes, transformKeys: [] };
    const { transformKeys: prevTransformKeys } = updatedPropertyKeyframes;
    let currentTrackId: string;
    let inner: UpdatedTransformKey[] = [];
    prevTransformKeys.forEach((prevTransformKey) => {
      if (isUndefined(currentTrackId) || (currentTrackId && currentTrackId !== prevTransformKey.trackId)) {
        if (inner.length > 0) {
          newUpdatedPropertyKeyframes.transformKeys.push(...reverse(inner));
          inner = [];
        }
        currentTrackId = prevTransformKey.trackId;
        inner.push(prevTransformKey);
      } else {
        inner.push(prevTransformKey);
      }
    });
    newUpdatedPropertyKeyframes.transformKeys.push(...reverse(inner));

    // 재정렬한 newUpdatedPropertyKeyframes를 사용해서 키프레임 업데이트
    const { animationIngredientId: targetAnimationIngredientId, layerId: targetLayerId, transformKeys: targetTransformKeys } = newUpdatedPropertyKeyframes;
    const animationIngredients = getAnimationIngredients(yield select());
    const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === targetAnimationIngredientId);
    if (targetAnimationIngredient) {
      const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
        let targetTrack: WritableDraft<PlaskTrack> | undefined;
        targetTransformKeys.forEach((targetTransformKey) => {
          const { from, to, trackId, value } = targetTransformKey;
          // 첫 track이거나 track 변경시 targetTrack 변경
          if (isUndefined(targetTrack) || (targetTrack && targetTrack.id !== trackId)) {
            targetTrack = draft.tracks.find((track) => track.id === trackId); // targetTrack 업데이트
          }
          if (targetTrack) {
            // to key에 value 추가
            const toInsertedTargetTrackTransformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, to, new BABYLON.Vector3(value.x, value.y, value.z));
            // from key 삭제
            const fromDeletedTargetTrackTransformKeys = toInsertedTargetTrackTransformKeys.filter((transformKey) => transformKey.frame !== from);

            targetTrack.transformKeys = fromDeletedTargetTrackTransformKeys;

            // rotation track의 경우 rotationQuaternion track도 함께 변경
            if (targetTrack.property === 'rotation') {
              const peerTrack = draft.tracks.find((track) => track.id === trackId.replace('//rotation', '//rotationQuaternion'));
              if (peerTrack) {
                // to key에 value 추가
                const toInsertedPeerTrackTransformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, to, new BABYLON.Vector3(value.x, value.y, value.z).toQuaternion());
                // from key 삭제
                const fromDeletedPeerTrackTransformKeys = toInsertedPeerTrackTransformKeys.filter((transformKey) => transformKey.frame !== from);

                peerTrack.transformKeys = fromDeletedPeerTrackTransformKeys;
              }
            }
          }
        });
      });
      yield put(animationDataActions.editAnimationIngredient({ animationIngredient: newAnimationIngredient }));
    }
  }
}

// 키프레임 드래그 드랍 입력 감지
function* watchDragDropKeyframes() {
  yield takeLatest(keyframesAction.ENTER_KEYFRAME_DRAG_DROP_KEY, worker);
}

export default watchDragDropKeyframes;
