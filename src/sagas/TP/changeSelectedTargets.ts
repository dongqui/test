import { put, select, takeLatest } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { AnimationIngredient, ShootTrack } from 'types/common';
import * as trackListActions from 'actions/trackList';
import * as keyframesActions from 'actions/keyframes';

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function getVisualizedAssetIds(state: RootState) {
  return state.shootProject.visualizedAssetIds;
}

function getSelectedTargets(state: RootState) {
  return state.selectingData.selectedTargets;
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

// viewport에서 선택 된 bone/controller 필터링
function* filterShootTracks(visualizedAnimationIngredient: AnimationIngredient) {
  const selectedTargets = getSelectedTargets(yield select());
  const selectedLayer = getSelectedLayer(yield select());
  const filteredTracks: ShootTrack[] = [];
  for (let index = 0; index < selectedTargets.length; index += 1) {
    const { id, name } = selectedTargets[index];
    if (name !== 'Armature') {
      const tracks = visualizedAnimationIngredient.tracks;
      const trackIndex = tracks.findIndex((track) => track.targetId === id);
      for (let propertyIndex = trackIndex; propertyIndex < trackIndex + 4; propertyIndex += 1) {
        const propertyTrack = tracks[propertyIndex];
        if (propertyTrack.property !== 'rotationQuaternion' && propertyTrack.layerId === selectedLayer) {
          filteredTracks.push(propertyTrack);
        }
      }
    }
  }
  return filteredTracks;
}

function* worker() {
  const visualizedAnimationIngredients: AnimationIngredient[] = yield findVisualizedAnimationIngredients();
  const filteredShootTracks: ShootTrack[] = yield filterShootTracks(visualizedAnimationIngredients[0]);
  yield put(trackListActions.initializeTrackList({ list: filteredShootTracks, clearAnimation: !visualizedAnimationIngredients.length }));
  yield put(keyframesActions.initializeKeyframes({ list: filteredShootTracks, clearAnimation: !visualizedAnimationIngredients.length }));
}

// 키프레임 드래그 드랍 입력 감지
function* watchChangeSelectedTargets() {
  yield takeLatest(trackListActions.CHANGE_SELECTED_TARGETS, worker);
}

export default watchChangeSelectedTargets;
