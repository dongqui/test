import { put, select, all, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { Vector3 } from '@babylonjs/core';
import { getType } from 'typesafe-actions';

import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesActions from 'actions/keyframes';
import { RootState } from 'reducers';
import { getInterpolatedQuaternion, getInterpolatedVector, getValueInsertedTransformKeys } from 'utils/RP';
import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { getInterpolatedValue } from 'utils/RP/getInterpolatedValue';
import plaskEngine from '3d/PlaskEngine';

function getSelectedLayer(state: RootState) {
  return state.trackList.selectedLayer;
}

function getPropertyTrackList(state: RootState) {
  return state.trackList.propertyTrackList;
}

function getKeyframeTrackList(state: RootState) {
  return state.keyframes.propertyTrackList;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

function getCurrentFrameIndex(state: RootState) {
  return state.animatingControls.currentTimeIndex;
}

function* handleKeyframesUpdate(action: ReturnType<typeof keyframesActions.editKeyframesSocket.update>) {
  const _selectedLayer = getSelectedLayer(yield select()); // === selectedLayerId (inappropriate )
  const _propertyTrackList = getPropertyTrackList(yield select());
  const _animationIngredients = getAnimationIngredients(yield select());
  const _keyframeTracks = getKeyframeTrackList(yield select());

  console.log(_keyframeTracks);

  if (_selectedLayer && _propertyTrackList.length > 0 && _animationIngredients.length > 0) {
    const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.layers.find((layer) => layer.id === _selectedLayer));
    const targetTrackIds = _propertyTrackList.map((track) => track.trackId);

    if (targetAnimationIngredient) {
      const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
        const targetLayer = draft.layers.find((layer) => layer.id === _selectedLayer);
        if (targetLayer) {
          const targetTracks = targetLayer.tracks.filter((track) => targetTrackIds.includes(track.id));

          targetTracks.forEach((targetTrack) => {
            _keyframeTracks.forEach((keyframeTrack) => {
              if (targetTrack.id === keyframeTrack.trackId) {
                targetTrack.transformKeys = keyframeTrack.keyframes
                  .filter((keyframe) => {
                    return !keyframe.isDeleted;
                  })
                  .map((keyframe) => {
                    return {
                      frame: keyframe.time,
                      value: keyframe.value,
                    };
                  });
              }
            });
          });
        }
      });

      const _targetTrackIds: string[] = [...targetTrackIds];
      for (const trackId of targetTrackIds) {
        if (trackId.includes('//rotation')) {
          _targetTrackIds.push(trackId.replace('//rotation', '//rotationQuaternion'));
        }
      }

      console.log(newAnimationIngredient);

      const updatedLayer = newAnimationIngredient.layers.find((layer) => layer.id === _selectedLayer);
      const tracks = updatedLayer?.tracks.filter((track) => _targetTrackIds.includes(track.id));
      if (!tracks) {
        return;
      }
      console.log(tracks);

      const updateTracks = tracks?.map((track) => {
        return {
          id: track.id,
          targetId: track.targetId,
          filterBeta: track.filterBeta,
          filterMinCutoff: track.filterMinCutoff,
          name: track.name,
          property: track.property,
          transformKeysMap: track.transformKeys.map((key) => {
            return {
              frameIndex: key.frame,
              property: track.property,
              transformKey:
                track.property === 'rotationQuaternion' ? { w: key.value.w, x: key.value.x, y: key.value.y, z: key.value.z } : { x: key.value.x, y: key.value.y, z: key.value.z },
            };
          }),
        };
      });

      console.log({
        layerId: _selectedLayer,
        tracks: updateTracks,
      });
      yield put(
        keyframesActions.editKeyframesSocket.send({
          type: 'put-frames',
          data: {
            layerId: _selectedLayer,
            tracks: updateTracks,
          },
        }),
      );

      yield put(
        animationDataActions.editAnimationIngredient({
          animationIngredient: newAnimationIngredient,
        }),
      );
    }
  }
}

function* updateKeyframes() {
  yield all([takeLatest(keyframesActions.OVERRIDE, handleKeyframesUpdate)]);
}

export default updateKeyframes;
