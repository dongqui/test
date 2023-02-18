import { PlaskEngine } from '3d/PlaskEngine';
import { Animation, AnimationGroup, IAnimationKey, Matrix, Mesh, Nullable, Observable, Quaternion, TargetedAnimation, TransformNode, Vector3 } from '@babylonjs/core';
import produce from 'immer';
import { findIndex, findLastIndex, round, union, zipWith } from 'lodash';
import {
  AnimationIngredient,
  PlaskLayer,
  PlaskMocapData,
  PlaskPose,
  PlaskProperty,
  PlaskPropertyFormat,
  PlaskRetargetMap,
  PlaskTrack,
  QuaternionTransformKey,
  ServerAnimation,
  ServerAnimationRequest,
  ServerAnimationLayer,
  ServerAnimationLayerRequest,
  ServerAnimationTrackRequest,
  ServerTransformKeyRequest,
  VectorTransformKey,
  ArrayOfThreeNumbers,
  ArrayOfFourNumbers,
  ContactData,
} from 'types/common';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import * as animationDataActions from 'actions/animationDataAction';
import { getRandomStringKey } from 'utils/common';
import { getInterpolatedQuaternion, getInterpolatedVector, getValueInsertedTransformKeys } from 'utils/RP';
import { DEFAULT_BETA, DEFAULT_MIN_CUTOFF, MOCAP_POSITION_BETA, MOCAP_POSITION_MIN_CUTOFF, MOCAP_QUATERNION_BETA, MOCAP_QUATERNION_MIN_CUTOFF } from 'utils/const';
import OneEuroFilterForQuaternion from 'utils/RP/OneEuroFilterForQuaternion';
import OneEuroFilterForVector from 'utils/RP/OneEuroFilterForVector';
import { Module } from '../Module';
import { getInterpolatedValue } from 'utils/RP/getInterpolatedValue';

/**
 * Module that handles all animation related stuff in the 3D engine
 */
export class AnimationModule extends Module {
  private _currentAnimationGroup: Nullable<AnimationGroup>;

  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);

    this._currentAnimationGroup = null;
  }

  static ingredientToServerData(animationIngredient: AnimationIngredient, fps: number, isMocapAnimation: boolean): [ServerAnimationRequest, ServerAnimationLayerRequest[]] {
    const serverAnimation: ServerAnimationRequest = {
      name: animationIngredient.name,
      fps,
      isMocapAnimation,
      isDeleted: false,
    };

    const serverAnimationLayers: ServerAnimationLayerRequest[] = [];
    animationIngredient.layers.forEach((layer) => {
      const serverAnimationTracks: ServerAnimationTrackRequest[] = [];
      layer.tracks.forEach((track) => {
        const transformKeysMap = track.transformKeys.map((transformKey) => {
          let value;
          switch (PlaskPropertyFormat[track.property]) {
            case Animation.ANIMATIONTYPE_FLOAT:
              value = transformKey.value;
              break;
            case Animation.ANIMATIONTYPE_QUATERNION:
              value = { w: transformKey.value.w, x: transformKey.value.x, y: transformKey.value.y, z: transformKey.value.z };
              break;
            case Animation.ANIMATIONTYPE_VECTOR3:
              value = { x: transformKey.value.x, y: transformKey.value.y, z: transformKey.value.z };
              break;
            default:
              value = transformKey.value;
              break;
          }
          const serverTransformKey: ServerTransformKeyRequest = {
            frameIndex: transformKey.frame,
            property: track.property,
            transformKey: value,
          };
          return serverTransformKey;
        });

        const serverAnimationTrack: ServerAnimationTrackRequest = {
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
      const serverAnimationLayer: ServerAnimationLayerRequest = {
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

  /**
   * Creates an animation ingredient from server data
   * @param serverAnimation
   * @param serverAnimationLayers
   * @param isMocapAnimation
   * @param selectableObjects
   * @param current
   * @returns
   */
  serverDataToIngredient(
    serverAnimation: ServerAnimation,
    serverAnimationLayers: ServerAnimationLayer[],
    transformNodes: TransformNode[],
    current: boolean,
    assetId: string,
  ): {
    animationIngredient: AnimationIngredient;
  } {
    const layers: PlaskLayer[] = [];
    serverAnimationLayers.forEach((serverAnimationLayer) => {
      const { uid: layerId, name: layerName, isIncluded, useFilter, tracks: serverTracks } = serverAnimationLayer;
      const tracks: PlaskTrack[] = [];

      serverTracks.forEach((serverTrack) => {
        const transformKeys: IAnimationKey[] = [];

        const fromServerValue = (value: any, property: string) => {
          switch (PlaskPropertyFormat[serverTrack.property]) {
            case Animation.ANIMATIONTYPE_FLOAT:
              return value;
            case Animation.ANIMATIONTYPE_QUATERNION:
              return new Quaternion(value.x, value.y, value.z, value.w);
            case Animation.ANIMATIONTYPE_VECTOR3:
              return new Vector3(value.x, value.y, value.z);
            default:
              return value;
          }
        };

        serverTrack.transformKeysMap.sort((a, b) => a.frameIndex - b.frameIndex);

        for (const transformKey of serverTrack.transformKeysMap) {
          transformKeys.push({ frame: transformKey.frameIndex, value: fromServerValue(transformKey.transformKey, serverTrack.property) });
        }

        const track: PlaskTrack = {
          id: serverTrack.id,
          targetId: serverTrack.targetId,
          layerId,
          name: serverTrack.name,
          property: serverTrack.property,
          target: transformNodes.find((object) => object.id === serverTrack.targetId)!,
          transformKeys,
          interpolationType: 'linear',
          isMocapAnimation: serverAnimation.isMocapAnimation,
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
      id: serverAnimation.uid,
      name: serverAnimation.name,
      assetId,
      current,
      layers,
    };

    return { animationIngredient };
  }

  /**
   * Inserts contact data into an animation ingredient, so feet are locked
   * @param animationIngredient
   * @param contactData
   */
  public updateIngredientWithFootLocking(animationIngredient: AnimationIngredient, contactData: ContactData) {
    const animationGroupTemp = this.createAnimationGroupFromIngredient(animationIngredient, this.fps);
    const animationIngredientWithFootLocking = this.processContactData(animationIngredient, animationGroupTemp, contactData);

    return animationIngredientWithFootLocking;
  }

  /**
   * Updates the current 3D animations with new data
   * @param animationIngredients Ingredients to generate 3D animations
   * @param visualizedAssetIds Current visualized assetIds (for now only 1 asset is supported)
   * @param startTimeIndex Start time
   * @param endTimeIndex End time
   * @returns A new animation group
   */
  public regenerateAnimations(animationIngredients: AnimationIngredient[], visualizedAssetIds: string[], startTimeIndex: number, endTimeIndex: number) {
    if (this.currentAnimationGroup) {
      this.currentAnimationGroup.stop();
      this.currentAnimationGroup.dispose();
      this._currentAnimationGroup = null;
    }

    const visualizedAnimationIngredients = animationIngredients.filter(
      (animationIngredient) => visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
    );
    if (visualizedAnimationIngredients.length === 1) {
      const animationGroup = this.createAnimationGroupFromIngredient(visualizedAnimationIngredients[0], this.fps);
      animationGroup.normalize(startTimeIndex, endTimeIndex);

      // Update with current time
      animationGroup.start();
      animationGroup.goToFrame(this.currentTimeIndex);
      animationGroup.stop();

      this._currentAnimationGroup = animationGroup;
      return animationGroup;
    }
    return null;
  }

  /**
   * Set keyframes for a specific track and layer, ignoring other layers
   * @param targetAnimationIngredient animationIngredient to edit
   * @param targetLayerId id of layer to edit
   * @param targetId id of the target of the track
   * @param property target property of the track
   * @param keyframes keyframes list
   */
  public setKeyframesForTrack(targetAnimationIngredient: AnimationIngredient, targetLayerId: string, targetId: string, property: PlaskProperty, keyframes: IAnimationKey[]) {
    const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
      const targetLayer = draft.layers.find((layer) => layer.id === targetLayerId);
      if (!targetLayer) {
        console.warn('Could not find layer');
        return;
      }
      const targetTrack = targetLayer.tracks.find((track) => track.targetId === targetId && track.property === property);
      if (!targetTrack) {
        console.warn('Could not find track');
        return;
      }
      targetTrack.transformKeys = keyframes;
    });

    return newAnimationIngredient;
  }

  /**
   * Edits keyframes with params so that we don't need to select targets in RenderingPanel
   * @param targetAnimationIngredient - animationIngredent to edit
   * @param targetLayerId - id of layer to edit
   * @param targetFrameIndex - index of frame to edit
   * @param keyframeDataList - list of data that is used to edit keyframes, including targetId, property, value
   */
  public static EditKeyframesWithParams(
    targetAnimationIngredient: AnimationIngredient,
    targetLayerId: string,
    targetFrameIndex: number,
    keyframeDataList: Array<{ targetId: string; property: PlaskProperty; value: ArrayOfThreeNumbers | ArrayOfFourNumbers | number }>,
  ) {
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
                  let newPosition = Vector3.FromArray(keyframeData.value as ArrayOfThreeNumbers);
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
                  let newRotationQuaternion = Quaternion.FromArray(keyframeData.value as ArrayOfFourNumbers);
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
                    let newRotation = Quaternion.FromArray(keyframeData.value as ArrayOfFourNumbers).toEulerAngles();
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
                  let newRotation = Vector3.FromArray(keyframeData.value as ArrayOfThreeNumbers);
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
                    let newRotationQuaternion = Vector3.FromArray(keyframeData.value as ArrayOfThreeNumbers).toQuaternion();
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
                  let newScaling = Vector3.FromArray(keyframeData.value as ArrayOfThreeNumbers);
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
                  // If not a rotation/rotationQuaternion
                  let value = keyframeData.value as number;
                  otherLayers.forEach((otherLayer) => {
                    const otherLayerTrack = otherLayer.tracks.find((track) => track.targetId === targetTrack.targetId && track.property === targetTrack.property);
                    if (otherLayerTrack) {
                      const targetTransformKey = otherLayerTrack.transformKeys.find((key) => key.frame === targetFrameIndex);
                      let otherValue;
                      if (targetTransformKey) {
                        otherValue = targetTransformKey.value;
                      } else {
                        otherValue = getInterpolatedValue(otherLayerTrack.transformKeys, otherLayerTrack.property, targetFrameIndex);
                      }
                      value = AnimationModule.GetInvertTransformForKeyframe(otherLayerTrack.property, value, otherValue) as number;
                    }
                  });
                  targetTrack.transformKeys = getValueInsertedTransformKeys(targetTrack.transformKeys, targetFrameIndex, value);
                  break;
                }
              }
            }
          });
        }
      });

      return newAnimationIngredient;
    }
    return null;
  }

  /**
   * Create PlaskTracks for a target TransformNode
   * @param animationIngredientName
   * @param targets A list of transform nodes to assign tracks to. 1 track of each property will be created for each target
   * @param trackProperties List of properties to create an animation track of
   * @param layerId Id of the layer to add the tracks to
   * @param isMocapAnimation If the animation tracks are coming from mocap
   * @param targetedAnimations Optional array of existing animations, to fill the created track with existing aniamation data
   */
  public createTracksForProperties(
    animationIngredientName: string,
    targets: TransformNode[],
    trackProperties: PlaskProperty[],
    layerId: string,
    isMocapAnimation = false,
    targetedAnimations: TargetedAnimation[] = [],
  ): PlaskTrack[] {
    const tracks: PlaskTrack[] = [];
    // 1) to maintain tracks's order 2) to handle animation with key only for one property
    // using the way creating empty tracks and then fill them
    targets.forEach((target) => {
      for (const property of trackProperties) {
        const track = this.createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|${property}`, layerId, target, property, [], isMocapAnimation);
        tracks.push(track);
      }
      // Fill tracks with animation data, if provided
      targetedAnimations
        .filter((targetAnimation) => targetAnimation.target.id === target.id)
        .forEach(({ target: t, animation: a }) => {
          const _tracks = tracks.filter((track) => track.target.id === target.id);
          let track = _tracks.find((track) => track.property === a.targetProperty);
          if (!track) {
            console.warn(`Could not fill animation data with ${a.targetProperty} : not supported in this context`);
            return;
          }

          if (a.targetProperty === 'rotation') {
            // Will be handled by rotationquaternion
            return;
          }
          if (a.targetProperty === 'rotationQuaternion') {
            // Fills euler rotation track
            const quaternionTransformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // use integer frame
            track.transformKeys = quaternionTransformKeys;

            track = _tracks.find((track) => track.property === 'rotation');

            const eulerTransformKeys: IAnimationKey[] = quaternionTransformKeys.map((transformKey) => {
              const q: Quaternion = transformKey.value;
              const e = q.toEulerAngles();
              return { frame: transformKey.frame, value: e };
            });
            if (!track) {
              console.warn(`Could not convert rotationQuaternion to an euler track.`);
              return;
            }
            track.transformKeys = eulerTransformKeys;
          } else if (a.targetProperty === 'position' || a.targetProperty === 'scaling') {
            track.transformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // use integer frame
          }
        });
    });
    return tracks;
  }

  /**
   * create our custom animation data(animationIngredient) from AnimationGroup
   * @param assetId - asset's id
   * @param animationIngredientName - name of the motion
   * @param targetedAnimations - animations with target used as the source for animationIngredient keyframes (can be empty to create empty tracks)
   * @param targets - targets of the animations(transformNode or mesh)
   * @param isMocapAnimation - whether if the animation is from mocap data
   * @param current - if the animationIngredient is visualized currently
   * @param trackProperties The default tracks to create
   */

  public createAnimationIngredient(
    assetId: string,
    animationIngredientName: string,
    targetedAnimations: TargetedAnimation[],
    targets: TransformNode[],
    isMocapAnimation: boolean,
    current: boolean,
    trackProperties: PlaskProperty[] = ['position', 'rotation', 'rotationQuaternion', 'scaling', 'isContact'],
    existingLayerId?: string,
  ): AnimationIngredient {
    // add 'baseLayer//' in front of the baseLayer's id
    const layerId = existingLayerId || `baseLayer//${getRandomStringKey()}`;

    const tracks = this.createTracksForProperties(animationIngredientName, targets, trackProperties, layerId, isMocapAnimation, targetedAnimations);
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
    retargetMap: Omit<PlaskRetargetMap, 'id' | 'assetId'>,
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

    const contactData = [];

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

              const targetQ = Quaternion.FromArray(value as ArrayOfFourNumbers);
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
            let transformMatrix = Matrix.IdentityReadOnly;
            if (boneName === 'hips') {
              // Apply position in world space, using initial position as an offset
              const transformNode = animatableTransformNodes.find((tn) => tn.id === targetTransformNodeId);
              if (transformNode && transformNode.parent) {
                transformMatrix = transformNode.parent.getWorldMatrix().clone().invert();
                const targetInitialPose = initialPoses.find((initialPose) => initialPose.target.id === targetTransformNodeId);

                if (targetInitialPose) {
                  transformMatrix.addTranslationFromFloats(targetInitialPose.position.x, targetInitialPose.position.y, targetInitialPose.position.z);
                } else {
                  console.warn('could not find initial pose for hips, position will be incorrect');
                }
              }
            }
            transformKeys.forEach((transformKey) => {
              const { frame, value } = transformKey;
              const newValue = (value as ArrayOfThreeNumbers).map((v, idx) => (v * hipSpace) / 106);
              targetTrack.transformKeys.push({ frame, value: Vector3.TransformCoordinates(Vector3.FromArray(newValue), transformMatrix) }); // the root mesh is scaled down to 1/100, all transformKeys have to have 100 * value
            });
          }
        } else if (property === 'scaling') {
          const targetTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === property);

          if (targetTrack) {
            transformKeys.forEach((transformKey) => {
              const { frame, value } = transformKey;
              targetTrack.transformKeys.push({ frame, value: Vector3.FromArray(value as ArrayOfThreeNumbers) });
            });
          }
        } else if (property === 'isContact') {
          const targetTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === property);
          if (targetTrack) {
            transformKeys.forEach((transformKey) => {
              const { frame, value } = transformKey;
              targetTrack.transformKeys.push({ frame, value });
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
   * Extracts contact info from an animation ingredient
   * @param animationIngredient
   * @returns
   */
  public extractContactData(animationIngredient: AnimationIngredient): Nullable<ContactData> {
    const { name, layers } = animationIngredient;

    const contactData: { boneName: string; transformKeys: IAnimationKey[] }[] = [];
    layers.forEach((layer) => {
      if (layer.isIncluded) {
        layer.tracks.forEach((track) => {
          if (track.property === 'isContact' && track.transformKeys.length) {
            contactData.push({ boneName: track.targetId, transformKeys: track.transformKeys });
          }
        });
      }
    });
    if (!contactData.length) {
      // no contact for this motion
      return null;
    }

    const right = {
      toe: contactData.find((elt) => elt.boneName.toLowerCase().includes('righttoe'))!,
      heel: contactData.find((elt) => elt.boneName.toLowerCase().includes('rightfoot'))!,
    };
    const left = {
      toe: contactData.find((elt) => elt.boneName.toLowerCase().includes('lefttoe'))!,
      heel: contactData.find((elt) => elt.boneName.toLowerCase().includes('leftfoot'))!,
    };

    if (!right.toe || !right.heel || !left.toe || !left.heel) {
      console.warn('Incomplete contact data ! Cannot apply foot locking.');
      return null;
    }

    console.log(right, left);
    return { right, left };
  }

  /**
   * Removes contact data into an animation ingredient, so doesn't compute foot-locking again
   * @param animationIngredient
   */
  public emptyContactDataFromAnimationIngredient(animationIngredient: AnimationIngredient) {
    const animationIngredientRemovedContactData = this.removeContactData(animationIngredient);

    return animationIngredientRemovedContactData;
  }

  /**
   * Generates a new animation ingredient with contact data removed
   * @param animationIngredient
   * @returns
   */
  public removeContactData(animationIngredient: AnimationIngredient) {
    // Compute contact data
    let animationIngredientWithRemovedContactData = produce(animationIngredient, (draft) => {
      draft.layers.map((layer) => {
        if (layer) {
          layer.tracks.map((track) => {
            if (track.property == 'isContact') {
              track.transformKeys = [];
            }
          });
        }
      });
    });
    return animationIngredientWithRemovedContactData;
  }
  /**
   * Generates a new animation ingredient with foot locking (baked in IK tracks)
   * @param animationIngredient
   * @param animationGroup
   * @param contactData
   * @returns
   */
  public processContactData(animationIngredient: AnimationIngredient, animationGroup: AnimationGroup, contactData: ContactData) {
    // Compute contact data
    let animationIngredientWithFootLocking = animationIngredient;

    animationIngredientWithFootLocking =
      this.plaskEngine.ikModule.computeFootLocking(
        'left',
        contactData.left.heel.transformKeys,
        contactData.left.toe.transformKeys,
        animationGroup,
        animationIngredientWithFootLocking,
      ) || animationIngredientWithFootLocking;
    animationIngredientWithFootLocking =
      this.plaskEngine.ikModule.computeFootLocking(
        'right',
        contactData.right.heel.transformKeys,
        contactData.right.toe.transformKeys,
        animationGroup,
        animationIngredientWithFootLocking,
      ) || animationIngredientWithFootLocking;

    return animationIngredientWithFootLocking;
  }

  /**
   * create BABYLON.AnimationGroup with our custom animation data(animationIngredient)
   * @param animationIngredient - ingredient for animationGroup
   * @param fps - fps of the animationGroup
   */
  public createAnimationGroupFromIngredient(animationIngredient: AnimationIngredient, fps: number) {
    const { name, layers } = animationIngredient;

    const newAnimationGroup = new AnimationGroup(name);

    const transformKeysListForTargetId: {
      [id in string]: {
        target: Mesh | TransformNode;
        transformKeysMap: { [key in PlaskProperty]?: Array<IAnimationKey[]> };
      };
    } = {};

    // should accumulate all the layers
    layers.forEach((layer) => {
      if (layer.isIncluded) {
        const useFilter = layer.useFilter;

        layer.tracks.forEach((track) => {
          // don't use emtpy track
          if (!track.transformKeys.length) {
            return;
          }

          if (track.property === 'rotation') {
            // rotation track is only for the TimelinePanel
            // we use rotationQuaternion track for creating animationGroup
            return;
          }

          if (track.property === 'isContact') {
            // We exploit it in extractContactData
            return;
          }

          const propertyFormat = PlaskPropertyFormat[track.property];
          if (!transformKeysListForTargetId[track.targetId]) {
            transformKeysListForTargetId[track.targetId] = {
              target: track.target,
              transformKeysMap: {},
            };
          }
          if (!transformKeysListForTargetId[track.targetId].transformKeysMap[track.property]) {
            transformKeysListForTargetId[track.targetId].transformKeysMap[track.property] = [];
          }

          if (propertyFormat === Animation.ANIMATIONTYPE_VECTOR3) {
            transformKeysListForTargetId[track.targetId].transformKeysMap[track.property]!.push(
              useFilter ? this.filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
            );
          } else if (propertyFormat === Animation.ANIMATIONTYPE_QUATERNION) {
            transformKeysListForTargetId[track.targetId].transformKeysMap[track.property]!.push(
              useFilter ? this.filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
            );
          } else if (propertyFormat === Animation.ANIMATIONTYPE_FLOAT) {
            transformKeysListForTargetId[track.targetId].transformKeysMap[track.property]!.push(track.transformKeys);
          }
        });
      }
    });

    Object.entries(transformKeysListForTargetId).forEach(([targetId, { target, transformKeysMap }]) => {
      let propertyName: PlaskProperty;
      for (propertyName in transformKeysMap) {
        const totalTransformKeys = this.getTotalTransformKeys(transformKeysMap[propertyName]!, propertyName);

        if (target) {
          const newAnimation = new Animation(`${target.name}|${propertyName}`, propertyName, fps, PlaskPropertyFormat[propertyName], Animation.ANIMATIONLOOPMODE_CYCLE);
          newAnimation.setKeys(totalTransformKeys);

          if (newAnimation.getKeys().length > 0) {
            newAnimationGroup.addTargetedAnimation(newAnimation, target);
          }
        }
      }
    });

    // dispatch(editAnimationIngredient({ animationIngredient }));
    // dispatch(changeSelectedTargets());
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
    // All the unique frames in order
    const unionFrames = this._getUnionFrames(transformKeysList);
    // Gets each transformKey array to have a value on the unique frames, by linearly interpolating to fill the gaps
    const linearInterpolatedTransformKeysList = transformKeysList.map((transformKeys) =>
      this._getLinearInterpolatedTransformKeys(transformKeys, unionFrames, property === 'rotationQuaternion'),
    );

    // Sums all layers (each transformKeys in transformKeysList) for each frame
    const totalTransformKeys = zipWith(...linearInterpolatedTransformKeysList, (...transformKeys) => {
      let value: Vector3 | number | Quaternion;

      switch (property) {
        case 'position':
          value = this._getPositionSum(transformKeys.map((key) => key.value));
          break;

        case 'rotationQuaternion':
          value = this._getRotationQuaternionSum(transformKeys.map((key) => key.value));
          break;
        case 'scaling':
          value = this._getScalingSum(transformKeys.map((key) => key.value));
          break;

        // case 'blend':
        //   break;

        // case 'poleAngle':
        //   break;

        default:
          value = this._combine(transformKeys.map((key) => key.value));
          break;
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
              : typeof transformKeys[nextTimeIndex].value === 'number'
              ? transformKeys[nextTimeIndex].value - transformKeys[prevTimeIndex].value
              : transformKeys[nextTimeIndex].value.subtract(transformKeys[prevTimeIndex].value);
            const multiplier = (targetFrame - transformKeys[prevTimeIndex].frame) / deltaTime;
            const newValue = isQuaternionTrack
              ? transformKeys[prevTimeIndex].value.toEulerAngles().add(deltaValue.toEulerAngles().multiplyByFloats(multiplier, multiplier, multiplier)).toQuaternion()
              : typeof transformKeys[nextTimeIndex].value === 'number'
              ? transformKeys[nextTimeIndex].value + deltaValue * multiplier
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

  public static GetInvertTransformForKeyframe(property: PlaskProperty, value: Quaternion | Vector3 | number, otherValue: Quaternion | Vector3 | number) {
    if (property === 'position' || property === 'rotation') {
      return (value as Vector3).subtract(otherValue as Vector3);
    } else if (property === 'rotationQuaternion') {
      return (value as Quaternion)
        .toEulerAngles()
        .subtract((otherValue as Quaternion).toEulerAngles())
        .toQuaternion();
    } else if (property === 'scaling') {
      value = (value as Vector3).divide(new Vector3((otherValue as Vector3).x || 1, (otherValue as Vector3).y || 1, (otherValue as Vector3).z || 1));
    }
    // All other properties are averaged so value does not need to be altered
    return value;
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
   * Combines multiple values by taking the average
   * @param values
   */

  private _combine<T extends Vector3[] | number[]>(values: T) {
    if (!values.length) {
      throw new Error('Empty combine frames');
    }

    if (values[0] instanceof Vector3) {
      const total = Vector3.Zero();
      (values as Vector3[]).reduce((accumulator: Vector3, value: Vector3) => accumulator.addInPlace(value), total);
      return total.scaleInPlace(1 / values.length);
    }
    if (typeof values[0] === 'number') {
      let total = 0;
      total = (values as number[]).reduce((accumulator: number, value: number) => accumulator + value, total);
      return total / values.length;
    }

    throw new Error('Unsupported keyframe type');
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

  /**
   * Returns the currently used animation ingredient for an assetId
   * @param assetId
   */
  public getCurrentAnimationIngredient(assetId: string) {
    return this.animationIngredients.find((animationIngredient) => assetId.includes(animationIngredient.assetId) && animationIngredient.current);
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
