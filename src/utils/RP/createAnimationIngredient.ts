import * as BABYLON from '@babylonjs/core';
import { round } from 'lodash';
import { AnimationIngredient, PlaskLayer, PlaskTrack } from 'types/common';
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

  // 1) track간 순서가 일정하도록 2) 하나의 property에 대해서만 키가 찍힌 애니메이션도 대응할 수 있도록
  // 미리 빈 트랙들을 생성한 후 다시 채워넣는 방식을 사용
  // empty motion의 경우 targetedAnimations를 빈 채로 넘겨주어, targets들을 대상으로 하는 빈 트랙들만을 가지도록 구성합니다.
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
          positionTrack.transformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // integer frame 사용
        } else if (a.targetProperty === 'rotationQuaternion') {
          const quaternionTransformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // integer frame 사용
          rotationQuaternionTrack.transformKeys = quaternionTransformKeys;

          const eulerTransformKeys: BABYLON.IAnimationKey[] = quaternionTransformKeys.map((transformKey) => {
            const q: BABYLON.Quaternion = transformKey.value;
            const e = q.toEulerAngles();
            return { frame: transformKey.frame, value: e };
          });
          rotationTrack.transformKeys = eulerTransformKeys;
        } else if (a.targetProperty === 'scaling') {
          scalingTrack.transformKeys = a.getKeys().map((key) => ({ frame: round(key.frame * 30), value: key.value })); // integer frame 사용
        }
      });

    tracks.push(positionTrack);
    tracks.push(rotationTrack);
    tracks.push(rotationQuaternionTrack);
    tracks.push(scalingTrack);
  });

  const baseLayer: PlaskLayer = { id: layerId, name: 'Base Layer', isIncluded: true, tracks };

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
