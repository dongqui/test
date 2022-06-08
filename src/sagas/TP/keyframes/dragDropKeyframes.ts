import { call, put, select, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { isUndefined, reverse } from 'lodash';
import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesActions from 'actions/keyframes';
import { PlaskTrack } from 'types/common';
import { UpdatedPropertyKeyframes, UpdatedTransformKey } from 'types/TP/keyframe';
import { RootState } from 'reducers';
import { getValueInsertedTransformKeys } from 'utils/RP';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';
import { Quaternion, Vector3 } from '@babylonjs/core';

function getSelectedPropertyKeyframes(state: RootState) {
  return state.keyframes.selectedPropertyKeyframes;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function getSelectedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

function* worker(params: ReturnType<typeof keyframesActions.enterKeyframeDragDropKey>) {
  const { timeDiff } = params.payload;
  if (timeDiff) {
    const selectedPropertyKeyframes = getSelectedPropertyKeyframes(yield select());
    const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, selectedPropertyKeyframes, timeDiff);
    yield put(keyframesActions.dragDropKeyframes({ timeDiff: timeDiff }));

    // sort target keyframes reverse for the computation effieciency
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

    // update animationIngredient with the reverse-sorted keyframes
    const { animationIngredientId: targetAnimationIngredientId, layerId: targetLayerId, transformKeys: targetTransformKeys } = newUpdatedPropertyKeyframes;
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
            if (isUndefined(targetTrack) || (targetTrack && targetTrack.id !== trackId)) {
              targetTrack = targetLayer.tracks.find((track) => track.id === trackId);
            }
            if (targetTrack) {
              // add value to 'to' key
              let newValue: typeof value;
              if (value instanceof Vector3 || value instanceof Quaternion) {
                newValue = value.clone();
              } else {
                newValue = value;
              }
              const toInsertedTargetTrackTransformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, to, newValue);
              // remove 'from' key
              const fromDeletedTargetTrackTransformKeys = toInsertedTargetTrackTransformKeys.filter((transformKey) => transformKey.frame !== from);

              targetTrack.transformKeys = fromDeletedTargetTrackTransformKeys;

              // change the peer rotationQuaternion track
              if (targetTrack.property === 'rotation') {
                const peerTrack = targetLayer.tracks.find((track) => track.id === trackId.replace('//rotation', '//rotationQuaternion'));
                if (peerTrack) {
                  // add value to 'to' key
                  const toInsertedPeerTrackTransformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, to, (value as Vector3).toQuaternion());
                  // remove 'from' key
                  const fromDeletedPeerTrackTransformKeys = toInsertedPeerTrackTransformKeys.filter((transformKey) => transformKey.frame !== from);

                  peerTrack.transformKeys = fromDeletedPeerTrackTransformKeys;
                }
              }
            }
          });
        }
      });
      yield put(animationDataActions.editAnimationIngredient({ animationIngredient: newAnimationIngredient }));
    }
  }
}

function* watchDragDropKeyframes() {
  yield takeLatest(keyframesActions.ENTER_KEYFRAME_DRAG_DROP_KEY, worker);
}

export default watchDragDropKeyframes;
