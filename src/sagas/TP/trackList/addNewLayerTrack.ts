import { put, select, takeLatest } from 'redux-saga/effects';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from 'reducers';
import { PlaskLayer } from 'types/common';
import { LayerTrack } from 'types/TP/track';
import * as trackListActions from 'actions/trackList';

function getAnimationIngredientId(state: RootState) {
  return state.trackList.animationIngredientId;
}

function getLayerTrackList(state: RootState) {
  return state.trackList.layerTrackList;
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

function createNewLayerTrack(newLayerTrackNumber: number) {
  const newLayerTrack: PlaskLayer = { id: uuidv4(), name: `Layer ${newLayerTrackNumber}` };
  return newLayerTrack;
}

function* worker() {
  const animationIngredientId = getAnimationIngredientId(yield select());
  const layerTrackList = getLayerTrackList(yield select());
  const layerTrackNumbers = filterLayerTrackNumbers(layerTrackList);
  const newLayerTrackNumber = findNewLayerTrackNumber(layerTrackNumbers);
  const newLayerTrack = createNewLayerTrack(newLayerTrackNumber);
  yield put(trackListActions.addLayerTrack(newLayerTrack));

  // RP New Layer Track 액션 호출 시 인자값 : { animationIngredientId, ...newLayerTrack }
  // 여기서부터 RP New Layer Track 액션 호출
  // yield put(RP액션.addNewLayerTrack({ animationIngredientId, ...newLayerTrack }))
}

function* watchAddNewLayerTrack() {
  yield takeLatest(trackListActions.CLICK_ADD_LAYER_TRACK_BUTTON, worker);
}

export default watchAddNewLayerTrack;
