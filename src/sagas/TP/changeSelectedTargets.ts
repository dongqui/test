import { put, select, takeLatest } from 'redux-saga/effects';
import * as trackListActions from 'actions/trackList';
import * as keyframesActions from 'actions/keyframes';
import { RootState } from 'reducers';
import { AnimationIngredient, PlaskLayer, PlaskTrack } from 'types/common';

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function getVisualizedAssetIds(state: RootState) {
  return state.plaskProject.visualizedAssetIds;
}

function getSelectedTargets(state: RootState) {
  return state.selectingData.present.selectedTargets;
}

function getSelectedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

// viewport에 visaulized 된 animation 찾기
function* findVisualizedAnimationIngredients() {
  const animationIngredients = getAnimationIngredients(yield select());
  const visualizedAssetIds = getVisualizedAssetIds(yield select());
  const visualizedAnimationIngredients = animationIngredients.filter(
    (animationIngredient) => visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
  );
  return visualizedAnimationIngredients;
}

// animationIngredient에서 선택 된 layer 찾기
function* findSelectedLayer(visualizedAnimationIngredient: AnimationIngredient) {
  const selectedLayerId = getSelectedLayer(yield select());
  return visualizedAnimationIngredient.layers.find((layer) => layer.id === selectedLayerId);
}

function* filterPlaskTracks(layer: PlaskLayer) {
  const selectedTargets = getSelectedTargets(yield select());
  const filteredTracks: PlaskTrack[] = [];

  selectedTargets.forEach((plaskTrack) => {
    const { id, name } = plaskTrack.reference;
    if (name !== 'Armature') {
      const selectedTrackIndex = layer.tracks.findIndex((track) => track.targetId === id && track.layerId === layer.id);
      for (let propertyTrackIndex = selectedTrackIndex; propertyTrackIndex <= selectedTrackIndex + 3; propertyTrackIndex += 1) {
        const propertyTrack = layer.tracks[propertyTrackIndex];
        if (propertyTrack.property !== 'rotationQuaternion') filteredTracks.push(propertyTrack);
      }
    }
  });

  return filteredTracks;
}

function* worker() {
  const visualizedAnimationIngredients: AnimationIngredient[] = yield findVisualizedAnimationIngredients();
  if (visualizedAnimationIngredients.length !== 0) {
    const selectedLayer: PlaskLayer = yield findSelectedLayer(visualizedAnimationIngredients[0]);
    const filteredPlaskTracks: PlaskTrack[] = yield filterPlaskTracks(selectedLayer);
    yield put(trackListActions.initializeTrackList({ list: filteredPlaskTracks }));
    yield put(keyframesActions.initializeKeyframes({ list: filteredPlaskTracks }));
  }
}

// 키프레임 드래그 드랍 입력 감지
function* watchChangeSelectedTargets() {
  yield takeLatest(trackListActions.CHANGE_SELECTED_TARGETS, worker);
}

export default watchChangeSelectedTargets;
