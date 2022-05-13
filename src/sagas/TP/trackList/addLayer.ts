import { put, select, takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { ServerAnimationLayerRequest, ServerAnimationTrackRequest } from 'types/common';
import { LayerTrack } from 'types/TP/track';
import * as trackListActions from 'actions/trackList';
import * as animationDataActions from 'actions/animationDataAction';
import { RootState } from 'reducers';
import { getRandomStringKey } from 'utils/common';
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

  // RP New Layer Track 액션 호출 시 인자값 : { animationIngredientId, ...newLayerTrack }
  // 여기서부터 RP New Layer Track 액션 호출
  const animationIngredients = getAnimationIngredients(yield select());
  const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === animationIngredientId);
  const newTracks: ServerAnimationTrackRequest[] = [];
  const baseLayer = targetAnimationIngredient?.layers.find((layer) => layer.id.split('//')[0] === 'baseLayer');
  if (!baseLayer || !targetAnimationIngredient) {
    return;
  }

  baseLayer.tracks.forEach((track) => {
    newTracks.push(createPlaskServerTrack(track.name, track.target, track.property, track.isMocapAnimation));
  });

  const newLayer: ServerAnimationLayerRequest = { name: `Layer ${newLayerTrackNumber}`, isIncluded: true, useFilter: false, tracks: newTracks, isDeleted: false };
  trackListActions.addLayerSocket.send({
    type: 'add-layer',
    data: {
      animationId: animationIngredientId,
      layer: newLayer,
    },
  });
}

function* handleAddLayerReceive(action: ReturnType<typeof trackListActions.addLayerSocket.receive>) {
  // const newLayerResponse = action.payload
  // yield put(trackListActions.addLayerTrack(newLayer));
  // yield put(
  //   animationDataActions.editAnimationIngredient({
  //     animationIngredient: {
  //       ...targetAnimationIngredient,
  //       layers: [...targetAnimationIngredient.layers, newLayer],
  //     },
  //   }),
  // );
}

export default function* watchAddLayerSocketActions() {
  yield all([
    takeLatest(getType(trackListActions.addLayerSocket.request), handleAddLayerRequest),
    takeLatest(getType(trackListActions.addLayerSocket.receive), handleAddLayerReceive),
  ]);
}
