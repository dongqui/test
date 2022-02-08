import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient } from 'types/common';
import filterQuaternion from './filterQuaternion';
import filterVector from './filterVector';
import getTotalTransformKeys from './getTotalTransformKeys';

/**
 * 자체데이터인 animationIngredient를 사용해 BABYLON 객체인 animationGroup을 생성해 반환합니다.
 * 필터 사용여부를 인자로 전달받는데, RP에서 생성할 때는 false, LP에서 export를 위해 생성할 때는 true를 줍니다. (트랙의 useFilter와는 별개)
 *
 * @param animationIngredient - animationGroup을 생성할 재료
 * @param fps - 생성할 animationGroup의 fps
 * @param useFilter - 필터사용 여부
 */
const createAnimationGroupFromIngredient = (animationIngredient: AnimationIngredient, fps: number, useFilter: boolean): BABYLON.AnimationGroup => {
  const { name, layers } = animationIngredient;

  const newAnimationGroup = new BABYLON.AnimationGroup(name);

  const transformKeysListForTargetId: {
    [id in string]: {
      target: BABYLON.Mesh | BABYLON.TransformNode;
      positionTransformKeysList: Array<BABYLON.IAnimationKey[]>;
      rotationQuaternionTransformKeysList: Array<BABYLON.IAnimationKey[]>;
      scalingTransformKeysList: Array<BABYLON.IAnimationKey[]>;
    };
  } = {};

  layers.forEach((layer) => {
    if (layer.isIncluded) {
      layer.tracks.forEach((track) => {
        // 비어있는 트랙은 애니메이션 그룹 생성 시 사용하지 않음
        if (track.transformKeys.length > 0) {
          if (track.property !== 'rotation') {
            // rotation track은 단순히 TP내 렌더링 역할만을 하며, 애니메이션 생성 시에는 rotationQuaternion track을 사용

            if (track.property === 'position') {
              if (transformKeysListForTargetId[track.targetId]) {
                transformKeysListForTargetId[track.targetId].positionTransformKeysList.push(
                  useFilter && track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                );
              } else {
                transformKeysListForTargetId[track.targetId] = {
                  target: track.target,
                  positionTransformKeysList: [useFilter && track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                  rotationQuaternionTransformKeysList: [],
                  scalingTransformKeysList: [],
                };
              }
            } else if (track.property === 'rotationQuaternion') {
              if (transformKeysListForTargetId[track.targetId]) {
                transformKeysListForTargetId[track.targetId].rotationQuaternionTransformKeysList.push(
                  useFilter && track.useFilter ? filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                );
              } else {
                transformKeysListForTargetId[track.targetId] = {
                  target: track.target,
                  positionTransformKeysList: [],
                  rotationQuaternionTransformKeysList: [
                    useFilter && track.useFilter ? filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                  ],
                  scalingTransformKeysList: [],
                };
              }
            } else if (track.property === 'scaling') {
              if (transformKeysListForTargetId[track.targetId]) {
                transformKeysListForTargetId[track.targetId].scalingTransformKeysList.push(
                  useFilter && track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                );
              } else {
                transformKeysListForTargetId[track.targetId] = {
                  target: track.target,
                  positionTransformKeysList: [],
                  rotationQuaternionTransformKeysList: [],
                  scalingTransformKeysList: [useFilter && track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
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

    const newPositionAnimation = new BABYLON.Animation(
      `${target.name}|position`,
      'position',
      fps,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    );
    newPositionAnimation.setKeys(positionTotalTransformKeys);

    const newRotationQuaternionAnimation = new BABYLON.Animation(
      `${target.name}|rotationQuaternion`,
      'rotationQuaternion',
      fps,
      BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    );
    newRotationQuaternionAnimation.setKeys(rotationQuaternionTotalTransformKeys);

    // prettier-ignore
    const newScalingAnimation = new BABYLON.Animation(
      `${target.name}|scaling`,
      'scaling',
      fps,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
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
