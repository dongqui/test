import { put, select, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import * as animationDataActions from 'actions/animationDataAction';
import { RootState } from 'reducers';
import { getInterpolatedQuaternion, getInterpolatedVector, getValueInsertedTransformKeys } from 'utils/RP';

function getSelectedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

function getPropertyTrackList(state: RootState) {
  return state.trackList.propertyTrackList;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function getCurrentFrameIndex(state: RootState) {
  return state.animatingControls.currentTimeIndex;
}

function* worker() {
  const _selectedLayer = getSelectedLayer(yield select()); // 이름 selectedLayerId로 변경 필요(redux 내)
  const _propertyTrackList = getPropertyTrackList(yield select());
  const _animationIngredients = getAnimationIngredients(yield select());
  const _currentFrameIndex = getCurrentFrameIndex(yield select());

  if (_selectedLayer && _propertyTrackList.length > 0 && _animationIngredients.length > 0) {
    const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.layers.find((layer) => layer.id === _selectedLayer));
    const targetTrackIds = _propertyTrackList.map((track) => track.trackId);
    // rotation

    if (targetAnimationIngredient) {
      const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
        const targetTracks = draft.tracks.filter((track) => targetTrackIds.includes(track.id) || targetTrackIds.includes(track.id.replace('//rotationQuaternion', '//rotation')));

        targetTracks.forEach((targetTrack) => {
          switch (targetTrack.property) {
            case 'position': {
              const { position } = targetTrack.target;
              // 다른 layer들과 보간 연산해주기 위해, track의 target의 현재 property들을 복사
              const newPosition = position.clone();
              const otherLayerTracks = draft.tracks.filter(
                (track) => track.targetId === targetTrack.targetId && track.property === 'position' && track.layerId !== targetTrack.layerId,
              );
              otherLayerTracks.forEach((otherLayerTrack) => {
                const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === _currentFrameIndex);
                newPosition.subtract(targetTransformKey ? targetTransformKey.value : getInterpolatedVector(otherLayerTrack.transformKeys, _currentFrameIndex));
              });
              targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, _currentFrameIndex, newPosition);
              break;
            }
            case 'rotationQuaternion': {
              const { rotationQuaternion } = targetTrack.target;
              const newRotationQuaternion = rotationQuaternion!.clone();
              const otherLayerTracks = draft.tracks.filter(
                (track) => track.targetId === targetTrack.targetId && track.property === 'rotationQuaternion' && track.layerId !== targetTrack.layerId,
              );
              otherLayerTracks.forEach((otherLayerTrack) => {
                const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === _currentFrameIndex);
                newRotationQuaternion.subtract(targetTransformKey ? targetTransformKey.value : getInterpolatedQuaternion(otherLayerTrack.transformKeys, _currentFrameIndex));
              });
              targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, _currentFrameIndex, newRotationQuaternion);

              break;
            }
            case 'rotation': {
              const { rotationQuaternion } = targetTrack.target;
              const rotation = rotationQuaternion!.normalize().toEulerAngles(); // quaternion 회전을 사용하기 때문에 단순 target.rotation 해면 (0, 0, 0)
              const newRotation = rotation.clone();
              const otherLayerTracks = draft.tracks.filter(
                (track) => track.targetId === targetTrack.targetId && track.property === 'rotation' && track.layerId !== targetTrack.layerId,
              );
              otherLayerTracks.forEach((otherLayerTrack) => {
                const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === _currentFrameIndex);
                newRotation.subtract(targetTransformKey ? targetTransformKey.value : getInterpolatedVector(otherLayerTrack.transformKeys, _currentFrameIndex));
              });
              targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, _currentFrameIndex, newRotation);

              break;
            }
            case 'scaling': {
              const { scaling } = targetTrack.target;
              const newScaling = scaling.clone();
              const otherLayerTracks = draft.tracks.filter(
                (track) => track.targetId === targetTrack.targetId && track.property === 'scaling' && track.layerId !== targetTrack.layerId,
              );
              otherLayerTracks.forEach((otherLayerTrack) => {
                const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === _currentFrameIndex);
                newScaling.subtract(targetTransformKey ? targetTransformKey.value : getInterpolatedVector(otherLayerTrack.transformKeys, _currentFrameIndex));
              });
              targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, _currentFrameIndex, newScaling);

              break;
            }
            default: {
              break;
            }
          }
        });
      });

      yield put(
        animationDataActions.editAnimationIngredient({
          animationIngredient: newAnimationIngredient,
        }),
      );

      // TP saga 붙이는 곳(찰찰)
    }
  }
}

function* watchEditKeyframes() {
  yield takeLatest(animationDataActions.EDIT_KEYFRAMES, worker);
}

export default watchEditKeyframes;
