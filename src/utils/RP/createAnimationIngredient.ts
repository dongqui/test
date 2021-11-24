import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, PlaskTrack } from 'types/common';
import { getRandomStringKey } from 'utils/common';
import createPlaskTrack from './createPlaskTrack';

/**
 * 파일의 animationGroup을 사용해 Plask 자체적으로 사용하는 구조의 데이터(AnimationIngredient)를 생성합니다.
 *
 * @param assetId - 본 애니메이션의 대상 asset
 * @param animationGroup - source로 사용할 파일의 animationGroup
 * @param isMocapAnimation - filter parameter 적용을 위한 mocap 결과물인지 여부
 * @param current - 현재 scene에서 사용 중인지 여부
 */
const createAnimationIngredient = (assetId: string, animationGroup: BABYLON.AnimationGroup, isMocapAnimation: boolean, current: boolean): AnimationIngredient => {
  // base layer에 대해서는 id 앞에 baseLayer// 를 추가
  const layerId = `baseLayer//${getRandomStringKey()}`;

  const tracks: PlaskTrack[] = [];
  // animationGroup을 생성하기 위해 사용한 targetAnimations를 순회하며 Property-depth의 트랙들을 구성합니다.
  animationGroup.targetedAnimations.forEach((targetAnimation) => {
    const { target, animation } = targetAnimation;
    if (animation.targetProperty === 'position') {
      // position 트랙들 전처리
      tracks.push(createPlaskTrack(`${animation.name}`, layerId, target, 'position', animation.getKeys(), isMocapAnimation));
    } else if (animation.targetProperty === 'rotationQuaternion') {
      const quaternionTransformKeys = animation.getKeys();

      const eulerTransformKeys: BABYLON.IAnimationKey[] = quaternionTransformKeys.map((transformKey) => {
        const q: BABYLON.Quaternion = transformKey.value;
        const e = q.normalize().toEulerAngles();
        return { frame: transformKey.frame, value: e };
      });

      // rotationQuaternion 트랙들 전처리
      tracks.push(createPlaskTrack(`${animation.name}`, layerId, target, 'rotationQuaternion', quaternionTransformKeys, isMocapAnimation));

      // rotation 트랙들 전처리
      tracks.push(createPlaskTrack(`${animation.name}`, layerId, target, 'rotation', eulerTransformKeys, isMocapAnimation));
    } else if (animation.targetProperty === 'scaling') {
      tracks.push(createPlaskTrack(`${animation.name}`, layerId, target, 'scaling', animation.getKeys(), isMocapAnimation));
    }
    // 전처리를 끝낸 source animation은 타겟의 애니메이션 목록에서 지워줍니다.
    target.animations = target.animations.filter((animation: BABYLON.Animation) => animation !== animation);
  });

  const animationIngredient = {
    id: getRandomStringKey(),
    name: animationGroup.name,
    assetId,
    current,
    tracks,
    layers: [{ id: layerId, name: 'Base Layer' }],
  };

  return animationIngredient;
};

export default createAnimationIngredient;
