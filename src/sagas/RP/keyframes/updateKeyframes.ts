import { put, select, all, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { Vector3 } from '@babylonjs/core';
import { action, getType } from 'typesafe-actions';

import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesActions from 'actions/keyframes';
import { RootState } from 'reducers';
import { getInterpolatedQuaternion, getInterpolatedVector, getValueInsertedTransformKeys } from 'utils/RP';
import { UpdatedPropertyKeyframes, TimeEditorTrack, Keyframe } from 'types/TP/keyframe';
import { getInterpolatedValue } from 'utils/RP/getInterpolatedValue';
import plaskEngine from '3d/PlaskEngine';
import { KeyframesState } from 'reducers/keyframes';
import { PlaskProperty, AnimationIngredient } from 'types/common';
import * as plaskHistoryAction from 'actions/plaskHistoryAction';

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
function getPlaskHistory(state: RootState) {
  return state.plaskHistory;
}
const onlyInLeft = (left: Keyframe[], right: Keyframe[], compareFunction: Function) =>
  left.filter((leftValue: Keyframe) => !right.some((rightValue: Keyframe) => compareFunction(leftValue, rightValue)));

const isSameKeyframe = (a: Keyframe, b: Keyframe) => a.isDeleted === b.isDeleted && a.time === b.time;

interface AddedTracks {
  id: string;
  targetId: string;
  filterBeta: number;
  filterMinCutoff: number;
  name: string;
  property: PlaskProperty;
  transformKeysMap: {
    frameIndex: number;
    property: PlaskProperty;
    transformKeysMap: {
      frameIndex: number;
      property: PlaskProperty;
      transformKey:
        | {
            w: any;
            x: any;
            y: any;
            z: any;
          }
        | {
            x: any;
            y: any;
            z: any;
            w?: undefined;
          };
    }[];
  };
}
function* handleKeyframesUpdate() {
  const _selectedLayer = getSelectedLayer(yield select()); // === selectedLayerId (inappropriate )
  const _propertyTrackList = getPropertyTrackList(yield select());
  const _animationIngredients = getAnimationIngredients(yield select());
  const _keyframeTracks = getKeyframeTrackList(yield select());
  const _history = getPlaskHistory(yield select());

  const _previousPointer = _history.previousPointer;
  const _pointer = _history.pointer;
  const isUndo = _pointer < _previousPointer;
  console.log(`===== ${isUndo ? 'UNDO' : 'REDO '} UPDATED ======`);

  const currentKeyframes: KeyframesState = _history.history[_pointer].state.present['keyframes'];
  const previousKeyframes: KeyframesState = _history.history[_previousPointer].state.present['keyframes'];
  const currentPropertyTrack: TimeEditorTrack[] = currentKeyframes.propertyTrackList;
  const previousPropertyTrack: TimeEditorTrack[] = previousKeyframes.propertyTrackList;

  console.log(_history);
  console.log(_propertyTrackList);
  console.log(previousKeyframes);
  console.log(currentKeyframes);
  console.log(previousPropertyTrack);
  console.log(currentPropertyTrack);
  const historyActions: {
    redo: {
      trackId: string;
      keyframes: Keyframe[];
    }[];
    undo: {
      trackId: string;
      keyframes: Keyframe[];
    }[];
  } = { redo: [], undo: [] };
  const redoActions: { trackId: string; keyframes: Keyframe[] }[] = [];
  const undoActions: { trackId: string; keyframes: Keyframe[] }[] = [];

  for (let i = 0; i < currentPropertyTrack.length; i++) {
    if (previousPropertyTrack.length > i) {
      const onlyInA = onlyInLeft(currentPropertyTrack[i].keyframes, previousPropertyTrack[i].keyframes, isSameKeyframe);
      const onlyInB = onlyInLeft(previousPropertyTrack[i].keyframes, currentPropertyTrack[i].keyframes, isSameKeyframe);
      historyActions.redo.push({ trackId: currentPropertyTrack[i].trackId, keyframes: onlyInA });
      historyActions.undo.push({ trackId: previousPropertyTrack[i].trackId, keyframes: onlyInB });
    }
  }
  const deletedTracks: { trackId: string; deletedIndexes: number[] }[] = [];
  const addedTracks: { trackId: string; addedIndexes: number[] }[] = [];

  // Find Deleted
  if (isUndo) {
    historyActions.undo.forEach((track) => {
      deletedTracks.push({
        trackId: track.trackId,
        deletedIndexes: track.keyframes.filter((e) => !e.isDeleted).map((e) => e.time),
      });

      if (track.trackId.includes('//rotation')) {
        deletedTracks.push({
          trackId: track.trackId.replace('//rotation', '//rotationQuaternion'),
          deletedIndexes: track.keyframes.filter((e) => !e.isDeleted).map((e) => e.time),
        });
      }

      addedTracks.push({
        trackId: track.trackId,
        addedIndexes: track.keyframes.filter((e) => e.isDeleted).map((e) => e.time),
      });
      if (track.trackId.includes('//rotation')) {
        addedTracks.push({
          trackId: track.trackId.replace('//rotation', '//rotationQuaternion'),
          addedIndexes: track.keyframes.filter((e) => e.isDeleted).map((e) => e.time),
        });
      }
    });
  } else {
    historyActions.redo.forEach((track) => {
      deletedTracks.push({
        trackId: track.trackId,
        deletedIndexes: track.keyframes.filter((e) => e.isDeleted).map((e) => e.time),
      });
      if (track.trackId.includes('//rotation')) {
        deletedTracks.push({
          trackId: track.trackId.replace('//rotation', '//rotationQuaternion'),
          deletedIndexes: track.keyframes.filter((e) => e.isDeleted).map((e) => e.time),
        });
      }
      addedTracks.push({
        trackId: track.trackId,
        addedIndexes: track.keyframes.filter((e) => !e.isDeleted).map((e) => e.time),
      });
      if (track.trackId.includes('//rotation')) {
        addedTracks.push({
          trackId: track.trackId.replace('//rotation', '//rotationQuaternion'),
          addedIndexes: track.keyframes.filter((e) => !e.isDeleted).map((e) => e.time),
        });
      }
    });
  }
  console.log('CHANGED HISTORY');
  console.log(historyActions);

  // Update Ingredient
  if (_selectedLayer && _propertyTrackList.length > 0 && _animationIngredients.length > 0) {
    const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.layers.find((layer) => layer.id === _selectedLayer));
    const targetTrackIds = _propertyTrackList.map((track) => track.trackId);

    if (targetAnimationIngredient) {
      const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
        const targetLayer = draft.layers.find((layer) => layer.id === _selectedLayer);
        if (targetLayer) {
          const targetTracks = targetLayer.tracks.filter((track) => targetTrackIds.includes(track.id));
          targetTracks.forEach((targetTrack) => {
            if (isUndo) {
              historyActions.undo.forEach((action, idx) => {
                if (action.trackId === targetTrack.id) {
                  const modifiedTracks = action.keyframes.filter((e) => e.isDeleted);
                  action.keyframes.map((keyframe) => {
                    if (keyframe.isDeleted) {
                      if (keyframe.value) {
                        targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, keyframe.time, keyframe.value);
                      }
                      if (targetTrack.property === 'rotation') {
                        const peerTrack = targetLayer.tracks.find((track) => track.id === action.trackId.replace('//rotation', '//rotationQuaternion'));
                        if (peerTrack) {
                          if (keyframe.value) {
                            const rotationValue = keyframe.value as Vector3;

                            peerTrack.transformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, keyframe.time, rotationValue.toQuaternion());
                          }
                        }
                      }
                    } else {
                      // Delete Keyframe
                      targetTrack.transformKeys = targetTrack.transformKeys.filter((transformKey) => transformKey.frame !== keyframe.time);
                      if (targetTrack.property === 'rotation') {
                        const peerTrack = targetLayer.tracks.find((track) => track.id === action.trackId.replace('//rotation', '//rotationQuaternion'));
                        if (peerTrack) {
                          peerTrack.transformKeys = peerTrack.transformKeys.filter((transformKey) => transformKey.frame !== keyframe.time);
                        }
                      }
                    }
                  });
                }
              });
            } else {
              historyActions.redo.forEach((action, idx) => {
                if (action.trackId === targetTrack.id) {
                  const modifiedTracks = action.keyframes.filter((e) => !e.isDeleted);
                  action.keyframes.map((keyframe) => {
                    if (!keyframe.isDeleted) {
                      if (keyframe.value) {
                        targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, keyframe.time, keyframe.value);
                      }
                      if (targetTrack.property === 'rotation') {
                        const peerTrack = targetLayer.tracks.find((track) => track.id === action.trackId.replace('//rotation', '//rotationQuaternion'));

                        if (peerTrack) {
                          if (keyframe.value) {
                            const rotationValue = keyframe.value as Vector3;
                            peerTrack.transformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, keyframe.time, rotationValue.toQuaternion());
                          }
                        }
                      }
                    } else {
                      // Delete Keyframe
                      targetTrack.transformKeys = targetTrack.transformKeys.filter((transformKey) => transformKey.frame !== keyframe.time);
                      if (targetTrack.property === 'rotation') {
                        const peerTrack = targetLayer.tracks.find((track) => track.id === action.trackId.replace('//rotation', '//rotationQuaternion'));
                        if (peerTrack) {
                          peerTrack.transformKeys = peerTrack.transformKeys.filter((transformKey) => transformKey.frame !== keyframe.time);
                        }
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });

      const _targetTrackIds: string[] = [...targetTrackIds];
      for (const trackId of targetTrackIds) {
        if (trackId.includes('//rotation')) {
          _targetTrackIds.push(trackId.replace('//rotation', '//rotationQuaternion'));
        }
      }

      console.log('Deleted');
      console.log(deletedTracks);
      console.log('Added');
      console.log(addedTracks);

      const updatedLayer = newAnimationIngredient.layers.find((layer) => layer.id === _selectedLayer);
      const tracks = updatedLayer?.tracks.filter((track) => _targetTrackIds.includes(track.id));
      if (!tracks) {
        return;
      }
      let updatedTracks = tracks?.map((track) => {
        const targetTrack = addedTracks.find((e) => e.trackId === track.id);
        return {
          id: track.id,
          targetId: track.targetId,
          filterBeta: track.filterBeta,
          filterMinCutoff: track.filterMinCutoff,
          name: track.name,
          property: track.property,
          transformKeysMap: track.transformKeys
            .filter((key) => targetTrack?.addedIndexes.find((e) => e === key.frame))
            .map((key) => {
              return {
                frameIndex: key.frame,
                property: track.property,
                transformKey:
                  track.property === 'rotationQuaternion' ? { w: key.value.w, x: key.value.x, y: key.value.y, z: key.value.z } : { x: key.value.x, y: key.value.y, z: key.value.z },
              };
            }),
        };
      });

      yield put(
        keyframesActions.editKeyframesSocket.send({
          type: 'put-frames',
          data: {
            layerId: _selectedLayer,
            tracks: updatedTracks,
          },
        }),
      );
      console.log('Updated');
      console.log(updatedTracks);

      yield put(
        keyframesActions.deleteKeyframesSocket.send({
          type: 'delete-frames',
          data: {
            layerId: _selectedLayer,
            deletedTracks: deletedTracks,
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
  yield all([takeLatest('plaskHistory/UPDATE_SERVER', handleKeyframesUpdate)]);
}
export default updateKeyframes;
