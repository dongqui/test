import { put, select, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesActions from 'actions/keyframes';
import { RootState } from 'reducers';
import { getInterpolatedQuaternion, getInterpolatedVector, getValueInsertedTransformKeys } from 'utils/RP';
import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { Vector3 } from '@babylonjs/core';
import { getInterpolatedValue } from 'utils/RP/getInterpolatedValue';
import plaskEngine from '3d/PlaskEngine';

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
  const _selectedLayer = getSelectedLayer(yield select()); // === selectedLayerId (inappropriate )
  const _propertyTrackList = getPropertyTrackList(yield select());
  const _animationIngredients = getAnimationIngredients(yield select());
  const _currentFrameIndex = getCurrentFrameIndex(yield select());

  if (_selectedLayer && _propertyTrackList.length > 0 && _animationIngredients.length > 0) {
    const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.layers.find((layer) => layer.id === _selectedLayer));
    const targetTrackIds = _propertyTrackList.map((track) => track.trackId);

    if (targetAnimationIngredient) {
      const updatedPropertyKeyframes: UpdatedPropertyKeyframes = {
        animationIngredientId: targetAnimationIngredient.id,
        layerId: _selectedLayer,
        transformKeys: [],
      };

      const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
        const targetLayer = draft.layers.find((layer) => layer.id === _selectedLayer);
        const otherLayers = draft.layers.filter((layer) => layer.id !== _selectedLayer && layer.isIncluded);

        if (targetLayer) {
          const targetTracks = targetLayer.tracks.filter((track) => targetTrackIds.includes(track.id));

          targetTracks.forEach((targetTrack) => {
            if (targetTrack.property === 'rotation') {
              const { rotationQuaternion } = targetTrack.target;
              const rotation = rotationQuaternion!.clone().toEulerAngles(); // can't use rotation directly, because we use quaternion for rotation the rotation value is always Vector3.Zero()
              let newRotation = rotation.clone();

              otherLayers.forEach((otherLayer) => {
                const otherLayerTrack = otherLayer.tracks.find((track) => track.targetId === targetTrack.targetId && track.property === 'rotation');

                if (otherLayerTrack) {
                  const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === _currentFrameIndex);
                  newRotation = newRotation.subtract(targetTransformKey ? targetTransformKey.value : getInterpolatedVector(otherLayerTrack.transformKeys, _currentFrameIndex));
                }
              });

              targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, _currentFrameIndex, newRotation);
              updatedPropertyKeyframes.transformKeys.push({
                trackId: targetTrack.id,
                to: _currentFrameIndex,
                value: newRotation,
              });

              // because TimelinePanel only use rotation tracks, we have to find peer rotationQuaternion tracks
              const peerTrack = targetLayer.tracks.find((track) => track.id === targetTrack.id.replace('//rotation', '//rotationQuaternion'));
              if (peerTrack) {
                let newRotationQuaternion = rotationQuaternion!.clone();

                otherLayers.forEach((otherLayer) => {
                  const otherLayerPeerTrack = otherLayer.tracks.find((track) => track.targetId === peerTrack.targetId && track.property === 'rotationQuaternion');

                  if (otherLayerPeerTrack) {
                    // @TODO - have to improve the way we compute rotation, because some different euler values mean the same rotation.
                    // e.g. Vector3(PI, 0, PI) and Vector3(0, PI, 0)
                    // now we compute euler value, by computing quaternion values and convert the result into euler value
                    const targetTransformKey = otherLayerPeerTrack.transformKeys.find((key) => key.frame === _currentFrameIndex);
                    newRotationQuaternion = newRotationQuaternion
                      .clone()
                      .toEulerAngles()
                      .subtract(
                        targetTransformKey
                          ? targetTransformKey.value.toEulerAngles()
                          : getInterpolatedQuaternion(otherLayerPeerTrack.transformKeys, _currentFrameIndex).toEulerAngles(),
                      )
                      .toQuaternion();
                  }
                });

                peerTrack.transformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, _currentFrameIndex, newRotationQuaternion);
              }
              return;
            }

            if (targetTrack.property === 'rotationQuaternion') {
              // Handled by the above case
              return;
            }

            // If not a rotation/rotationQuaternion
            let value = (targetTrack.target as any)[targetTrack.property as any];
            otherLayers.forEach((otherLayer) => {
              const otherLayerTrack = otherLayer.tracks.find((track) => track.targetId === targetTrack.targetId && track.property === targetTrack.property);
              if (otherLayerTrack) {
                const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === _currentFrameIndex);
                let otherValue;
                if (targetTransformKey) {
                  otherValue = targetTransformKey.value;
                } else {
                  otherValue = getInterpolatedValue(otherLayerTrack.transformKeys, otherLayerTrack.property, _currentFrameIndex);
                }
                value = plaskEngine.animationModule.getInvertTransformForKeyframe(otherLayerTrack.property, value, otherValue);
              }
            });
            targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, _currentFrameIndex, value);

            updatedPropertyKeyframes.transformKeys.push({
              trackId: targetTrack.id,
              to: _currentFrameIndex,
              value,
            });
          });
        }
      });

      yield put(
        animationDataActions.editAnimationIngredient({
          animationIngredient: newAnimationIngredient,
        }),
      );

      yield put(keyframesActions.addKeyframes(updatedPropertyKeyframes));
    }
  }
}

function* watchEditKeyframes() {
  yield takeLatest(animationDataActions.EDIT_KEYFRAMES, worker);
}

export default watchEditKeyframes;
