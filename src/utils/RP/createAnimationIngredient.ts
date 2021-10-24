import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, ShootProperty, ShootTrack } from 'types/common';
import { v4 as uuidv4 } from 'uuid';

// filterFunction params(beta, minCutoff)의 기본값
// mocap 결과물이 아닌 경우, 항등원 성격의 0, 0을 사용합니다.
const DEFAULT_BETA = 0.0;
const DEFAULT_MIN_CUTOFF = 1.0;
// mocap 결과물인 경우, 다시 position / rotationQuaternion으로 구분한 기본값을 사용합니다.
const MOCAP_POSITION_BETA = 0.002;
const MOCAP_POSITION_MIN_CUTOFF = 0.05;
const MOCAP_QUATERNION_BETA = 0.3;
const MOCAP_QUATERNION_MIN_CUTOFF = 3.0;

type Axis = 'x' | 'y' | 'z';
type QuaternionAxis = Axis | 'w';

const createTrack = (
  name: string,
  layerId: string,
  target: any,
  property: ShootProperty,
  transformKeys: BABYLON.IAnimationKey[],
  isMocapAnimation: boolean,
): ShootTrack => {
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
    targetId: target.id,
    layerId,
    name,
    property,
    target, // 이후 targetAnimation을 생성을 위해 참조를 유지합니다.
    transformKeys,
    interpolationType: 'linear',
    useFilter: isMocapAnimation ? true : false, // mocap 결과물의 경우에만 기본으로 filter를 적용합니다.
    filterBeta,
    filterMinCutoff,
    isIncluded: true,
    isLocked: false,
  };
};

/**
 * 파일의 animationGroup을 사용해 Shoot 자체적으로 사용하는 구조의 데이터(AnimationIngredient)를 생성합니다.
 * @param assetId - 본 애니메이션의 대상 asset
 * @param animationGroup - source로 사용할 파일의 animationGroup
 * @param isMocapAnimation - filter parameter 적용을 위한 mocap 결과물인지 여부
 * @param current - 현재 scene에서 사용 중인지 여부
 */
const createAnimationIngredient = (
  assetId: string,
  animationGroup: BABYLON.AnimationGroup,
  isMocapAnimation: boolean,
  current: boolean,
): AnimationIngredient => {
  const layerId = uuidv4();

  const tracks: ShootTrack[] = [];
  // animationGroup을 생성하기 위해 사용한 targetAnimations를 순회하며 Property-depth의 트랙들을 구성합니다.
  animationGroup.targetedAnimations.forEach((targetAnimation) => {
    const { target, animation } = targetAnimation;
    if (animation.targetProperty === 'position') {
      // position 트랙들 전처리
      tracks.push(
        createTrack(
          `${animation.name}`,
          layerId,
          target,
          'position',
          animation.getKeys(),
          isMocapAnimation,
        ),
      );
    } else if (animation.targetProperty === 'rotationQuaternion') {
      const quaternionTransformKeys = animation.getKeys();

      const eulerTransformKeys: BABYLON.IAnimationKey[] = quaternionTransformKeys.map(
        (transformKey) => {
          const q: BABYLON.Quaternion = transformKey.value;
          const e = q.normalize().toEulerAngles();
          return { frame: transformKey.frame, value: e };
        },
      );

      // rotationQuaternion 트랙들 전처리
      tracks.push(
        createTrack(
          `${animation.name}`,
          layerId,
          target,
          'rotationQuaternion',
          quaternionTransformKeys,
          isMocapAnimation,
        ),
      );

      // rotation 트랙들 전처리
      tracks.push(
        createTrack(
          `${animation.name}`,
          layerId,
          target,
          'rotation',
          eulerTransformKeys,
          isMocapAnimation,
        ),
      );
    } else if (animation.targetProperty === 'scaling') {
      tracks.push(
        createTrack(
          `${animation.name}`,
          layerId,
          target,
          'scaling',
          animation.getKeys(),
          isMocapAnimation,
        ),
      );
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
    current,
    tracks,
    layers: [{ id: layerId, name: 'layer1' }],
  };

  return animationIngredient;
};

export default createAnimationIngredient;
