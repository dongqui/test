import { put, select, all, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { Vector3 } from '@babylonjs/core';
import { getType } from 'typesafe-actions';

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

  const currentKeyframes: KeyframesState = _history.history[_pointer].state.present['keyframes'];

  const previousKeyframes: KeyframesState = _history.history[_previousPointer].state.present['keyframes'];

  const currentPropertyTrack: TimeEditorTrack[] = currentKeyframes.propertyTrackList;
  const previousPropertyTrack: TimeEditorTrack[] = previousKeyframes.propertyTrackList;

  const redoActions: { trackId: string; keyframes: Keyframe[] }[] = [];
  const undoActions: { trackId: string; keyframes: Keyframe[] }[] = [];
  for (let i = 0; i < currentPropertyTrack.length; i++) {
    const onlyInA = onlyInLeft(currentPropertyTrack[i].keyframes, previousPropertyTrack[i].keyframes, isSameKeyframe);
    const onlyInB = onlyInLeft(previousPropertyTrack[i].keyframes, currentPropertyTrack[i].keyframes, isSameKeyframe);
    redoActions.push({ trackId: currentPropertyTrack[i].trackId, keyframes: onlyInA });
    undoActions.push({ trackId: previousPropertyTrack[i].trackId, keyframes: onlyInB });
  }
  const deletedTracks: { trackId: string; deletedIndexes: number[] }[] = [];

  const addedTracks: { layerId: string; tracks: AddedTracks }[] = [];

  if (_pointer > _previousPointer) {
    redoActions.forEach((track) => {
      deletedTracks.push({
        trackId: track.trackId,
        deletedIndexes: track.keyframes.filter((e) => e.isDeleted).map((e) => e.time),
      });
    });
  } else {
    undoActions.forEach((track) => {
      deletedTracks.push({
        trackId: track.trackId,
        deletedIndexes: track.keyframes.filter((e) => !e.isDeleted).map((e) => e.time),
      });
    });
  }

  // yield put(
  //   keyframesActions.editKeyframesSocket.send({
  //     type: 'put-frames',
  //     data: {
  //       layerId: _selectedLayer,
  //       addedTrackes,
  //     },
  //   }),
  // );
  /**
   * 현재 포인터의 값과 이전 포인터의 값을 비교하여 차이 값 서버에 호출
   * case 1: Delete Undo
   * previousPinter {a, b, c(deleted)} -> undo -> pointer {a, b, c(!deleted)}
   *
   * case 2: Delete Redo
   * previousPinter {a, b, c(!deleted)} -> redo -> pointer {a, b, c(deleted)}
   *
   * case 3: Add Undo
   * {a, b, c(!delted)} -> undo -> {a, b}
   *
   * case 4: Add Redo
   * {a, b} -> redo -> {a, b, c(!deleted)}
   *
   * get c
   * if(pointer c != deleted) call add api
   * if(previousPointer c == !deleted) call deleted api
   */

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
                if (_pointer > _previousPointer) {
                  redoActions.forEach((action, idx) => {
                    if (action.trackId === targetTrack.id) {
                      targetTrack.transformKeys = redoActions[idx].keyframes
                        .filter((e) => !e.isDeleted)
                        .map((keyframe: Keyframe) => {
                          return {
                            frame: keyframe.time,
                            value: keyframe.value,
                          };
                        });
                    }
                  });
                } else {
                  undoActions.forEach((action, idx) => {
                    if (action.trackId === targetTrack.id) {
                      targetTrack.transformKeys = undoActions[idx].keyframes
                        .filter((e) => e.isDeleted)
                        .map((keyframe: Keyframe) => {
                          return {
                            frame: keyframe.time,
                            value: keyframe.value,
                          };
                        });
                    }
                  });
                }
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

      const updatedLayer = newAnimationIngredient.layers.find((layer) => layer.id === _selectedLayer);
      const tracks = updatedLayer?.tracks.filter((track) => _targetTrackIds.includes(track.id));
      if (!tracks) {
        return;
      }

      const updatedTracks = tracks?.map((track) => {
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

      yield put(
        keyframesActions.deleteKeyframesSocket.send({
          type: 'delete-frames',
          data: {
            layerId: _selectedLayer,
            deletedTracks: deletedTracks,
          },
        }),
      );

      console.log('=====UPDATED ======');
      console.log('Deleted');
      console.log(deletedTracks);

      yield put(
        keyframesActions.editKeyframesSocket.send({
          type: 'put-frames',
          data: {
            layerId: _selectedLayer,
            tracks: updatedTracks,
          },
        }),
      );

      console.log('Added');
      console.log(updatedTracks);
      yield put(
        animationDataActions.editAnimationIngredient({
          animationIngredient: newAnimationIngredient,
        }),
      );
    }
  }
}

// function* updateKeyframes() {
//   yield all([takeLatest(keyframesActions.OVERRIDE, handleKeyframesUpdate)]);
// }

function* updateKeyframes() {
  yield all([takeLatest('plaskHistory/UPDATE_SERVER', handleKeyframesUpdate)]);
}
export default updateKeyframes;
