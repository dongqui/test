import { put, select, takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { IAnimationKey, Quaternion, Vector3 } from '@babylonjs/core';
import { ServerAnimationLayerRequest, ServerAnimationTrackRequest, PlaskTrack, VectorTransformKey, QuaternionTransformKey } from 'types/common';
import { LayerTrack } from 'types/TP/track';
import * as trackListActions from 'actions/trackList';
import * as animationDataActions from 'actions/animationDataAction';
import { RootState } from 'reducers';
import { createPlaskServerTrack } from 'utils/RP';

function getAnimationIngredientId(state: RootState) {
  return state.trackList.animationIngredientId;
}

function getLayerTrackList(state: RootState) {
  return state.trackList.layerTrackList;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function filterLayerTrackNumbers(layerTrackList: LayerTrack[]) {
  const trackNumbers: number[] = [];
  layerTrackList.forEach((layerTrack) => {
    const LAYER_REGEX = /^Layer (\d*)$/;
    if (LAYER_REGEX.test(layerTrack.trackName)) {
      const trackNumber = layerTrack.trackName.replace(LAYER_REGEX, '$1');
      if (trackNumber) {
        trackNumbers.push(parseInt(trackNumber));
      }
    }
  });
  return trackNumbers.sort((a, b) => a - b);
}

function findNewLayerTrackNumber(layerNumbers: number[]) {
  if (!layerNumbers.length || layerNumbers[0] !== 1) return 1;
  for (let index = 0; index < layerNumbers.length - 1; index++) {
    const currentNumber = layerNumbers[index];
    const nextNumber = layerNumbers[index + 1];
    if (nextNumber - currentNumber !== 1) return currentNumber + 1;
  }
  return layerNumbers[layerNumbers.length - 1] + 1;
}

function* handleAddLayerRequest(action: ReturnType<typeof trackListActions.addLayerSocket.request>) {
  const animationIngredientId = getAnimationIngredientId(yield select());
  const layerTrackList = getLayerTrackList(yield select());
  const layerTrackNumbers = filterLayerTrackNumbers(layerTrackList);
  const newLayerTrackNumber = findNewLayerTrackNumber(layerTrackNumbers);

  const animationIngredients = getAnimationIngredients(yield select());
  const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === animationIngredientId);
  const newTracks: ServerAnimationTrackRequest[] = [];
  const baseLayer = targetAnimationIngredient?.layers[0];

  if (!baseLayer || !targetAnimationIngredient) {
    return;
  }

  baseLayer.tracks.forEach((track) => {
    newTracks.push(createPlaskServerTrack(track.name, track.target, track.property, track.isMocapAnimation));
  });

  const newLayer: ServerAnimationLayerRequest = { name: `Layer ${newLayerTrackNumber}`, isIncluded: true, useFilter: false, tracks: newTracks, isDeleted: false };
  yield put(
    trackListActions.addLayerSocket.send({
      type: 'add-layer',
      data: {
        animationId: animationIngredientId,
        layer: newLayer,
      },
    }),
  );
}

function* handleAddLayerReceive(action: ReturnType<typeof trackListActions.addLayerSocket.receive>) {
  const newLayerResponse = action.payload.data;
  const animationIngredients = getAnimationIngredients(yield select());
  const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === newLayerResponse.animationUid);
  const baselayer = targetAnimationIngredient?.layers[0];
  if (!targetAnimationIngredient || !baselayer) {
    return;
  }

  const tracks: PlaskTrack[] = newLayerResponse.tracks.map((serverTrack, index) => {
    const transformKeys: IAnimationKey[] = [];
    if (serverTrack.property === 'rotationQuaternion') {
      for (let [frame, transformKey] of serverTrack.transformKeysMap.entries()) {
        const quaternionKey = transformKey.transformKey as QuaternionTransformKey;
        transformKeys.push({ frame, value: new Quaternion(quaternionKey.x, quaternionKey.y, quaternionKey.z, quaternionKey.w) });
      }
    } else {
      for (let [frame, transformKey] of serverTrack.transformKeysMap.entries()) {
        const vectorKey = transformKey.transformKey as VectorTransformKey;
        transformKeys.push({ frame, value: new Vector3(vectorKey.x, vectorKey.y, vectorKey.z) });
      }
    }
    const target =
      baselayer.tracks[index].targetId === serverTrack.targetId
        ? baselayer.tracks[index].target
        : baselayer?.tracks?.find((track) => track?.targetId === serverTrack?.targetId)?.target;

    return {
      id: serverTrack.id,
      targetId: serverTrack.targetId,
      layerId: newLayerResponse.uid,
      name: serverTrack.name,
      property: serverTrack.property,
      target: target!,
      transformKeys,
      interpolationType: 'linear',
      isMocapAnimation: false,
      filterBeta: serverTrack.filterBeta,
      filterMinCutoff: serverTrack.filterMinCutoff,
      isLocked: false,
    };
  });

  const newLayer = {
    id: newLayerResponse.uid,
    name: newLayerResponse.name,
    isIncluded: newLayerResponse.isIncluded,
    useFilter: newLayerResponse.useFilter,
    tracks,
  };

  yield put(trackListActions.addLayerTrack(newLayer));
  yield put(
    animationDataActions.editAnimationIngredient({
      animationIngredient: {
        ...targetAnimationIngredient,
        layers: [...targetAnimationIngredient.layers, newLayer],
      },
    }),
  );
}

export default function* watchAddLayerSocketActions() {
  yield all([
    takeLatest(getType(trackListActions.addLayerSocket.request), handleAddLayerRequest),
    takeLatest(getType(trackListActions.addLayerSocket.receive), handleAddLayerReceive),
  ]);
}
