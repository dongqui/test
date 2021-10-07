import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, ShootTrack } from 'types/common';
import { v4 as uuidv4 } from 'uuid';

// filterFunction params(beta, minCutoff)의 기본값
// mocap 결과물이 아닌 경우, 항등원 성격의 0, 0을 사용합니다.
const DEFAULT_BETA = 0;
const DEFAULT_MIN_CUTOFF = 0;
// mocap 결과물인 경우, 다시 position / rotationQuaternion으로 구분한 기본값을 사용합니다.
const MOCAP_POSITION_BETA = 0.12;
const MOCAP_POSITION_MIN_CUTOFF = 0.7;
const MOCAP_QUATERNION_BETA = 0.24;
const MOCAP_QUATERNION_MIN_CUTOFF = 1.4;

/**
 * 파일의 animationGroup을 사용해 Shoot 자체적으로 사용하는 구조의 데이터(AnimationIngredient)를 생성합니다.
 *
 * @param animationGroup - source로 사용할 파일의 animationGroup
 * @param isMocapAnimation - filter parameter 적용을 위한 mocap 결과물인지 여부
 */
const createAnimationIngredient = (
  assetId: string,
  animationGroup: BABYLON.AnimationGroup,
  isMocapAnimation: boolean,
): AnimationIngredient => {
  const baseLayerId = uuidv4();

  const tracks: ShootTrack[] = [];
  // animationGroup을 생성하기 위해 사용한 targetAnimations를 순회하며 Axis-depth의 트랙들을 구성합니다.
  animationGroup.targetedAnimations.forEach((targetAnimation) => {
    const { target, animation } = targetAnimation;
    if (animation.targetProperty === 'position') {
      const xTransformKeys: BABYLON.IAnimationKey[] = [];
      const yTransformKeys: BABYLON.IAnimationKey[] = [];
      const zTransformKeys: BABYLON.IAnimationKey[] = [];

      // Property-depth의 트랙들의 value들을 axis별로 분리합니다.
      animation.getKeys().forEach((key) => {
        xTransformKeys.push({ frame: key.frame, value: key.value.x });
        yTransformKeys.push({ frame: key.frame, value: key.value.y });
        zTransformKeys.push({ frame: key.frame, value: key.value.z });
      });

      const xTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|x`,
        property: 'position',
        axis: 'x',
        target, // 이후 targetAnimation을 생성을 위해 참조를 유지합니다.
        transformKeys: xTransformKeys,
        interpolationType: 'linear',
        useFilter: isMocapAnimation ? true : false, // mocap 결과물의 경우에만 기본으로 filter를 적용합니다.
        filterBeta: isMocapAnimation ? MOCAP_POSITION_BETA : DEFAULT_BETA,
        filterMinCutoff: isMocapAnimation ? MOCAP_POSITION_MIN_CUTOFF : DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      const yTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|y`,
        property: 'position',
        axis: 'y',
        target,
        transformKeys: yTransformKeys,
        interpolationType: 'linear',
        useFilter: isMocapAnimation ? true : false,
        filterBeta: isMocapAnimation ? MOCAP_POSITION_BETA : DEFAULT_BETA,
        filterMinCutoff: isMocapAnimation ? MOCAP_POSITION_MIN_CUTOFF : DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      const zTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|z`,
        property: 'position',
        axis: 'z',
        target,
        transformKeys: zTransformKeys,
        interpolationType: 'linear',
        useFilter: isMocapAnimation ? true : false,
        filterBeta: isMocapAnimation ? MOCAP_POSITION_BETA : DEFAULT_BETA,
        filterMinCutoff: isMocapAnimation ? MOCAP_POSITION_MIN_CUTOFF : DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      tracks.push(xTrack);
      tracks.push(yTrack);
      tracks.push(zTrack);
    } else if (animation.targetProperty === 'rotationQuaternion') {
      const xTransformKeys: BABYLON.IAnimationKey[] = [];
      const yTransformKeys: BABYLON.IAnimationKey[] = [];
      const zTransformKeys: BABYLON.IAnimationKey[] = [];
      const wTransformKeys: BABYLON.IAnimationKey[] = [];

      animation.getKeys().forEach((key) => {
        xTransformKeys.push({ frame: key.frame, value: key.value.x });
        yTransformKeys.push({ frame: key.frame, value: key.value.y });
        zTransformKeys.push({ frame: key.frame, value: key.value.z });
        wTransformKeys.push({ frame: key.frame, value: key.value.w });
      });

      const xTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|x`,
        property: 'rotationQuaternion',
        axis: 'x',
        target,
        transformKeys: xTransformKeys,
        interpolationType: 'linear',
        useFilter: isMocapAnimation ? true : false,
        filterBeta: isMocapAnimation ? MOCAP_QUATERNION_BETA : DEFAULT_BETA,
        filterMinCutoff: isMocapAnimation ? MOCAP_QUATERNION_MIN_CUTOFF : DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      const yTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|y`,
        property: 'rotationQuaternion',
        axis: 'y',
        target,
        transformKeys: yTransformKeys,
        interpolationType: 'linear',
        useFilter: isMocapAnimation ? true : false,
        filterBeta: isMocapAnimation ? MOCAP_QUATERNION_BETA : DEFAULT_BETA,
        filterMinCutoff: isMocapAnimation ? MOCAP_QUATERNION_MIN_CUTOFF : DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      const zTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|z`,
        property: 'rotationQuaternion',
        axis: 'z',
        target,
        transformKeys: zTransformKeys,
        interpolationType: 'linear',
        useFilter: isMocapAnimation ? true : false,
        filterBeta: isMocapAnimation ? MOCAP_QUATERNION_BETA : DEFAULT_BETA,
        filterMinCutoff: isMocapAnimation ? MOCAP_QUATERNION_MIN_CUTOFF : DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      const wTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|w`,
        property: 'rotationQuaternion',
        axis: 'w',
        target,
        transformKeys: wTransformKeys,
        interpolationType: 'linear',
        useFilter: isMocapAnimation ? true : false,
        filterBeta: isMocapAnimation ? MOCAP_QUATERNION_BETA : DEFAULT_BETA,
        filterMinCutoff: isMocapAnimation ? MOCAP_QUATERNION_MIN_CUTOFF : DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      tracks.push(xTrack);
      tracks.push(yTrack);
      tracks.push(zTrack);
      tracks.push(wTrack);
    } else if (animation.targetProperty === 'scaling') {
      const xTransformKeys: BABYLON.IAnimationKey[] = [];
      const yTransformKeys: BABYLON.IAnimationKey[] = [];
      const zTransformKeys: BABYLON.IAnimationKey[] = [];

      animation.getKeys().forEach((key) => {
        xTransformKeys.push({ frame: key.frame, value: key.value.x });
        yTransformKeys.push({ frame: key.frame, value: key.value.y });
        zTransformKeys.push({ frame: key.frame, value: key.value.z });
      });

      const xTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|x`,
        property: 'scaling',
        axis: 'x',
        target,
        transformKeys: xTransformKeys,
        interpolationType: 'linear',
        useFilter: false,
        filterBeta: DEFAULT_BETA,
        filterMinCutoff: DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      const yTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|y`,
        property: 'scaling',
        axis: 'y',
        target,
        transformKeys: yTransformKeys,
        interpolationType: 'linear',
        useFilter: false,
        filterBeta: DEFAULT_BETA,
        filterMinCutoff: DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      const zTrack: ShootTrack = {
        targetId: target.id,
        layerId: baseLayerId,
        name: `${animation.name}|z`,
        property: 'scaling',
        axis: 'z',
        target,
        transformKeys: zTransformKeys,
        interpolationType: 'linear',
        useFilter: false,
        filterBeta: DEFAULT_BETA,
        filterMinCutoff: DEFAULT_MIN_CUTOFF,
        isIncluded: true,
        isLocked: false,
      };

      tracks.push(xTrack);
      tracks.push(yTrack);
      tracks.push(zTrack);
    }
    // 전처리를 끝낸 source animation은 타겟의 애니메이션 목록에서 지워줍니다.
    target.animations = target.animations.filter(
      (animation: BABYLON.Animation) => animation !== animation,
    );
  });

  const animationIngredient = {
    id: uuidv4(),
    name: animationGroup.name,
    assetId,
    tracks,
    layers: [{ id: baseLayerId, name: 'layer1' }],
  };

  return animationIngredient;
};

export default createAnimationIngredient;
