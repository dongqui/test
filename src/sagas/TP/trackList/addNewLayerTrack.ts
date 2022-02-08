import { put, select, takeLatest } from 'redux-saga/effects';
import { PlaskLayer, PlaskTrack } from 'types/common';
import { LayerTrack } from 'types/TP/track';
import * as trackListActions from 'actions/trackList';
import * as animationDataActions from 'actions/animationDataAction';
import { RootState } from 'reducers';
import { getRandomStringKey } from 'utils/common';
import { createPlaskTrack } from 'utils/RP';

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
  const numberRegex = /\d/;
  for (let index = 0; index < layerTrackList.length; index++) {
    const trackNumber = layerTrackList[index].trackName.match(numberRegex);
    if (trackNumber) trackNumbers.push(parseInt(trackNumber[0]));
  }
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

function* worker() {
  const animationIngredientId = getAnimationIngredientId(yield select());
  const layerTrackList = getLayerTrackList(yield select());
  const layerTrackNumbers = filterLayerTrackNumbers(layerTrackList);
  const newLayerTrackNumber = findNewLayerTrackNumber(layerTrackNumbers);

  // RP New Layer Track 액션 호출 시 인자값 : { animationIngredientId, ...newLayerTrack }
  // 여기서부터 RP New Layer Track 액션 호출
  const animationIngredients = getAnimationIngredients(yield select());
  const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === animationIngredientId);
  if (targetAnimationIngredient) {
    const newTracks: PlaskTrack[] = [];
    const baseLayer = targetAnimationIngredient.layers.find((layer) => layer.id.split('//')[0] === 'baseLayer');
    if (baseLayer) {
      const newLayerId = getRandomStringKey();
      baseLayer.tracks.forEach((track) => {
        newTracks.push(createPlaskTrack(track.name, newLayerId, track.target, track.property, [], track.isMocapAnimation));
      });
      const newLayer: PlaskLayer = { id: newLayerId, name: `Layer ${newLayerTrackNumber}`, isIncluded: true, useFilter: false, tracks: newTracks };

      yield put(trackListActions.addLayerTrack(newLayer));

      // 빈 track들을 추가한 후 animationIngredient 업데이트
      yield put(
        animationDataActions.editAnimationIngredient({
          animationIngredient: {
            ...targetAnimationIngredient,
            layers: [...targetAnimationIngredient.layers, newLayer],
          },
        }),
      );
    }
  }
}

function* watchAddNewLayerTrack() {
  yield takeLatest(trackListActions.CLICK_ADD_LAYER_TRACK_BUTTON, worker);
}

export default watchAddNewLayerTrack;
