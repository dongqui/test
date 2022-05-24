import { call, put, select, takeLatest, all } from 'redux-saga/effects';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { isUndefined } from 'lodash';
import { getType } from 'typesafe-actions';

import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesActions from 'actions/keyframes';
import { PlaskTrack } from 'types/common';
import { UpdatedPropertyKeyframes, ClusteredKeyframe } from 'types/TP/keyframe';
import { RootState } from 'reducers';
import { getValueInsertedTransformKeys } from 'utils/RP';

import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';
import { Vector3 } from '@babylonjs/core';

function getCurrentTimeIndex(state: RootState) {
  return state.animatingControls.currentTimeIndex;
}

function getCopiedPropertyKeyframes(state: RootState) {
  return state.keyframes.copiedPropertyKeyframes;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function getSeletedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

// find keyframe whose frame is the smallest
function findSmallestTime(copiedPropertyKeyframes: ClusteredKeyframe[]) {
  let smallestFrame = Infinity;

  copiedPropertyKeyframes.forEach((group) => {
    const firstFrame = group.keyframes[0].time;
    if (firstFrame < smallestFrame) smallestFrame = firstFrame;
  });
  return smallestFrame;
}

function* handlePasteKeyFramesRequest(action: ReturnType<typeof keyframesActions.pasteKeyframesSocket.request>) {
  const scrubberTime = getCurrentTimeIndex(yield select());
  const copiedPropertyKeyframes = getCopiedPropertyKeyframes(yield select());

  if (copiedPropertyKeyframes.length !== 0) {
    const smallestFrame = findSmallestTime(copiedPropertyKeyframes);
    const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, copiedPropertyKeyframes, scrubberTime - smallestFrame);

    yield put(keyframesActions.paste({ currentTimeIndex: scrubberTime }));

    const { animationIngredientId: targetAnimationIngredientId, layerId: targetLayerId, transformKeys: targetTransformKeys } = updatedPropertyKeyframes;
    const animationIngredients = getAnimationIngredients(yield select());
    const selectedLayer = getSeletedLayer(yield select());
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
              targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, to, new Vector3(value.x, value.y, value.z));

              if (targetTrack.property === 'rotation') {
                const peerTrack = targetLayer.tracks.find((track) => track.id === trackId.replace('//rotation', '//rotationQuaternion'));
                if (peerTrack) {
                  peerTrack.transformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, to, new Vector3(value.x, value.y, value.z).toQuaternion());
                }
              }
            }
          });
        }
      });
      yield put(animationDataActions.editAnimationIngredient({ animationIngredient: newAnimationIngredient }));

      const targetTrackIds = targetTransformKeys.map((key) => key.trackId);
      const updatedLayer = newAnimationIngredient.layers.find((layer) => layer.id === selectedLayer);
      const tracks = updatedLayer?.tracks.filter((track) => targetTrackIds.includes(track.id));
      if (!tracks) {
        return;
      }

      yield put(
        keyframesActions.editKeyframesSocket.send({
          type: 'put-frames',
          data: {
            layerId: selectedLayer,
            tracks: tracks?.map((track) => {
              const transformKey = track.transformKeys.find((key) => key.frame === scrubberTime)!;
              return {
                trackId: track.id,
                frame: {
                  frameIndex: transformKey?.frame,
                  property: track.property,
                  transformKey:
                    track.property === 'rotationQuaternion'
                      ? { w: transformKey.value.w, x: transformKey.value.x, y: transformKey.value.y, z: transformKey.value.z }
                      : { x: transformKey.value.x, y: transformKey.value.y, z: transformKey.value.z },
                },
              };
            }),
          },
        }),
      );
    }
  }
}

function* handlePasteKeyFramesReceive(action: ReturnType<typeof keyframesActions.pasteKeyframesSocket.receive>) {}

// 키프레임 드래그 드랍 입력 감지
function* watchPasteKeyframes() {
  yield all([
    takeLatest(getType(keyframesActions.pasteKeyframesSocket.request), handlePasteKeyFramesRequest),
    takeLatest(getType(keyframesActions.pasteKeyframesSocket.receive), handlePasteKeyFramesReceive),
  ]);
}

export default watchPasteKeyframes;
