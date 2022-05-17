import { PlaskEngine } from '3d/PlaskEngine';
import { Animation, AnimationGroup, IAnimationKey, Mesh, Nullable, Observable, Quaternion, TargetedAnimation, TransformNode, Vector3 } from '@babylonjs/core';
import produce from 'immer';
import { findIndex, findLastIndex, round, union, zipWith } from 'lodash';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as keyframesActions from 'actions/keyframes';
import {
  AnimationIngredient,
  ArrayOfFourNumbers,
  ArrayOfThreeNumbers,
  PlaskLayer,
  PlaskMocapData,
  PlaskPose,
  PlaskProperty,
  PlaskRetargetMap,
  PlaskTrack,
  QuaternionTransformKey,
  ServerAnimation,
  ServerAnimationLayer,
  ServerAnimationTrack,
  ServerTransformKey,
  VectorTransformKey,
} from 'types/common';
import { getRandomStringKey } from 'utils/common';
import { getInterpolatedQuaternion, getInterpolatedVector, getValueInsertedTransformKeys } from 'utils/RP';
import { DEFAULT_BETA, DEFAULT_MIN_CUTOFF, MOCAP_POSITION_BETA, MOCAP_POSITION_MIN_CUTOFF, MOCAP_QUATERNION_BETA, MOCAP_QUATERNION_MIN_CUTOFF } from 'utils/const';
import OneEuroFilterForQuaternion from 'utils/RP/OneEuroFilterForQuaternion';
import OneEuroFilterForVector from 'utils/RP/OneEuroFilterForVector';
import { Module } from '../Module';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';

export class AnimationModule extends Module {
  private _currentAnimationGroup: Nullable<AnimationGroup>;

  public onAnimationDataChangeObservable: Observable<{ animationIngredients: AnimationIngredient[]; visualizedAssetIds: string[]; startTimeIndex: number; endTimeIndex: number }>;

  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);

    this._currentAnimationGroup = null;
    this.onAnimationDataChangeObservable = new Observable();
  }

  static ingredientToServerData(animationIngredient: AnimationIngredient, fps: number, isMocapAnimation: boolean): [ServerAnimation, ServerAnimationLayer[]] {
    const serverAnimation: ServerAnimation = {
      id: animationIngredient.id,
      scenesLibraryId: animationIngredient.assetId,
      name: animationIngredient.name,
      fps,
      isMocapAnimation,
      isDeleted: false,
    };

    const serverAnimationLayers: ServerAnimationLayer[] = [];
    animationIngredient.layers.forEach((layer) => {
      const serverAnimationTracks: ServerAnimationTrack[] = [];
      layer.tracks.forEach((track) => {
        const transformKeysMap = new Map<number, ServerTransformKey>();
        track.transformKeys.forEach((transformKey) => {
          const serverTransformKey: ServerTransformKey = {
            property: track.property,
            transformKey:
              track.property === 'rotationQuaternion'
                ? { w: transformKey.value.w, x: transformKey.value.x, y: transformKey.value.y, z: transformKey.value.z }
                : { x: transformKey.value.x, y: transformKey.value.y, z: transformKey.value.z },
          };

          transformKeysMap.set(transformKey.frame, serverTransformKey);
        });

        const serverAnimationTrack: ServerAnimationTrack = {
          id: track.id,
          targetId: track.targetId,
          name: track.name,
          property: track.property,
          filterBeta: track.filterBeta,
          filterMinCutoff: track.filterMinCutoff,
          transformKeysMap,
        };
        serverAnimationTracks.push(serverAnimationTrack);
      });

      const { id, name, isIncluded, useFilter } = layer;
      const serverAnimationLayer: ServerAnimationLayer = {
        id,
        animationId: serverAnimation.id,
        name,
        isIncluded,
        isDeleted: false,
        useFilter,
        tracks: serverAnimationTracks,
      };
      serverAnimationLayers.push(serverAnimationLayer);
    });

    return [serverAnimation, serverAnimationLayers];
  }

  static serverDataToIngredient(
    serverAnimation: ServerAnimation,
    serverAnimationLayers: ServerAnimationLayer[],
    isMocapAnimation: boolean,
    selectableObjects: PlaskTransformNode[],
    current: boolean,
  ): AnimationIngredient {
    const layers: PlaskLayer[] = [];
    serverAnimationLayers.forEach((serverAnimationLayer) => {
      const { id: layerId, name: layerName, isIncluded, useFilter, tracks: serverTracks } = serverAnimationLayer;
      const tracks: PlaskTrack[] = [];
      serverTracks.forEach((serverTrack) => {
        const transformKeys: IAnimationKey[] = [];
        if (serverTrack.property === 'rotationQuaternion') {
          for (let [frame, transformKey] of serverTrack.transformKeysMap.entries()) {
            const quaternionKey = transformKey.transformKey as QuaternionTransformKey;
            transformKeys.push({ frame, value: new Quaternion(quaternionKey.x, quaternionKey.y, quaternionKey.z, quaternionKey.w) });
          }
        } else {
          for (let [frame, transformKey] of serverTrack.transformKeysMap.entries()) {
            const vectorKey = transformKey.transformKey as VectorTransformKey;
            transformKeys.push({ frame, value: new Vector3(vectorKey.x, vectorKey.y, vectorKey.z) });
          }
        }

        const track: PlaskTrack = {
          id: serverTrack.id,
          targetId: serverTrack.targetId,
          layerId,
          name: serverTrack.name,
          property: serverTrack.property,
          target: selectableObjects.find((object) => object.id === serverTrack.targetId)!.reference,
          transformKeys,
          interpolationType: 'linear',
          isMocapAnimation,
          filterBeta: serverTrack.filterBeta,
          filterMinCutoff: serverTrack.filterMinCutoff,
          isLocked: false,
        };
        tracks.push(track);
      });

      const layer: PlaskLayer = {
        id: layerId,
        name: layerName,
        isIncluded,
        useFilter,
        tracks,
      };

      layers.push(layer);
    });

    const animationIngredient: AnimationIngredient = {
      id: serverAnimation.id,
      name: serverAnimation.name,
      assetId: serverAnimation.scenesLibraryId,
      current,
      layers,
    };

    return animationIngredient;
  }

  /**
   * Initialize observables
   */
  public initialize() {
    this.onAnimationDataChangeObservable.add(({ animationIngredients, visualizedAssetIds, startTimeIndex, endTimeIndex }) => {
      if (this.currentAnimationGroup) {
        this.currentAnimationGroup.stop();
        this.currentAnimationGroup.dispose();
      }

      const visualizedAnimationIngredients = animationIngredients.filter(
        (animationIngredient) => visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
      );
      if (visualizedAnimationIngredients.length === 1) {
        const newAnimationGroup = this.createAnimationGroupFromIngredient(visualizedAnimationIngredients[0], this.fps);
        newAnimationGroup.normalize(startTimeIndex, endTimeIndex);

        this._currentAnimationGroup = newAnimationGroup;

        // @TODO module 내에서 currentAnimationGroup 컨트롤 하도록 변경 필요
        this.plaskEngine.dispatch(animatingControlsActions.setCurrentAnimationGroup({ animationGroup: newAnimationGroup }));
      }
    });
  }

  /**
   * Clear observables
   */
  public dispose() {
    this.onAnimationDataChangeObservable.clear();
  }

  /**
   * edit keyframes with params so that we don't need to select targets in RenderingPanel
   * @param targetAnimationIngredientId - id of animationIngredent to edit
   * @param targetLayerId - id of layer to edit
   * @param targetFrameIndex - index of frame to edit
   * @param keyframeDataList - list of data that is used to edit keyframes, including targetId, property, value
   */
  public editKeyframesWithParams(
    targetAnimationIngredientId: string,
    targetLayerId: string,
    targetFrameIndex: number,
    keyframeDataList: Array<{ targetId: string; property: PlaskProperty; value: ArrayOfThreeNumbers | ArrayOfFourNumbers }>,
  ) {
    const targetAnimationIngredient = this.animationIngredients.find((animationIngredient) => animationIngredient.id === targetAnimationIngredientId);

    if (targetAnimationIngredient) {
      const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
        const targetLayer = draft.layers.find((layer) => layer.id === targetLayerId);
        const otherLayers = draft.layers.filter((layer) => layer.id !== targetLayerId && layer.isIncluded);

        if (targetLayer) {
          keyframeDataList.forEach((keyframeData) => {
            const targetTrack = targetLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === keyframeData.property);

            if (targetTrack) {
              switch (keyframeData.property) {
                case 'position': {
                  let newPosition = Vector3.FromArray(keyframeData.value);
                  otherLayers.forEach((otherLayer) => {
                    const otherLayerTrack = otherLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === 'position');
                    if (otherLayerTrack) {
                      const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === targetFrameIndex);
                      newPosition = newPosition.subtract(targetTransformKey ? targetTransformKey.value : getInterpolatedVector(otherLayerTrack.transformKeys, targetFrameIndex));
                    }
                  });

                  targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, targetFrameIndex, newPosition);
                  break;
                }
                case 'rotationQuaternion': {
                  let newRotationQuaternion = Quaternion.FromArray(keyframeData.value);
                  otherLayers.forEach((otherLayer) => {
                    const otherLayerTrack = otherLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === 'rotationQuaternion');
                    if (otherLayerTrack) {
                      const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === targetFrameIndex);
                      newRotationQuaternion = newRotationQuaternion
                        .clone()
                        .toEulerAngles()
                        .subtract(
                          targetTransformKey
                            ? targetTransformKey.value.toEulerAngles()
                            : getInterpolatedQuaternion(otherLayerTrack.transformKeys, targetFrameIndex).toEulerAngles(),
                        )
                        .toQuaternion();
                    }
                  });
                  targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, targetFrameIndex, newRotationQuaternion);

                  const peerTrack = targetLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === 'rotation');
                  if (peerTrack) {
                    let newRotation = Quaternion.FromArray(keyframeData.value).toEulerAngles();
                    otherLayers.forEach((otherLayer) => {
                      const otherLayerPeerTrack = otherLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === 'rotation');
                      if (otherLayerPeerTrack) {
                        const targetTransformKey = otherLayerPeerTrack.transformKeys.find((key) => key.frame === targetFrameIndex);
                        newRotation = newRotation.subtract(
                          targetTransformKey ? targetTransformKey.value : getInterpolatedVector(otherLayerPeerTrack.transformKeys, targetFrameIndex),
                        );
                      }
                    });

                    peerTrack.transformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, targetFrameIndex, newRotation);
                  }

                  break;
                }
                case 'rotation': {
                  let newRotation = Vector3.FromArray(keyframeData.value);
                  otherLayers.forEach((otherLayer) => {
                    const otherLayerTrack = otherLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === 'rotation');
                    if (otherLayerTrack) {
                      const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === targetFrameIndex);
                      newRotation = newRotation.subtract(targetTransformKey ? targetTransformKey.value : getInterpolatedVector(otherLayerTrack.transformKeys, targetFrameIndex));
                    }
                  });

                  targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, targetFrameIndex, newRotation);

                  const peerTrack = targetLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === 'rotationQuaternion');
                  if (peerTrack) {
                    let newRotationQuaternion = Vector3.FromArray(keyframeData.value).toQuaternion();
                    otherLayers.forEach((otherLayer) => {
                      const otherLayerPeerTrack = otherLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === 'rotationQuaternion');
                      if (otherLayerPeerTrack) {
                        const targetTransformKey = otherLayerPeerTrack.transformKeys.find((key) => key.frame === targetFrameIndex);
                        newRotationQuaternion = newRotationQuaternion
                          .clone()
                          .toEulerAngles()
                          .subtract(
                            targetTransformKey
                              ? targetTransformKey.value.toEulerAngles()
                              : getInterpolatedQuaternion(otherLayerPeerTrack.transformKeys, targetFrameIndex).toEulerAngles(),
                          )
                          .toQuaternion();
                      }
                    });
                    peerTrack.transformKeys = getValueInsertedTransformKeys(peerTrack.transformKeys, targetFrameIndex, newRotationQuaternion);
                  }
                  break;
                }
                case 'scaling': {
                  let newScaling = Vector3.FromArray(keyframeData.value);
                  otherLayers.forEach((otherLayer) => {
                    const otherLayerTrack = otherLayer.tracks.find((track) => track.targetId === keyframeData.targetId && track.property === 'scaling');
                    if (otherLayerTrack) {
                      const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === targetFrameIndex);
                      if (targetTransformKey) {
                        const {
                          value: { x, y, z },
                        } = targetTransformKey;
                        newScaling = new Vector3(x === 0 ? newScaling.x : newScaling.x / x, y === 0 ? newScaling.y : newScaling.y / y, z === 0 ? newScaling.z : newScaling.z / z);
                      } else {
                        const interpolatedVector = getInterpolatedVector(otherLayerTrack.transformKeys, targetFrameIndex);
                        const { x, y, z } = interpolatedVector;
                        newScaling = new Vector3(x === 0 ? newScaling.x : newScaling.x / x, y === 0 ? newScaling.y : newScaling.y / y, z === 0 ? newScaling.z : newScaling.z / z);
                      }
                    }
                  });

                  targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, targetFrameIndex, newScaling);
                  break;
                }
                default: {
                  break;
                }
              }
            }
          });
        }
      });

      // update animationIngredient (and continually currentAnimationGroup too)
      this.plaskEngine.dispatch(
        animationDataActions.editAnimationIngredient({
          animationIngredient: newAnimationIngredient,
        }),
      );
    }
  }

  /**
   * create our custom animation data(animationIngredient) from AnimationGroup
   * @param assetId - asset's id
   * @param animationIngredientName - name of the motion
   * @param targetedAnimations - animations with target used as the source for animationIngredient keyframes
   * @param targets - targets of the animations(transformNode or mesh)
   * @param isMocapAnimation - whether if the animation is from mocap data
   * @param current - if the animationIngredient is visualized currently
   */
  public createAnimationIngredient(
    assetId: string,
    animationIngredientName: string,
    targetedAnimations: TargetedAnimation[],
    targets: (TransformNode | Mesh)[],
    isMocapAnimation: boolean,
    current: boolean,
  ): AnimationIngredient {
    // add 'baseLayer//' in front of the baseLayer's id
    const layerId = `baseLayer//${getRandomStringKey()}`;

    const tracks: PlaskTrack[] = [];

    // 1) to maintain tracks's order 2) to handle animation with key only for one property
    // using the way creating empty tracks and then fill them
    targets.forEach((target) => {
      const positionTrack = this.createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|position`, layerId, target, 'position', [], isMocapAnimation);
      const rotationTrack = this.createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|rotation`, layerId, target, 'rotation', [], isMocapAnimation);
      // prettier-ignore
      const rotationQuaternionTrack = this.createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|rotationQuaternion`, layerId, target, 'rotationQuaternion', [], isMocapAnimation)
      const scalingTrack = this.createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|scaling`, layerId, target, 'scaling', [], isMocapAnimation);

      targetedAnimations
        .filter((targetAnimation) => targetAnimation.target.id === target.id)
        .forEach(({ target: t, animation: a }) => {
          if (a.targetProperty === 'position') {
            positionTrack.transformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // use integer frame
          } else if (a.targetProperty === 'rotationQuaternion') {
            const quaternionTransformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // use integer frame
            rotationQuaternionTrack.transformKeys = quaternionTransformKeys;

            const eulerTransformKeys: IAnimationKey[] = quaternionTransformKeys.map((transformKey) => {
              const q: Quaternion = transformKey.value;
              const e = q.toEulerAngles();
              return { frame: transformKey.frame, value: e };
            });
            rotationTrack.transformKeys = eulerTransformKeys;
          } else if (a.targetProperty === 'scaling') {
            scalingTrack.transformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // use integer frame
          }
        });

      tracks.push(positionTrack);
      tracks.push(rotationTrack);
      tracks.push(rotationQuaternionTrack);
      tracks.push(scalingTrack);
    });

    const baseLayer: PlaskLayer = { id: layerId, name: 'Base Layer', isIncluded: true, useFilter: false, tracks };

    const animationIngredient = {
      id: getRandomStringKey(),
      name: animationIngredientName,
      assetId,
      current,
      layers: [baseLayer],
    };

    return animationIngredient;
  }

  /**
   * create animationIngredient with model and mocap
   * @param assetId - asset's id
   * @param animationIngredientName - name of motion
   * @param retargetMap - object mapping target bones to source bones
   * @param initialPoses - initial pose of transformNodes included in the target asset
   * @param animatableTransformNodes - animatable transformNodes of the target asset
   * @param mocapData - mocap data extracted from video
   * @param timeout - timeout in ms
   */
  public createAnimationIngredientFromMocapData(
    assetId: string,
    animationIngredientName: string,
    retargetMap: PlaskRetargetMap,
    initialPoses: PlaskPose[],
    animatableTransformNodes: TransformNode[],
    mocapData: PlaskMocapData,
    timeout?: number,
  ): Promise<AnimationIngredient> {
    // create empty animationIngredient and fill its tracks
    const emptyAnimationIngredient = this.createAnimationIngredient(assetId, animationIngredientName, [], animatableTransformNodes, true, false);

    const baseLayer = emptyAnimationIngredient.layers[0];

    const { tracks } = baseLayer;
    const { hipSpace } = retargetMap;

    // iterate mocapData not tracks for efficiency
    mocapData.forEach((mocapDatum) => {
      const { boneName, property, transformKeys } = mocapDatum;
      const targetTransformNodeId = retargetMap.values.find((value) => value.sourceBoneName === boneName)?.targetTransformNodeId;

      if (targetTransformNodeId) {
        if (property === 'rotationQuaternion') {
          // add transformKeys both rotation track and its peer rotationQuaternion track
          const targetRotationTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === 'rotation');
          const targetRotationQuaternionTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === 'rotationQuaternion');
          const targetInitialPose = initialPoses.find((initialPose) => initialPose.target.id === targetTransformNodeId)!;

          if (targetRotationTrack && targetRotationQuaternionTrack) {
            transformKeys.forEach((transformKey) => {
              const { frame, value } = transformKey;

              const targetQ = Quaternion.FromArray(value);
              const initialLocalQ = targetInitialPose.rotationQuaternion.clone();
              const recurrentQ = targetInitialPose.recurrentRotationQuaternion!.clone();
              const inversedRecurrentQ = Quaternion.Inverse(recurrentQ.clone());

              const q = initialLocalQ.multiply(inversedRecurrentQ).multiply(targetQ).multiply(recurrentQ);
              const e = q.toEulerAngles();

              targetRotationQuaternionTrack.transformKeys.push({ frame, value: q });
              targetRotationTrack.transformKeys.push({ frame, value: e });
            });
          }
        } else if (property === 'position') {
          const targetTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === property);

          if (targetTrack) {
            transformKeys.forEach((transformKey) => {
              const { frame, value } = transformKey;
              const newValue = value.map((v, idx) => (idx === 2 ? ((v * 100 - 106) * hipSpace) / 106 : (v * 100 * hipSpace) / 106));
              targetTrack.transformKeys.push({ frame, value: Vector3.FromArray(newValue) }); // the root mesh is scaled down to 1/100, all transformKeys have to have 100 * value
            });
          }
        } else if (property === 'scaling') {
          const targetTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === property);

          if (targetTrack) {
            transformKeys.forEach((transformKey) => {
              const { frame, value } = transformKey;
              targetTrack.transformKeys.push({ frame, value: Vector3.FromArray(value) });
            });
          }
        }
      }
    });

    return new Promise((resolve, reject) => {
      resolve(emptyAnimationIngredient);

      setTimeout(() => {
        reject("Timeout: Can't apply mocap data to this model");
      }, timeout ?? 3000);
    });
  }

  /**
   * Create PlaskTrack which constitutes PlaskLayer.
   * cf. AnimationIngredient > PlaskLayer > PlaskTrack
   * @param name - track's name
   * @param layerId - id of the layer where the track is included in
   * @param target - track's target
   * @param property - target's propery that the track will handle
   * @param transformKeys - array of transformKeys (cf. each transformKey contains frame and value)
   * @param isMocapAnimation - whether this track is from mocap data or not
   */
  public createPlaskTrack(name: string, layerId: string, target: any, property: PlaskProperty, transformKeys: IAnimationKey[], isMocapAnimation: boolean): PlaskTrack {
    let filterBeta = DEFAULT_BETA;
    let filterMinCutoff = DEFAULT_MIN_CUTOFF;

    if (isMocapAnimation) {
      if (property === 'rotationQuaternion') {
        filterBeta = MOCAP_QUATERNION_BETA;
        filterMinCutoff = MOCAP_QUATERNION_MIN_CUTOFF;
      } else if (property === 'position') {
        filterBeta = MOCAP_POSITION_BETA;
        filterMinCutoff = MOCAP_POSITION_MIN_CUTOFF;
      }
    }

    return {
      id: `${layerId}//${target.id}//${property}`,
      targetId: target.id,
      layerId,
      name,
      property,
      target,
      transformKeys,
      interpolationType: 'linear',
      isMocapAnimation,
      filterBeta,
      filterMinCutoff,
      isLocked: false,
    };
  }

  /**
   * create BABYLON.AnimationGroup with our custom animation data(animationIngredient)
   * @param animationIngredient - ingredient for animationGroup
   * @param fps - fps of the animationGroup
   */
  public createAnimationGroupFromIngredient(animationIngredient: AnimationIngredient, fps: number): AnimationGroup {
    const { name, layers } = animationIngredient;

    const newAnimationGroup = new AnimationGroup(name);

    const transformKeysListForTargetId: {
      [id in string]: {
        target: Mesh | TransformNode;
        positionTransformKeysList: Array<IAnimationKey[]>;
        rotationQuaternionTransformKeysList: Array<IAnimationKey[]>;
        scalingTransformKeysList: Array<IAnimationKey[]>;
      };
    } = {};

    // should accumulate all the layers
    layers.forEach((layer) => {
      if (layer.isIncluded) {
        const useFilter = layer.useFilter;

        layer.tracks.forEach((track) => {
          // don't use emtpy track
          if (track.transformKeys.length > 0) {
            if (track.property !== 'rotation') {
              // rotation track is only for the TimelinePanel
              // we use rotationQuaternion track for creating animationGroup

              if (track.property === 'position') {
                if (transformKeysListForTargetId[track.targetId]) {
                  transformKeysListForTargetId[track.targetId].positionTransformKeysList.push(
                    useFilter ? this.filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                  );
                } else {
                  transformKeysListForTargetId[track.targetId] = {
                    target: track.target,
                    positionTransformKeysList: [useFilter ? this.filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                    rotationQuaternionTransformKeysList: [],
                    scalingTransformKeysList: [],
                  };
                }
              } else if (track.property === 'rotationQuaternion') {
                if (transformKeysListForTargetId[track.targetId]) {
                  transformKeysListForTargetId[track.targetId].rotationQuaternionTransformKeysList.push(
                    useFilter ? this.filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                  );
                } else {
                  transformKeysListForTargetId[track.targetId] = {
                    target: track.target,
                    positionTransformKeysList: [],
                    rotationQuaternionTransformKeysList: [useFilter ? this.filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                    scalingTransformKeysList: [],
                  };
                }
              } else if (track.property === 'scaling') {
                if (transformKeysListForTargetId[track.targetId]) {
                  transformKeysListForTargetId[track.targetId].scalingTransformKeysList.push(
                    useFilter ? this.filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                  );
                } else {
                  transformKeysListForTargetId[track.targetId] = {
                    target: track.target,
                    positionTransformKeysList: [],
                    rotationQuaternionTransformKeysList: [],
                    scalingTransformKeysList: [useFilter ? this.filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                  };
                }
              }
            }
          }
        });
      }
    });

    Object.entries(transformKeysListForTargetId).forEach(([targetId, { target, positionTransformKeysList, rotationQuaternionTransformKeysList, scalingTransformKeysList }]) => {
      const positionTotalTransformKeys = this.getTotalTransformKeys(positionTransformKeysList, 'position');
      const rotationQuaternionTotalTransformKeys = this.getTotalTransformKeys(rotationQuaternionTransformKeysList, 'rotationQuaternion');
      const scalingTotalTransformKeys = this.getTotalTransformKeys(scalingTransformKeysList, 'scaling');

      if (target.name == 'leftArm' || target.name == 'leftForeArm' || target.name == 'leftHand') {
        console.log(target.name, positionTotalTransformKeys, rotationQuaternionTotalTransformKeys, scalingTotalTransformKeys);
      }

      const newPositionAnimation = new Animation(`${target.name}|position`, 'position', fps, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
      newPositionAnimation.setKeys(positionTotalTransformKeys);

      const newRotationQuaternionAnimation = new Animation(
        `${target.name}|rotationQuaternion`,
        'rotationQuaternion',
        fps,
        Animation.ANIMATIONTYPE_QUATERNION,
        Animation.ANIMATIONLOOPMODE_CYCLE,
      );
      newRotationQuaternionAnimation.setKeys(rotationQuaternionTotalTransformKeys);

      // prettier-ignore
      const newScalingAnimation = new Animation(
      `${target.name}|scaling`,
      'scaling',
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE,
    );
      newScalingAnimation.setKeys(scalingTotalTransformKeys);

      if (newPositionAnimation.getKeys().length > 0) {
        newAnimationGroup.addTargetedAnimation(newPositionAnimation, target);
      }
      if (newRotationQuaternionAnimation.getKeys().length > 0) {
        newAnimationGroup.addTargetedAnimation(newRotationQuaternionAnimation, target);
      }
      if (newScalingAnimation.getKeys().length > 0) {
        newAnimationGroup.addTargetedAnimation(newScalingAnimation, target);
      }
    });

    return newAnimationGroup;
  }

  /**
   * Filter transformKeys containing vector values.
   * cf. filter with OneEuro filter
   * @param transformKeys - target transformKeys
   * @param minCutoff - filter minCutoff value
   * @param beta - filter beta value
   */
  public filterVector(transformKeys: IAnimationKey[], minCutoff: number, beta: number): IAnimationKey[] {
    const oneEuroFilterVector = new OneEuroFilterForVector(minCutoff, beta);
    const filteredTransformKeys = transformKeys.map((transformKey) => ({
      frame: transformKey.frame,
      value: oneEuroFilterVector.calculate(transformKey.frame, transformKey.value),
    }));

    return filteredTransformKeys;
  }

  /**
   * Filter transformKeys containing quaternion values.
   * cf. filter with OneEuro filter
   * @param transformKeys - target transformKeys
   * @param minCutoff - filter minCutoff value
   * @param beta - filter beta value
   */
  public filterQuaternion(transformKeys: IAnimationKey[], minCutoff: number, beta: number): IAnimationKey[] {
    const oneEuroFilterQuaternion = new OneEuroFilterForQuaternion(minCutoff, beta);
    const filteredTransformKeys = transformKeys.map((transformKey) => ({
      frame: transformKey.frame,
      value: oneEuroFilterQuaternion.calculate(transformKey.frame, transformKey.value),
    }));

    return filteredTransformKeys;
  }

  /**
   * return transfomKeys with total values of given transformKeys list
   * @param transformKeysList - target transformKeys list (array of arrays of transformKey)
   * @param property - property of target track
   */
  public getTotalTransformKeys(transformKeysList: Array<IAnimationKey[]>, property: Omit<PlaskProperty, 'rotation'>) {
    const unionFrames = this._getUnionFrames(transformKeysList);
    const linearInterpolatedTransformKeysList = transformKeysList.map((transformKeys) =>
      this._getLinearInterpolatedTransformKeys(transformKeys, unionFrames, property === 'rotationQuaternion'),
    );

    const totalTransformKeys = zipWith(...linearInterpolatedTransformKeysList, (...transformKeys) => {
      let value: Vector3 | Quaternion;
      if (property === 'position') {
        value = this._getPositionSum(transformKeys.map((key) => key.value));
      } else if (property === 'rotationQuaternion') {
        value = this._getRotationQuaternionSum(transformKeys.map((key) => key.value));
      } else {
        value = this._getScalingSum(transformKeys.map((key) => key.value));
      }

      return {
        frame: transformKeys[0].frame,
        value,
      };
    });

    return totalTransformKeys;
  }

  /**
   * return union array of frames from given transformKeys list's frames
   * @param transformKeysList - target transformKeys list (array of arrays of transformKey)
   */
  private _getUnionFrames(transformKeysList: Array<IAnimationKey[]>) {
    const targetFrames: Array<number[]> = [];

    transformKeysList.forEach((transformKeys) => {
      targetFrames.push(transformKeys.map((key) => key.frame));
    });

    return union(...targetFrames).sort((a, b) => a - b);
  }

  /**
   * Modify transformKeys to have a key for at all target frames and ruturn the result
   * (frame without key will be filled with a key containing linear interpolated value)
   * Can be used before calculating sum between layers
   * @param transformKeys - target transformKeys
   * @param targetFrames - target frames
   * @param isQuaternionTrack - whether the track is for quaternion values or not (for vector values)
   */
  private _getLinearInterpolatedTransformKeys(transformKeys: IAnimationKey[], targetFrames: number[], isQuaternionTrack: boolean): IAnimationKey[] {
    if (transformKeys.length === 0) {
      return targetFrames.map((targetFrame) => ({ frame: targetFrame, value: isQuaternionTrack ? Quaternion.Identity() : Vector3.Zero() }));
    } else {
      const newTransformKeys: IAnimationKey[] = [];

      targetFrames.forEach((targetFrame, idx) => {
        if (targetFrame < transformKeys[0].frame) {
          newTransformKeys.push({ frame: targetFrame, value: transformKeys[0].value });
        } else if (targetFrame < transformKeys[transformKeys.length - 1].frame) {
          const targetTransformKey = transformKeys.find((key) => key.frame === targetFrame);
          if (targetTransformKey) {
            newTransformKeys.push({ frame: targetFrame, value: targetTransformKey.value });
          } else {
            const prevTimeIndex = findLastIndex(transformKeys, (key) => key.frame < targetFrame);
            const nextTimeIndex = findIndex(transformKeys, (key) => key.frame > targetFrame);
            const deltaTime = transformKeys[nextTimeIndex].frame - transformKeys[prevTimeIndex].frame;
            const deltaValue = isQuaternionTrack
              ? transformKeys[nextTimeIndex].value.toEulerAngles().subtract(transformKeys[prevTimeIndex].value.toEulerAngles()).toQuaternion()
              : transformKeys[nextTimeIndex].value.subtract(transformKeys[prevTimeIndex].value);
            const multiplier = (targetFrame - transformKeys[prevTimeIndex].frame) / deltaTime;
            const newValue = isQuaternionTrack
              ? transformKeys[prevTimeIndex].value.toEulerAngles().add(deltaValue.toEulerAngles().multiplyByFloats(multiplier, multiplier, multiplier)).toQuaternion()
              : transformKeys[prevTimeIndex].value.add(deltaValue.multiplyByFloats(multiplier, multiplier, multiplier));
            newTransformKeys.push({ frame: targetFrame, value: newValue });
          }
        } else if (targetFrame >= transformKeys[transformKeys.length - 1].frame) {
          newTransformKeys.push({ frame: targetFrame, value: transformKeys[transformKeys.length - 1].value });
        }
      });

      return newTransformKeys;
    }
  }

  /**
   *  return sum of position values in the give array
   * @param values - target position array
   */
  private _getPositionSum(values: Vector3[]) {
    let total = Vector3.Zero();
    values.forEach((value) => {
      total = total.add(value.clone());
    });

    return total;
  }

  /**
   * return sum of quaternion values in the give array
   * compute sum through converting quaternion to eulers
   * @param values target quaternion array
   */
  private _getRotationQuaternionSum(values: Quaternion[]) {
    let total = Quaternion.Identity();
    values.forEach((value) => {
      const e = value.clone().toEulerAngles();
      total = total.clone().toEulerAngles().add(e).toQuaternion();
    });

    return total;
  }

  /**
   * return total multiplication of scaling values in the give array
   * @param values target scaling array
   */
  private _getScalingSum(values: Vector3[]) {
    let total = new Vector3(1, 1, 1);
    values.forEach((value) => {
      total = new Vector3(total.x * value.x, total.y * value.y, total.z * value.z);
    });

    return total;
  }

  /**
   * Change play speed of the current animationGroup
   * @param key - play speed to apply
   */
  public changePlaySpeed(key: string) {
    if (this._currentAnimationGroup && this._currentAnimationGroup.isPlaying) {
      if (this._currentAnimationGroup.speedRatio < 0) {
        this._currentAnimationGroup.speedRatio = -1 * parseFloat(key);
      } else {
        this._currentAnimationGroup.speedRatio = parseFloat(key);
      }
    }
  }

  /**
   * Play forward current animationGroup
   */
  public playCurrentAnimationGroup() {
    if (this._currentAnimationGroup) {
      if (this._currentAnimationGroup.isPlaying && this._currentAnimationGroup.speedRatio < 0) {
        this._currentAnimationGroup.speedRatio = this.playSpeed;
      } else if (this._currentAnimationGroup.isStarted) {
        this._currentAnimationGroup.speedRatio = this.playSpeed;
        this._currentAnimationGroup.play().goToFrame(this.currentTimeIndex);
      } else {
        this._currentAnimationGroup.start(true, this.playSpeed, this.startTimeIndex, this.endTimeIndex).goToFrame(this.currentTimeIndex - this.startTimeIndex);
      }
    }
  }

  /**
   * Play backward current animationGroup
   */
  public rewindCurrentAnimationGroup() {
    if (this._currentAnimationGroup) {
      if (this._currentAnimationGroup.isPlaying && this._currentAnimationGroup.speedRatio >= 0) {
        this._currentAnimationGroup.speedRatio = -1 * this.playSpeed;
      } else if (this._currentAnimationGroup.isStarted) {
        this._currentAnimationGroup.speedRatio = -1 * this.playSpeed;
        this._currentAnimationGroup.play().goToFrame(this.currentTimeIndex);
      } else {
        this._currentAnimationGroup.start(true, -1 * this.playSpeed, this.startTimeIndex, this.endTimeIndex).goToFrame(this.currentTimeIndex - this.startTimeIndex);
      }
    }
  }

  /**
   * Pause current animationGroup
   */
  public pauseCurrentAnimationGroup() {
    if (this._currentAnimationGroup && this._currentAnimationGroup.isPlaying) {
      this._currentAnimationGroup.pause();
    }
  }

  /**
   * Stop current animationGroup
   */
  public stopCurrentAnimationGroup() {
    if (this._currentAnimationGroup) {
      this._currentAnimationGroup.goToFrame(this.startTimeIndex).stop();
    }
  }

  /**
   * Move current animationGroup to specific timeIndex(frame)
   * @param targetTimeIndex - target frame(index)
   */
  public moveCurrentAnimationGroup(targetTimeIndex: number) {
    if (this._currentAnimationGroup) {
      if (this._currentAnimationGroup.isStarted) {
        this._currentAnimationGroup.goToFrame(targetTimeIndex);
      } else {
        this._currentAnimationGroup.start(true, this.playSpeed, this.startTimeIndex, this.endTimeIndex).pause().goToFrame(targetTimeIndex);
      }
    }
  }

  public reduxObservedStates = ['animationData.animationIngredients', 'plaskProject.visualizedAssetIds', 'animatingControls.startTimeIndex', 'animatingControls.endTimeIndex'];
  public onStateChanged(key: string, previousState: any): void {
    switch (key) {
      case 'animationData.animationIngredients': {
        this.onAnimationDataChangeObservable.notifyObservers({
          animationIngredients: this.animationIngredients,
          visualizedAssetIds: this.visualizedAssetIds,
          startTimeIndex: this.startTimeIndex,
          endTimeIndex: this.endTimeIndex,
        });
        break;
      }
      case 'plaskProject.visualizedAssetIds': {
        this.onAnimationDataChangeObservable.notifyObservers({
          animationIngredients: this.animationIngredients,
          visualizedAssetIds: this.visualizedAssetIds,
          startTimeIndex: this.startTimeIndex,
          endTimeIndex: this.endTimeIndex,
        });
        break;
      }
      case 'animatingControls.startTimeIndex': {
        this.onAnimationDataChangeObservable.notifyObservers({
          animationIngredients: this.animationIngredients,
          visualizedAssetIds: this.visualizedAssetIds,
          startTimeIndex: this.startTimeIndex,
          endTimeIndex: this.endTimeIndex,
        });
        break;
      }
      case 'animatingControls.endTimeIndex': {
        this.onAnimationDataChangeObservable.notifyObservers({
          animationIngredients: this.animationIngredients,
          visualizedAssetIds: this.visualizedAssetIds,
          startTimeIndex: this.startTimeIndex,
          endTimeIndex: this.endTimeIndex,
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  public get currentAnimationGroup() {
    return this._currentAnimationGroup;
  }
  public get visualizedAssetIds() {
    return this.plaskEngine.state.plaskProject.visualizedAssetIds;
  }
  public get fps() {
    return this.plaskEngine.state.plaskProject.fps;
  }
  public get animationIngredients() {
    return this.plaskEngine.state.animationData.animationIngredients;
  }
  public get playState() {
    return this.plaskEngine.state.animatingControls.playState;
  }
  public get playDirection() {
    return this.plaskEngine.state.animatingControls.playDirection;
  }
  public get playSpeed() {
    return this.plaskEngine.state.animatingControls.playSpeed;
  }
  public get startTimeIndex() {
    return this.plaskEngine.state.animatingControls.startTimeIndex;
  }
  public get endTimeIndex() {
    return this.plaskEngine.state.animatingControls.endTimeIndex;
  }
  public get currentTimeIndex() {
    return this.plaskEngine.state.animatingControls.currentTimeIndex;
  }
}
