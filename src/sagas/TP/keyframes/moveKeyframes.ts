import { call, put, select, takeLatest, all } from 'redux-saga/effects';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { isUndefined, reverse } from 'lodash';
import { getType } from 'typesafe-actions';

import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesActions from 'actions/keyframes';
import { PlaskTrack } from 'types/common';
import { UpdatedPropertyKeyframes, UpdatedTransformKey } from 'types/TP/keyframe';
import { RootState } from 'reducers';
import { getValueInsertedTransformKeys } from 'utils/RP';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';
import { Vector3 } from '@babylonjs/core';

function getSelectedPropertyKeyframes(state: RootState) {
  return state.keyframes.selectedPropertyKeyframes;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function getSelectedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

function* handleMoveKeyframesRequest(params: ReturnType<typeof keyframesActions.moveKeyframesSocket.request>) {
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
              const toInsertedTargetTrackTransformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, to, new Vector3(value.x, value.y, value.z));
              // remove 'from' key
              const fromDeletedTargetTrackTransformKeys = toInsertedTargetTrackTransformKeys.filter((transformKey) => transformKey.frame !== from);

              targetTrack.transformKeys = fromDeletedTargetTrackTransformKeys;

              // change the peer rotationQuaternion track
              if (targetTrack.property === 'rotation') {
                const peerTrack = targetLayer.tracks.find((track) => track.id === trackId.replace('//rotation', '//rotationQuaternion'));
                if (peerTrack) {
                  // add value to 'to' key
                  const toInsertedPeerTrackTransformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, to, new Vector3(value.x, value.y, value.z).toQuaternion());
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

      const _targetTransformKeys = [...targetTransformKeys];
      for (const transformkey of targetTransformKeys) {
        if (transformkey.trackId.includes('//rotation')) {
          _targetTransformKeys.push({ ...transformkey, trackId: transformkey.trackId.replace('//rotation', '//rotationQuaternion') });
        }
      }

      const targetTracks: { trackId: string; movedFrames: { frameIndexFrom: number; frameIndexTo: number }[] }[] = [];
      for (const transformKey of _targetTransformKeys) {
        if (!transformKey?.trackId || transformKey.from === undefined) {
          continue;
        }
        const track = targetTracks.find((t) => t.trackId === transformKey.trackId);
        if (track) {
          track.movedFrames.push({ frameIndexFrom: transformKey.from, frameIndexTo: transformKey.to });
        } else {
          targetTracks.push({
            trackId: transformKey.trackId,
            movedFrames: [{ frameIndexFrom: transformKey.from, frameIndexTo: transformKey.to }],
          });
        }
      }

      yield put(
        keyframesActions.moveKeyframesSocket.send({
          type: 'move-frames',
          data: {
            layerId: selectedLayer,
            movedTracks: targetTracks,
          },
        }),
      );
    }
  }
}

function* handleMoveKeyFramesReceive(action: ReturnType<typeof keyframesActions.moveKeyframesSocket.receive>) {}

// 키프레임 드래그 드랍 입력 감지
function* watchMoveKeyframes() {
  yield all([
    takeLatest(getType(keyframesActions.moveKeyframesSocket.request), handleMoveKeyframesRequest),
    takeLatest(getType(keyframesActions.moveKeyframesSocket.receive), handleMoveKeyFramesReceive),
  ]);
}

export default watchMoveKeyframes;
