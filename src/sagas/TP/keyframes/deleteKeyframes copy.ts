import { call, put, select, takeLatest, all } from 'redux-saga/effects';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { getType } from 'typesafe-actions';

import { isUndefined } from 'lodash';
import * as keyframesActions from 'actions/keyframes';
import * as animationDataActions from 'actions/animationDataAction';
import { PlaskTrack } from 'types/common';
import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { RootState } from 'reducers';
import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';

function getSelectedPropertyKeyframes(state: RootState) {
  return state.keyframes.selectedPropertyKeyframes;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function getSelectedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

function* handleDeleteKeyFramesRequest(action: ReturnType<typeof keyframesActions.deleteKeyframesSocket.request>) {
  const selectedPropertyKeyframes = getSelectedPropertyKeyframes(yield select());
  const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, selectedPropertyKeyframes, 0);
  yield put(keyframesActions.deleteKeyframes());

  // 이후부터 RP쪽 액션 호출 부분
  const { animationIngredientId: targetAnimationIngredientId, layerId: targetLayerId, transformKeys: targetTransformKeys } = updatedPropertyKeyframes;
  const animationIngredients = getAnimationIngredients(yield select());
  const selectedLayer = getSelectedLayer(yield select());
  const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === targetAnimationIngredientId);
  if (targetAnimationIngredient) {
    const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
      const targetLayer = draft.layers.find((layer) => layer.id === selectedLayer);
      if (targetLayer) {
        let targetTrack: WritableDraft<PlaskTrack> | undefined;
        targetTransformKeys.forEach((targetTransformKey) => {
          const { from, to, trackId, value } = targetTransformKey;
          // 첫 track이거나 track 변경시 targetTrack 변경
          if (isUndefined(targetTrack) || (targetTrack && targetTrack.id !== trackId)) {
            targetTrack = targetLayer.tracks.find((track) => track.id === trackId); // targetTrack 업데이트
          }
          if (targetTrack) {
            // from key 삭제
            targetTrack.transformKeys = targetTrack.transformKeys.filter((transformKey) => transformKey.frame !== targetTransformKey.from);

            // rotation track의 경우 rotationQuaternion track도 함께 변경해줘야 함
            if (targetTrack.property === 'rotation') {
              // peerTrack find 로직도 targetTrack과 비슷하게 변경가능할 듯
              const peerTrack = targetLayer.tracks.find((track) => track.id === targetTransformKey.trackId.replace('//rotation', '//rotationQuaternion'));
              if (peerTrack) {
                peerTrack.transformKeys = peerTrack.transformKeys.filter((transformKey) => transformKey.frame !== from);
              }
            }
          }
        });
      }
    });
    yield put(animationDataActions.editAnimationIngredient({ animationIngredient: newAnimationIngredient }));
    const _targetTransformKeys = [...targetTransformKeys];
    for (const transformkey of targetTransformKeys) {
      if (transformkey.trackId.includes('//rotation')) {
        _targetTransformKeys.push({ ...transformkey, trackId: transformkey.trackId.replace('//rotation', '//rotationQuaternion') });
      }
    }

    const deletedTracks: { trackId: string; deletedIndexes: number[] }[] = [];
    for (const transformKey of _targetTransformKeys) {
      if (!transformKey?.trackId || transformKey.from === undefined) {
        continue;
      }
      const track = deletedTracks.find((t) => t.trackId === transformKey.trackId);
      if (track) {
        track.deletedIndexes.push(transformKey.from);
      } else {
        deletedTracks.push({
          trackId: transformKey.trackId,
          deletedIndexes: [transformKey.from],
        });
      }
    }
    console.log(deletedTracks);
    yield put(
      keyframesActions.deleteKeyframesSocket.send({
        type: 'delete-frames',
        data: {
          layerId: selectedLayer,
          deletedTracks,
        },
      }),
    );
  }
}
function* handleDeleteKeyFramesReceive(action: ReturnType<typeof keyframesActions.deleteKeyframesSocket.receive>) {
  console.log(action.payload);
}

// 키프레임 드래그 드랍 입력 감지
function* watchDeleteframes() {
  yield all([
    takeLatest(getType(keyframesActions.deleteKeyframesSocket.request), handleDeleteKeyFramesRequest),
    takeLatest(getType(keyframesActions.deleteKeyframesSocket.receive), handleDeleteKeyFramesReceive),
  ]);
}

export default watchDeleteframes;
