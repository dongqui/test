import { Animation, AnimationGroup, IAnimationKey, Mesh, TransformNode } from '@babylonjs/core';
import { AnimationIngredient } from 'types/common';
import filterQuaternion from './filterQuaternion';
import filterVector from './filterVector';
import getTotalTransformKeys from './getTotalTransformKeys';

/**
 * create BABYLON.AnimationGroup with our custom animation data(animationIngredient)
 *
 * @param animationIngredient
 * @param fps - fps of the animationGroup
 */
const createAnimationGroupFromIngredient = (animationIngredient: AnimationIngredient, fps: number): AnimationGroup => {
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
                  useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                );
              } else {
                transformKeysListForTargetId[track.targetId] = {
                  target: track.target,
                  positionTransformKeysList: [useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                  rotationQuaternionTransformKeysList: [],
                  scalingTransformKeysList: [],
                };
              }
            } else if (track.property === 'rotationQuaternion') {
              if (transformKeysListForTargetId[track.targetId]) {
                transformKeysListForTargetId[track.targetId].rotationQuaternionTransformKeysList.push(
                  useFilter ? filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                );
              } else {
                transformKeysListForTargetId[track.targetId] = {
                  target: track.target,
                  positionTransformKeysList: [],
                  rotationQuaternionTransformKeysList: [useFilter ? filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                  scalingTransformKeysList: [],
                };
              }
            } else if (track.property === 'scaling') {
              if (transformKeysListForTargetId[track.targetId]) {
                transformKeysListForTargetId[track.targetId].scalingTransformKeysList.push(
                  useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                );
              } else {
                transformKeysListForTargetId[track.targetId] = {
                  target: track.target,
                  positionTransformKeysList: [],
                  rotationQuaternionTransformKeysList: [],
                  scalingTransformKeysList: [useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                };
              }
            }
          }
        }
      });
    }
  });

  Object.entries(transformKeysListForTargetId).forEach(([targetId, { target, positionTransformKeysList, rotationQuaternionTransformKeysList, scalingTransformKeysList }]) => {
    const positionTotalTransformKeys = getTotalTransformKeys(positionTransformKeysList, 'position');
    const rotationQuaternionTotalTransformKeys = getTotalTransformKeys(rotationQuaternionTransformKeysList, 'rotationQuaternion');
    const scalingTotalTransformKeys = getTotalTransformKeys(scalingTransformKeysList, 'scaling');

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
};

export default createAnimationGroupFromIngredient;
