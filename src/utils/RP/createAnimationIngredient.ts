import * as BABYLON from '@babylonjs/core';
import { round } from 'lodash';
import { AnimationIngredient, PlaskLayer, PlaskTrack } from 'types/common';
import { getRandomStringKey } from 'utils/common';
import createPlaskTrack from './createPlaskTrack';

/**
 * create our custom animation data(animationIngredient) from BABYLON.AnimationGroup
 *
 * @param assetId - asset's id
 * @param animationIngredientName - name of the motion
 * @param targetedAnimations - animations with target used as the source for animationIngredient keyframes
 * @param targets - targets of the animations(transformNode or mesh)
 * @param isMocapAnimation - whether if the animation is from mocap data
 * @param current - if the animationIngredient is visualized currently
 */
const createAnimationIngredient = (
  assetId: string,
  animationIngredientName: string,
  targetedAnimations: BABYLON.TargetedAnimation[],
  targets: (BABYLON.TransformNode | BABYLON.Mesh)[],
  isMocapAnimation: boolean,
  current: boolean,
): AnimationIngredient => {
  // add 'baseLayer//' in front of the baseLayer's id
  const layerId = `baseLayer//${getRandomStringKey()}`;

  const tracks: PlaskTrack[] = [];

  // 1) to maintain tracks's order 2) to handle animation with key only for one property
  // using the way creating empty tracks and then fill them
  targets.forEach((target) => {
    const positionTrack = createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|position`, layerId, target, 'position', [], isMocapAnimation);
    const rotationTrack = createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|rotation`, layerId, target, 'rotation', [], isMocapAnimation);
    // prettier-ignore
    const rotationQuaternionTrack = createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|rotationQuaternion`, layerId, target, 'rotationQuaternion', [], isMocapAnimation)
    const scalingTrack = createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|scaling`, layerId, target, 'scaling', [], isMocapAnimation);

    targetedAnimations
      .filter((targetAnimation) => targetAnimation.target.id === target.id)
      .forEach(({ target: t, animation: a }) => {
        if (a.targetProperty === 'position') {
          positionTrack.transformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // use integer frame
        } else if (a.targetProperty === 'rotationQuaternion') {
          const quaternionTransformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // use integer frame
          rotationQuaternionTrack.transformKeys = quaternionTransformKeys;

          const eulerTransformKeys: BABYLON.IAnimationKey[] = quaternionTransformKeys.map((transformKey) => {
            const q: BABYLON.Quaternion = transformKey.value;
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
};

export default createAnimationIngredient;
