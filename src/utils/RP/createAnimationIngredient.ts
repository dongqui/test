import * as BABYLON from '@babylonjs/core';
import { round } from 'lodash';
import { AnimationIngredient, PlaskTrack } from 'types/common';
import { getRandomStringKey } from 'utils/common';
import createPlaskTrack from './createPlaskTrack';

/**
 * 파일의 animationGroup을 사용해 Plask 자체적으로 사용하는 구조의 데이터(AnimationIngredient)를 생성합니다.
 * 또한 targets로 전달받은 대상 중 animationGroup 내 트랙을 가지고 있지 않은 대상들에 대해서는 빈 트랙을 추가합니다.
 * (빈 애니메이션의 경우 targets로 빈 배열을 넘겨주어 생성할 수 있습니다.)
 *
 * @param assetId - 본 애니메이션의 대상 asset
 * @param animationIngredientName - 애니메이션의 이름
 * @param targetedAnimations - source로 사용할 파일의 animationGroup.targetedAnimations
 * @param targets - 애니메이션의 target을 의미하며, transformNode 혹은 mesh 타입이 될 수 있습니다.
 * @param isMocapAnimation - filter parameter 적용을 위한 mocap 결과물인지 여부
 * @param current - 현재 scene에서 사용 중인지 여부
 */
const createAnimationIngredient = (
  assetId: string,
  animationIngredientName: string,
  targetedAnimations: BABYLON.TargetedAnimation[],
  targets: (BABYLON.TransformNode | BABYLON.Mesh)[],
  isMocapAnimation: boolean,
  current: boolean,
): AnimationIngredient => {
  // base layer에 대해서는 id 앞에 baseLayer// 를 추가
  const layerId = `baseLayer//${getRandomStringKey()}`;

  const tracks: PlaskTrack[] = [];
  // (animationGroup을 생성하기 위해 사용한) targetedAnimations를 순회하며 Property-depth의 트랙들을 구성합니다.
  targetedAnimations.forEach((targetAnimation) => {
    const { target, animation } = targetAnimation;
    if (animation.targetProperty === 'position') {
      // position 트랙들 전처리
      tracks.push(
        createPlaskTrack(
          `${animation.name}`,
          layerId,
          target,
          'position',
          animation.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })), // integer frame 사용
          isMocapAnimation,
        ),
      );
    } else if (animation.targetProperty === 'rotationQuaternion') {
      const quaternionTransformKeys = animation.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // integer frame 사용

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
      tracks.push(
        createPlaskTrack(
          `${animation.name}`,
          layerId,
          target,
          'scaling',
          animation.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })), // integer frame 사용
          isMocapAnimation,
        ),
      );
    }
    // 전처리를 끝낸 source animation은 타겟의 애니메이션 목록에서 지워줍니다.
    target.animations = target.animations.filter((animation: BABYLON.Animation) => animation !== animation);
  });

  // targets 중 animationGroup에 속하지 않는 경우에는 빈 트랙을 추가합니다.
  // empty motion의 경우 targetedAnimations를 빈 채로 넘겨주어, targets들을 대상으로 하는 빈 트랙들만을 가지도록 구성합니다.
  targets.forEach((target) => {
    // targetedAnimations에 속하는지 않는 경우에만
    if (!targetedAnimations.find((targetedAnimation) => targetedAnimation.target.id === target.id)) {
      tracks.push(createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|position`, layerId, target, 'position', [], isMocapAnimation));
      tracks.push(createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|rotation`, layerId, target, 'rotation', [], isMocapAnimation));
      // prettier-ignore
      tracks.push(createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|rotationQuaternion`, layerId, target, 'rotationQuaternion', [], isMocapAnimation));
      tracks.push(createPlaskTrack(`${animationIngredientName}|baseLayer|${target.name}|scaling`, layerId, target, 'scaling', [], isMocapAnimation));
    }
  });

  const animationIngredient = {
    id: getRandomStringKey(),
    name: animationIngredientName,
    assetId,
    current,
    tracks,
    layers: [{ id: layerId, name: 'Base Layer' }],
  };

  return animationIngredient;
};

export default createAnimationIngredient;
